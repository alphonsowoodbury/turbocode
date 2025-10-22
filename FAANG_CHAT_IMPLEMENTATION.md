# FAANG-Quality AI Chat Implementation Blueprint

**Status**: Phase 1 Complete (Memory Models + Service)
**Last Updated**: 2025-10-20

## Overview

This document outlines the complete implementation plan for upgrading Turbo's AI chat to FAANG-quality with long-term memory, knowledge graph integration, streaming responses, and intelligent context management.

---

## Phase 1: Memory System ✅ COMPLETE

### Components Implemented

1. **Database Models** (`turbo/core/models/conversation_memory.py`)
   - `ConversationMemory`: Stores extracted facts, preferences, decisions, insights
   - `ConversationSummary`: Stores condensed conversation segments

2. **Memory Service** (`turbo/core/services/conversation_memory.py`)
   - Memory extraction using Claude API
   - Semantic search for relevant memories
   - Conversation summarization
   - Temporal decay for old memories

### Features
- ✅ Semantic embeddings using `all-MiniLM-L6-v2` (384-dim)
- ✅ Importance scoring (0.0 to 1.0)
- ✅ Entity tracking (issues, projects, documents)
- ✅ Temporal relevance decay
- ✅ Access pattern tracking

---

## Phase 2: Context Manager Service

### File: `turbo/core/services/conversation_context.py`

```python
"""Context manager for intelligent conversation window management."""

from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.services.conversation_memory import ConversationMemoryService
from turbo.core.services.graph import GraphService


class ConversationContextManager:
    """
    Manages conversation context with intelligent windowing.

    Token Budget: ~6000 tokens
    - Recent messages (last 5): Full detail (1500 tokens)
    - Mid-range messages (6-20): Summaries (1000 tokens)
    - Old messages (21+): Key facts from memories (500 tokens)
    - Related entities: Auto-fetched from graph (2000 tokens)
    - Long-term memory: User preferences, patterns (1000 tokens)
    """

    def __init__(
        self,
        db: AsyncSession,
        memory_service: ConversationMemoryService,
        graph_service: GraphService
    ):
        self.db = db
        self.memory_service = memory_service
        self.graph_service = graph_service

    async def build_context(
        self,
        entity_type: str,
        entity_id: UUID,
        current_message: str,
        max_tokens: int = 6000
    ) -> dict[str, Any]:
        """
        Build optimized conversation context.

        Returns:
            dict with:
                - recent_messages: Last 5 messages (full)
                - conversation_summary: Summary of messages 6-20
                - key_facts: Important facts from old messages
                - related_entities: Entities from knowledge graph
                - memories: Relevant long-term memories
                - user_context: Active projects, issues
        """
        # 1. Get all messages
        messages = await self._get_messages(entity_type, entity_id, limit=100)

        # 2. Recent messages (last 5) - full detail
        recent_messages = messages[-5:] if len(messages) >= 5 else messages

        # 3. Mid-range summary (messages 6-20)
        conversation_summary = None
        if len(messages) > 20:
            midrange = messages[-20:-5]
            conversation_summary = await self.memory_service.get_or_create_summary(
                entity_type=entity_type,
                entity_id=entity_id,
                message_range_start=len(messages) - 20,
                message_range_end=len(messages) - 5,
                messages=[self._message_to_dict(m) for m in midrange]
            )

        # 4. Key facts from old messages (21+)
        key_facts = []
        if len(messages) > 20:
            old_messages = messages[:-20]
            # Extract memories if not already done
            memories = await self.memory_service.get_relevant_memories(
                entity_type=entity_type,
                entity_id=entity_id,
                query_text=current_message,
                limit=5
            )
            key_facts = [m.content for m in memories if m.memory_type in ["fact", "decision"]]

        # 5. Search knowledge graph for related entities
        related_entities = await self._search_graph_for_related(
            messages=messages,
            current_message=current_message
        )

        # 6. Get relevant long-term memories
        memories = await self.memory_service.get_relevant_memories(
            entity_type=entity_type,
            entity_id=entity_id,
            query_text=current_message,
            limit=5
        )

        # 7. User context (active work)
        user_context = await self._get_user_context()

        return {
            "recent_messages": recent_messages,
            "conversation_summary": conversation_summary,
            "key_facts": key_facts,
            "related_entities": related_entities,
            "memories": memories,
            "user_context": user_context
        }

    async def _search_graph_for_related(
        self,
        messages: list,
        current_message: str
    ) -> dict[str, list]:
        """
        Extract entities from messages and find related content from graph.
        """
        # Extract entity references from messages
        entity_ids = self._extract_entity_ids(messages + [{"content": current_message}])

        related = {
            "issues": [],
            "projects": [],
            "documents": [],
            "milestones": []
        }

        # For each mentioned entity, get related entities from graph
        for entity_type, ids in entity_ids.items():
            for entity_id in ids[:3]:  # Limit to 3 per type
                try:
                    related_results = await self.graph_service.get_related_entities(
                        entity_id=entity_id,
                        entity_type=entity_type,
                        limit=2
                    )
                    related[entity_type].extend(related_results)
                except Exception as e:
                    logger.warning(f"Failed to get related entities: {e}")

        return related

    def _extract_entity_ids(self, messages: list) -> dict[str, list]:
        """
        Extract entity UUIDs from message content.

        Looks for patterns like:
        - "issue #uuid"
        - "project uuid"
        - "@document/uuid"
        """
        import re

        # UUID regex pattern
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

        entity_ids = {
            "issue": [],
            "project": [],
            "document": [],
            "milestone": []
        }

        for msg in messages:
            content = msg.get("content", "")

            # Look for entity mentions
            for entity_type in entity_ids.keys():
                pattern = rf'{entity_type}\s+({uuid_pattern})'
                matches = re.findall(pattern, content, re.IGNORECASE)
                entity_ids[entity_type].extend(matches)

        # Deduplicate
        for key in entity_ids:
            entity_ids[key] = list(set(entity_ids[key]))

        return entity_ids
```

---

## Phase 3: Enhanced Webhook Integration

### File Updates: `scripts/claude_webhook_server.py`

**Add import**:
```python
from turbo.core.services.conversation_context import ConversationContextManager
from turbo.core.services.conversation_memory import ConversationMemoryService
```

**Update `fetch_staff_context()` function**:
```python
async def fetch_enhanced_staff_context(staff_id: str) -> dict[str, Any]:
    """
    Fetch enhanced context with memory and knowledge graph integration.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Get database session (you'll need to add this)
        from turbo.core.database.connection import get_db_session

        async for db in get_db_session():
            # Initialize services
            graph_service = GraphService()
            memory_service = ConversationMemoryService(db, ANTHROPIC_API_KEY)
            context_manager = ConversationContextManager(db, memory_service, graph_service)

            # Fetch staff details
            staff_response = await client.get(f"{TURBO_API_URL}/staff/{staff_id}")
            staff_response.raise_for_status()
            staff = staff_response.json()

            # Get current messages
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
                    "conversation_history": "_No previous conversation_",
                    "message_count": 0
                }

            # Get current message
            current_message = messages[-1]["content"] if messages else ""

            # Build enhanced context
            context = await context_manager.build_context(
                entity_type="staff",
                entity_id=UUID(staff_id),
                current_message=current_message
            )

            # Format for webhook prompt
            return {
                "staff": staff,
                "context": context,
                "message_count": len(messages)
            }
```

**Update staff prompt in `build_entity_prompt()`**:
```python
elif entity_type == "staff":
    staff = extra_context.get("staff", {})
    context = extra_context.get("context", {})

    # Format recent messages
    recent_messages = context.get("recent_messages", [])
    recent_text = "\n\n".join([
        f"**{'User' if msg['message_type'] == 'user' else 'Staff'}:** {msg['content']}"
        for msg in recent_messages
    ])

    # Format conversation summary
    summary = context.get("conversation_summary")
    summary_text = ""
    if summary:
        summary_text = f"""
## Previous Conversation Summary (Messages {summary.message_range_start}-{summary.message_range_end})

{summary.summary_text}

**Key Topics**: {', '.join(summary.key_topics)}
"""

    # Format long-term memories
    memories = context.get("memories", [])
    memory_text = ""
    if memories:
        memory_items = "\n".join([
            f"- [{m.memory_type.upper()}] {m.content} (importance: {m.importance:.1f})"
            for m in memories
        ])
        memory_text = f"""
## Long-term Memory

{memory_items}
"""

    # Format related entities
    related = context.get("related_entities", {})
    related_text = ""
    if any(related.values()):
        related_text = "## Related Context\n\n"
        for entity_type, entities in related.items():
            if entities:
                related_text += f"**{entity_type.title()}**: {len(entities)} related items\n"

    user_prompt = f"""A user has sent you a message. You are "{staff['name']}", a {staff['role_type']} staff member.

## Your Persona
{staff['persona']}

{summary_text}

{memory_text}

{related_text}

## Recent Conversation
{recent_text}

## Your Task
Respond to the user's latest message with:
- Full awareness of conversation history and context
- Reference to relevant memories and past discussions when appropriate
- Integration of related entities and knowledge graph information
- Your characteristic persona and communication style
"""
```

---

## Phase 4: Streaming SSE Support

### Backend: `turbo/api/v1/endpoints/staff.py`

```python
from sse_starlette.sse import EventSourceResponse


@router.post("/{staff_id}/messages/stream")
async def stream_staff_response(
    staff_id: UUID,
    message_request: SendMessageRequest,
    request: Request,
    staff_service: StaffService = Depends(get_staff_service),
) -> EventSourceResponse:
    """
    Stream staff response in real-time using Server-Sent Events.
    """
    # Save user message
    user_message = await staff_service.add_user_message(
        staff_id=staff_id,
        content=message_request.content,
        is_group_discussion=False,
        group_discussion_id=None,
    )

    async def event_generator():
        try:
            # Trigger webhook but stream response
            webhook_service = get_webhook_service()

            # Stream from webhook (webhook needs to support streaming)
            async for chunk in webhook_service.stream_entity_response(
                "staff",
                staff_id
            ):
                if await request.is_disconnected():
                    break

                yield {
                    "event": "message",
                    "data": json.dumps({"content": chunk})
                }

            yield {
                "event": "done",
                "data": json.dumps({"status": "complete"})
            }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())
```

### Frontend: `frontend/hooks/use-staff-streaming.ts`

```typescript
import { useState, useCallback } from "react";

export function useStaffStreaming(staffId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendStreamingMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamedContent("");
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8001/api/v1/staff/${staffId}/messages/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                setStreamedContent((prev) => prev + data.content);
              }

              if (data.error) {
                setError(data.error);
                setIsStreaming(false);
                return;
              }
            }

            if (line.includes("event: done")) {
              setIsStreaming(false);
              return;
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsStreaming(false);
      }
    },
    [staffId]
  );

  return {
    sendStreamingMessage,
    isStreaming,
    streamedContent,
    error,
  };
}
```

---

## Phase 5: Database Migration

### Create Migration: `alembic/versions/xxx_add_conversation_memory.py`

```python
"""Add conversation memory tables

Revision ID: xxx
Revises: previous_revision
Create Date: 2025-10-20

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'conversation_memory_001'
down_revision = 'previous_revision'  # Update with actual previous revision
branch_labels = None
depends_on = None


def upgrade():
    # Create conversation_memories table
    op.create_table(
        'conversation_memories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('entity_type', sa.String(20), nullable=False, index=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('memory_type', sa.String(50), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('importance', sa.Float, nullable=False, server_default='0.5'),
        sa.Column('relevance_score', sa.Float, nullable=False, server_default='1.0'),
        sa.Column('entities_mentioned', postgresql.JSON, nullable=True),
        sa.Column('embedding', postgresql.ARRAY(sa.Float), nullable=True),
        sa.Column('source_message_ids', postgresql.JSON, nullable=True),
        sa.Column('first_mentioned_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_accessed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('access_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('importance >= 0 AND importance <= 1', name='ck_importance_range'),
        sa.CheckConstraint('relevance_score >= 0 AND relevance_score <= 1', name='ck_relevance_range'),
    )

    op.create_index('ix_memory_entity_type_id', 'conversation_memories', ['entity_type', 'entity_id'])
    op.create_index('ix_memory_type', 'conversation_memories', ['memory_type'])
    op.create_index('ix_memory_importance', 'conversation_memories', ['importance'])

    # Create conversation_summaries table
    op.create_table(
        'conversation_summaries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('entity_type', sa.String(20), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('summary_text', sa.Text, nullable=False),
        sa.Column('message_range_start', sa.Integer, nullable=False),
        sa.Column('message_range_end', sa.Integer, nullable=False),
        sa.Column('message_count', sa.Integer, nullable=False),
        sa.Column('key_topics', postgresql.JSON, nullable=True),
        sa.Column('entities_discussed', postgresql.JSON, nullable=True),
        sa.Column('decisions_made', postgresql.JSON, nullable=True),
        sa.Column('embedding', postgresql.ARRAY(sa.Float), nullable=True),
        sa.Column('time_range_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_range_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index('ix_summary_entity_type_id', 'conversation_summaries', ['entity_type', 'entity_id'])
    op.create_index('ix_summary_message_range', 'conversation_summaries', ['message_range_start', 'message_range_end'])


def downgrade():
    op.drop_table('conversation_summaries')
    op.drop_table('conversation_memories')
```

---

## Implementation Checklist

### Phase 1: Memory System ✅
- [x] Create `ConversationMemory` model
- [x] Create `ConversationSummary` model
- [x] Create `ConversationMemoryService`
- [x] Add embedding generation
- [x] Add semantic search for memories
- [x] Add conversation summarization

### Phase 2: Context Manager 🔄
- [ ] Create `ConversationContextManager` service
- [ ] Implement smart message windowing
- [ ] Integrate knowledge graph search
- [ ] Add entity extraction from messages
- [ ] Build composite context structure

### Phase 3: Webhook Integration 🔄
- [ ] Update `fetch_staff_context()` with enhanced context
- [ ] Update staff prompts with memory integration
- [ ] Add periodic memory extraction task
- [ ] Test end-to-end memory flow

### Phase 4: Streaming Support 🔄
- [ ] Add SSE endpoint in staff API
- [ ] Create streaming hook in frontend
- [ ] Update chat UI for streaming
- [ ] Add loading states and error handling

### Phase 5: Database Migration 🔄
- [ ] Create Alembic migration file
- [ ] Test migration on development
- [ ] Run migration on production
- [ ] Verify indexes and constraints

### Phase 6: Testing & Optimization 🔄
- [ ] Unit tests for memory service
- [ ] Integration tests for context building
- [ ] Performance testing (embedding generation)
- [ ] Memory decay cron job
- [ ] Monitoring and logging

---

## Deployment Steps

1. **Run migration**:
   ```bash
   alembic upgrade head
   ```

2. **Rebuild containers**:
   ```bash
   docker-compose build --no-cache api webhook
   docker-compose restart api webhook
   ```

3. **Test memory extraction**:
   - Send several messages to a staff member
   - Check `conversation_memories` table
   - Verify embeddings are generated

4. **Monitor performance**:
   - Check API response times
   - Monitor memory usage
   - Check Neo4j query performance

---

## Performance Considerations

1. **Embedding Generation**:
   - Lazy load model (first use only)
   - Cache embeddings
   - Batch process when possible

2. **Memory Retrieval**:
   - Index on entity_type + entity_id
   - Limit search to top N memories
   - Apply temporal decay to reduce dataset

3. **Knowledge Graph**:
   - Use existing graph service
   - Cache related entities
   - Limit depth of relationship traversal

4. **Token Management**:
   - Monitor context window usage
   - Implement token counting
   - Adjust summary lengths dynamically

---

## Next Steps

**Immediate**:
1. Create database migration
2. Implement Context Manager service
3. Update webhook with enhanced context

**Short-term**:
4. Add streaming support
5. Update frontend UI
6. Add tests

**Long-term**:
7. Add analytics dashboard for memory usage
8. Implement automatic memory cleanup
9. Add memory export/import functionality
10. Build memory visualization tools
