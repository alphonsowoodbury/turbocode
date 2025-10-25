# Webhook Server Integration Guide

This guide shows how to integrate the new Context Manager and Memory services into the webhook server.

## Phase 1: Add Required Imports

Add these imports at the top of `scripts/claude_webhook_server.py`:

```python
# Add after existing imports
import sys
from pathlib import Path

# Add turbo to Python path (if not already present)
sys.path.insert(0, '/app')

from turbo.core.database.connection import get_db_session
from turbo.core.services.conversation_context import ConversationContextManager
from turbo.core.services.conversation_memory import ConversationMemoryService
from turbo.core.services.graph import GraphService
```

## Phase 2: Create Enhanced Context Fetch Function

Replace the existing `fetch_staff_context()` function with this enhanced version:

```python
async def fetch_enhanced_staff_context(staff_id: str) -> dict[str, Any]:
    """
    Fetch enhanced context with memory and knowledge graph integration.

    This replaces the old fetch_staff_context function.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Fetch staff details
        staff_response = await client.get(f"{TURBO_API_URL}/staff/{staff_id}")
        staff_response.raise_for_status()
        staff = staff_response.json()

        # Get messages to determine if we need enhanced context
        messages_response = await client.get(
            f"{TURBO_API_URL}/staff/{staff_id}/messages",
            params={"limit": 100}
        )
        messages_response.raise_for_status()
        messages_data = messages_response.json()
        messages = messages_data.get("messages", [])

        if not messages:
            return {
                "staff": staff,
                "context": None,
                "conversation_history": "_No previous conversation_",
                "message_count": 0
            }

        # Use async generator to get database session
        async for db in get_db_session():
            try:
                # Initialize services
                graph_service = GraphService()
                memory_service = ConversationMemoryService(db, ANTHROPIC_API_KEY)
                context_manager = ConversationContextManager(db, memory_service, graph_service)

                # Get current message
                current_message = messages[-1]["content"] if messages else ""

                # Build enhanced context
                context = await context_manager.build_context(
                    entity_type="staff",
                    entity_id=UUID(staff_id),
                    current_message=current_message
                )

                # Trigger memory extraction every 10 messages
                if len(messages) % 10 == 0 and len(messages) > 0:
                    await context_manager.trigger_memory_extraction(
                        entity_type="staff",
                        entity_id=UUID(staff_id)
                    )

                return {
                    "staff": staff,
                    "context": context,
                    "message_count": len(messages)
                }

            except Exception as e:
                logger.error(f"Failed to build enhanced context: {e}", exc_info=True)
                # Fallback to basic context
                conversation_lines = []
                for msg in messages[-20:]:
                    role = "User" if msg["message_type"] == "user" else "Staff"
                    conversation_lines.append(f"**{role}:** {msg['content']}\n")

                conversation_history = "\n".join(conversation_lines) if conversation_lines else "_No previous conversation_"

                return {
                    "staff": staff,
                    "context": None,
                    "conversation_history": conversation_history,
                    "message_count": len(messages)
                }

            finally:
                # Make sure to break after first iteration
                break
```

## Phase 3: Update Staff Prompt Building

Replace the `elif entity_type == "staff":` section in `build_entity_prompt()` with this:

```python
elif entity_type == "staff":
    staff = extra_context.get("staff", {})
    context = extra_context.get("context")

    staff_name = staff.get("name", "Unknown")
    staff_persona = staff.get("persona", "")
    staff_role = staff.get("role_type", "leadership")
    staff_capabilities = staff.get("capabilities", [])
    allowed_tools_from_db = staff.get("allowed_tools", ["list_projects", "get_project", "create_document"])

    # Build prompt based on whether we have enhanced context
    if context:
        # Enhanced context with memory and knowledge graph
        user_prompt = build_enhanced_staff_prompt(staff, context)
    else:
        # Fallback to basic context
        conversation_history = extra_context.get("conversation_history", "_No previous conversation_")
        user_prompt = build_basic_staff_prompt(staff, conversation_history)

    system_prompt = base_system_prompt + f"""
**Your Role as {staff_name}:**
You are a {staff_role} staff member in the organization:
- Adopt the staff member's defined persona and communication style
- Provide expert guidance within your domain
- Be direct, professional, and action-oriented
- Help coordinate work and remove blockers
- Provide strategic and tactical guidance
- You can discover projects and create documents - use list_projects to find project IDs, then create_document to produce deliverables
"""

    allowed_tools = allowed_tools_from_db
```

## Phase 4: Add Prompt Builder Helper Functions

Add these helper functions before `build_entity_prompt()`:

```python
def build_enhanced_staff_prompt(staff: dict, context: dict) -> str:
    """
    Build enhanced staff prompt with full context integration.

    Args:
        staff: Staff member data
        context: Enhanced context from ConversationContextManager

    Returns:
        Formatted user prompt
    """
    staff_name = staff.get("name", "Unknown")
    staff_persona = staff.get("persona", "")
    staff_role = staff.get("role_type", "leadership")
    staff_capabilities = staff.get("capabilities", [])

    # 1. Format recent messages
    recent_messages = context.get("recent_messages", [])
    recent_text = "\n\n".join([
        f"**{'User' if msg['message_type'] == 'user' else 'Staff'}:** {msg['content']}"
        for msg in recent_messages
    ])

    # 2. Format conversation summary (if available)
    summary = context.get("conversation_summary")
    summary_text = ""
    if summary:
        summary_text = f"""
## Previous Conversation Summary (Messages {summary['message_range']})

{summary['summary_text']}

**Key Topics Discussed**: {', '.join(summary.get('key_topics', []))}
"""
        if summary.get('decisions'):
            summary_text += f"\n**Decisions Made**: {', '.join(summary['decisions'])}\n"

    # 3. Format long-term memories
    memories = context.get("memories", [])
    memory_text = ""
    if memories:
        memory_items = "\n".join([
            f"- **[{m['type'].upper()}]** {m['content']} (importance: {m['importance']:.1f}, relevance: {m['relevance']:.1f})"
            for m in memories
        ])
        memory_text = f"""
## Long-term Memory & Key Facts

{memory_items}
"""

    # 4. Format related entities from knowledge graph
    related = context.get("related_entities", {})
    related_text = ""
    if any(related.values()):
        related_text = "## Related Work Context\n\n"

        for entity_type, entities in related.items():
            if entities:
                related_text += f"**Related {entity_type.title()}**:\n"
                for entity in entities[:3]:  # Limit to top 3
                    if entity_type == "issues":
                        related_text += f"  - {entity.get('title', 'Unknown')} [{entity.get('status', '')}] (priority: {entity.get('priority', 'medium')})\n"
                    elif entity_type == "projects":
                        related_text += f"  - {entity.get('name', 'Unknown')} [{entity.get('status', '')}] ({entity.get('completion', 0)}% complete)\n"
                    elif entity_type == "documents":
                        related_text += f"  - {entity.get('title', 'Unknown')} ({entity.get('type', 'document')})\n"
                    elif entity_type == "milestones":
                        due = entity.get('due_date', 'No due date')
                        related_text += f"  - {entity.get('name', 'Unknown')} [due: {due}]\n"
                related_text += "\n"

    # 5. Format user's active work
    user_context = context.get("user_context", {})
    active_work_text = ""
    if user_context.get("active_projects") or user_context.get("active_issues"):
        active_work_text = "## Current Active Work\n\n"

        if user_context.get("active_projects"):
            active_work_text += "**Active Projects**:\n"
            for proj in user_context["active_projects"][:3]:
                active_work_text += f"  - {proj['name']} [{proj['status']}] ({proj.get('completion', 0)}% complete)\n"
            active_work_text += "\n"

        if user_context.get("active_issues"):
            active_work_text += "**In-Progress Issues**:\n"
            for issue in user_context["active_issues"][:3]:
                active_work_text += f"  - {issue['title']} [{issue['status']}] (priority: {issue['priority']})\n"
            active_work_text += "\n"

    # 6. Build final prompt
    metadata = context.get("metadata", {})
    context_stats = f"(Total messages: {context.get('total_message_count', 0)}, Memories: {metadata.get('memory_count', 0)}, Related entities: {metadata.get('related_count', 0)})"

    user_prompt = f"""A user has sent you a message. You are "{staff_name}", a {staff_role} staff member.

## Your Identity & Role

**Name**: {staff_name}
**Role**: {staff_role.replace('_', ' ').title()}

**Your Persona**:
{staff_persona}

**Your Capabilities**:
{', '.join(staff_capabilities) if staff_capabilities else 'General guidance and support'}

{summary_text}

{memory_text}

{related_text}

{active_work_text}

## Recent Conversation {context_stats}

{recent_text}

---

## Your Task

Respond to the user's latest message with:
- **Full awareness** of conversation history, summaries, and long-term memories
- **Reference to relevant context** when appropriate (past discussions, related work, decisions)
- **Integration of knowledge graph insights** (related entities, similar issues, connected projects)
- **Your characteristic persona** and communication style
- **Actionable guidance** within your domain expertise

**Context Note**: You have access to {context.get('total_message_count', 0)} total messages. The recent messages above are the latest exchange, but you also have summaries and memories from earlier parts of the conversation.

**Important**: All context is already provided above - respond directly without fetching additional data unless using your allowed tools.
"""

    return user_prompt


def build_basic_staff_prompt(staff: dict, conversation_history: str) -> str:
    """
    Build basic staff prompt (fallback when enhanced context unavailable).

    Args:
        staff: Staff member data
        conversation_history: Formatted conversation history string

    Returns:
        Formatted user prompt
    """
    staff_name = staff.get("name", "Unknown")
    staff_persona = staff.get("persona", "")
    staff_role = staff.get("role_type", "leadership")
    staff_capabilities = staff.get("capabilities", [])

    user_prompt = f"""A user has sent you a message. You are "{staff_name}", a {staff_role} staff member.

## Your Persona
{staff_persona}

## Your Capabilities
{', '.join(staff_capabilities) if staff_capabilities else 'General guidance'}

## Conversation History (Last 20 Messages)
{conversation_history}

## Your Task
Respond to the user's latest message as {staff_name}:
- Match the persona and communication style defined above
- Build naturally on the conversation history
- Provide expert guidance within your domain and capabilities
- Be direct, actionable, and professional
- Reference specific context when helpful

**Important**: The conversation history above is already complete - you do NOT need to call get_staff or get_staff_messages. Just respond based on the context provided.
"""

    return user_prompt
```

## Phase 5: Update handle_comment_webhook Function

In the `handle_comment_webhook()` function, replace the staff context fetching section:

```python
# OLD CODE (around line 1442-1450):
elif entity_type == "staff":
    try:
        logger.info(f"Fetching staff context for {entity_id}")
        extra_context = await fetch_staff_context(entity_id)
        logger.info(f"Fetched {extra_context['message_count']} messages for staff {entity_id}")
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch staff context: {e}")
        return web.json_response({"error": f"Failed to fetch staff context: {str(e)}"}, status=500)

# NEW CODE:
elif entity_type == "staff":
    try:
        logger.info(f"Fetching enhanced staff context for {entity_id}")
        extra_context = await fetch_enhanced_staff_context(entity_id)
        logger.info(f"Fetched context with {extra_context['message_count']} messages for staff {entity_id}")
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch staff context: {e}")
        return web.json_response({"error": f"Failed to fetch staff context: {str(e)}"}, status=500)
```

## Phase 6: Add UUID Import

Make sure UUID is imported at the top:

```python
from uuid import UUID
```

## Testing the Integration

After making these changes:

1. **Rebuild webhook container**:
   ```bash
   docker-compose build webhook
   docker-compose restart webhook
   ```

2. **Test with a conversation**:
   - Send 5-10 messages to a staff member
   - Check webhook logs: `docker-compose logs webhook --tail=50`
   - Verify enhanced context is being built

3. **Check database**:
   - After 10+ messages, check if memories are being extracted:
     ```sql
     SELECT * FROM conversation_memories ORDER BY created_at DESC LIMIT 10;
     ```

4. **Verify knowledge graph integration**:
   - Mention issues/projects in conversation
   - Check if related entities appear in context

## Rollback Plan

If something breaks, you can quickly rollback:

1. Revert to old `fetch_staff_context()` function
2. Rebuild: `docker-compose build webhook && docker-compose restart webhook`
3. The old simple context will work without memory/graph features

## Performance Monitoring

Watch for:
- **Response time**: Should stay under 3-5 seconds
- **Memory usage**: Embedding model loads ~90MB first time
- **Database queries**: Monitor for slow queries on conversation_memories table
- **API costs**: Claude API calls for memory extraction

## Next Steps After Integration

Once integrated and stable:
1. Create database migration for memory tables
2. Add admin UI for viewing/managing memories
3. Implement memory decay cron job
4. Add streaming support for real-time responses
5. Build analytics dashboard for memory usage
