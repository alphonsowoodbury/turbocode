# Subagent UI Integration Guide

## Overview

The Turbo platform now includes full UI integration for AI subagents, allowing end users to invoke specialized Claude AI assistants directly from the interface.

## Architecture

```
User Interface (React)
    ↓
SubagentButton Component
    ↓
SubagentDialog Component
    ↓
React Hooks (use-subagent.ts)
    ↓
FastAPI Endpoints (/api/v1/subagents)
    ↓
Claude Service (Docker container)
    ↓
Anthropic Claude API or Claude Code CLI
```

## Components Created

### Frontend Components

#### 1. **SubagentDialog** (`frontend/components/subagent/subagent-dialog.tsx`)

Full-featured dialog for interacting with subagents:

- **Agent Selection View**: Browse all available subagents with their descriptions and capabilities
- **Prompt Configuration View**: Customize the request to the selected subagent
- **Response View**: See the subagent's analysis with markdown rendering

**Features:**
- Three-panel interface with smooth transitions
- Markdown rendering for rich responses
- Capability badges showing what each agent can do
- Back navigation between views
- Loading states and error handling

**Usage:**
```tsx
<SubagentDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  context={{ issue_id: "abc-123" }}
  suggestedAgent="issue-triager"
  suggestedPrompt="Analyze this issue..."
/>
```

#### 2. **SubagentButton** (`frontend/components/subagent/subagent-button.tsx`)

Reusable trigger button that opens the SubagentDialog:

**Features:**
- Customizable variant, size, and text
- Pre-configures agent and prompt suggestions
- Passes context automatically

**Usage:**
```tsx
<SubagentButton
  context={{ project_id: projectId }}
  suggestedAgent="project-manager"
  suggestedPrompt="Generate health report..."
  size="sm"
/>
```

### React Hooks

All hooks are in `frontend/hooks/use-subagent.ts`:

1. **`useSubagent(agentName)`** - Invoke a specific subagent
2. **`useSubagents(agentSet)`** - List available subagents
3. **`useInvokeSubagent()`** - General-purpose invocation
4. **`useSubagentHelpers()`** - Pre-built helper functions for common operations

### Backend API

#### Endpoints (`turbo/api/v1/endpoints/subagents.py`)

**`POST /api/v1/subagents/invoke`**
- Invokes a subagent with a prompt and context
- Forwards request to Claude service
- Returns analysis and recommended actions

**Request:**
```json
{
  "agent": "issue-triager",
  "prompt": "Analyze this issue...",
  "context": {
    "issue_id": "abc-123"
  },
  "agent_set": "turbo"
}
```

**Response:**
```json
{
  "agent": "issue-triager",
  "response": "## Analysis\n\nBased on the issue description...",
  "actions": [
    {
      "type": "update_priority",
      "params": {"priority": "high"}
    }
  ]
}
```

**`GET /api/v1/subagents/list?agent_set=turbo`**
- Lists all available subagents
- Filters by agent set (turbo vs turbodev)

**Response:**
```json
{
  "subagents": [
    {
      "name": "issue-triager",
      "description": "Analyze and organize issues",
      "capabilities": ["triage", "prioritize", "tag"],
      "agent_set": "turbo"
    }
  ]
}
```

## Page Integrations

### 1. Issue Detail Page (`frontend/app/issues/[id]/page.tsx`)

**Location:** In the metadata header, next to Edit and Favorite buttons

**Subagent:** `issue-triager`

**Default Prompt:** "Analyze this issue and suggest priority, type, tags, and any dependencies."

**Context Provided:**
```json
{
  "issue_id": "<current-issue-id>"
}
```

**Use Cases:**
- Auto-tag issues based on content
- Suggest appropriate priority level
- Identify dependencies with other issues
- Recommend refinements to unclear issues

---

### 2. Project Detail Page (`frontend/app/projects/[id]/page.tsx`)

**Location:** In the project header, next to status badges

**Subagent:** `project-manager`

**Default Prompt:** "Generate a comprehensive health report for this project including status, risks, and recommendations."

**Context Provided:**
```json
{
  "project_id": "<current-project-id>"
}
```

**Use Cases:**
- Project health analysis
- Risk identification
- Milestone planning recommendations
- Task prioritization guidance
- Initiative organization suggestions

---

### 3. Documents Page (`frontend/app/documents/page.tsx`)

**Location:** In the document viewer header, next to the favorite star

**Subagent:** `doc-curator`

**Default Prompt:** "Review this document for clarity, completeness, and suggest improvements."

**Context Provided:**
```json
{
  "document_id": "<selected-document-id>"
}
```

**Use Cases:**
- Documentation quality review
- Structure and clarity improvements
- Identify missing sections
- Suggest related documents to link
- Flag stale or outdated content

---

### 4. Discoveries Page (`frontend/app/discoveries/page.tsx`)

**Location:** In the controls bar, next to "New Discovery" button

**Subagent:** `discovery-guide`

**Default Prompt:** "Help me analyze my discovery issues and decide next steps for research topics."

**Context Provided:**
```json
{}
```
*(No specific context - analyzes all discoveries)*

**Use Cases:**
- Research topic analysis
- Decision support for proposed → approved transitions
- Convert discoveries to feature work
- Organize research findings
- Recommend next steps for open research

## Available Subagents

All 10 subagents from `subagents/registry.json`:

| Agent | Description | Primary Use Cases |
|-------|-------------|-------------------|
| **issue-triager** | Analyze and organize issues | Priority setting, tagging, dependency identification |
| **project-manager** | Help organize projects and milestones | Health reports, planning, task prioritization |
| **doc-curator** | Manage and improve documentation | Quality review, organization, gap identification |
| **task-scheduler** | Plan work and manage calendar | Scheduling, deadline tracking, workload balancing |
| **knowledge-connector** | Find relationships across entities | Semantic search, relationship mapping, gap analysis |
| **career-coach** | Job search and resume optimization | Resume tailoring, skill analysis, interview prep |
| **learning-curator** | Manage reading lists and learning | Reading order, learning paths, progress tracking |
| **meeting-facilitator** | Meeting management and action tracking | Agenda creation, notes to issues, action extraction |
| **discovery-guide** | Research and exploration support | Discovery lifecycle, research tracking, conversion to work |
| **blueprint-architect** | Architecture standards and patterns | Blueprint creation, standards definition, reviews |

## User Experience Flow

### 1. Trigger
User clicks "AI Assist" button on any supported page

### 2. Agent Selection (Optional)
- If suggested agent provided: Skip to prompt configuration
- Otherwise: Browse all available agents with descriptions
- Click an agent card to select

### 3. Prompt Configuration
- See agent description and capabilities
- Review/edit the suggested prompt
- Add any additional context or questions

### 4. Invocation
- Click "Invoke Agent"
- Loading state with spinner
- Request sent to backend → Claude service

### 5. Response
- View formatted markdown response
- See any suggested actions
- Option to ask another question or close

## Technical Details

### Context Passing

Context is automatically passed from the page to the subagent:

```tsx
// Page provides minimal context
<SubagentButton context={{ issue_id: issueId }} />

// Hook adds additional context
const invoke = async (prompt, context) => {
  return mutateAsync({
    prompt,
    context,
    agent_set: "turbo"
  });
};

// Backend forwards to Claude service
async with httpx.AsyncClient() as client:
    await client.post(
        f"{CLAUDE_SERVICE_URL}/invoke",
        json={"agent": agent, "prompt": prompt, "context": context}
    )

// Claude service builds full context from MCP tools
context_data = await build_context(context)
# Fetches issue, project, related entities, etc.
```

### Error Handling

**Frontend:**
- Network errors → Toast notification
- Validation errors → Inline form feedback
- Loading states → Spinners and disabled buttons

**Backend:**
- Connection errors → 503 Service Unavailable
- Timeout errors → 504 Gateway Timeout
- Claude service errors → 502 Bad Gateway with details
- Unexpected errors → 500 Internal Server Error

### Performance Considerations

**Timeout Settings:**
- Frontend: Default React Query timeout
- Backend API: 120 second timeout for subagent invocations
- Claude service: Configurable per backend (API vs CLI)

**Caching:**
- Subagent list cached for 5 minutes via React Query
- Responses not cached (always fresh analysis)

## Adding More Integrations

### Step 1: Add Button to Page

```tsx
import { SubagentButton } from "@/components/subagent/subagent-button";

<SubagentButton
  context={{ entity_id: entityId }}
  suggestedAgent="appropriate-agent-name"
  suggestedPrompt="What you want the agent to do..."
  size="sm"
/>
```

### Step 2: Ensure Context is Useful

Provide entity IDs that the subagent can use:
- `issue_id` - For issue-related operations
- `project_id` - For project analysis
- `document_id` - For document review
- `milestone_id` - For milestone planning
- etc.

### Step 3: Choose the Right Agent

Match the page's purpose to the agent's capabilities:
- Issues → `issue-triager`
- Projects → `project-manager`
- Documents → `doc-curator`
- Calendar → `task-scheduler`
- Blueprints → `blueprint-architect`

## Testing

### Manual Testing

1. **Start Services:**
   ```bash
   docker-compose up -d
   ```

2. **Verify Claude Service:**
   ```bash
   curl http://localhost:9000/agents?agent_set=turbo
   ```

3. **Test from UI:**
   - Navigate to Issues detail page
   - Click "AI Assist" button
   - Select an agent or use suggested
   - Enter a prompt
   - Verify response appears

### API Testing

```bash
# List agents
curl http://localhost:8001/api/v1/subagents/list?agent_set=turbo

# Invoke agent
curl -X POST http://localhost:8001/api/v1/subagents/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "issue-triager",
    "prompt": "Analyze issue ABC",
    "context": {"issue_id": "abc-123"}
  }'
```

## Troubleshooting

### "Claude service is unavailable"

**Cause:** Claude Code container not running or not accessible

**Fix:**
```bash
docker-compose ps  # Check if turbo-claude-code is running
docker-compose logs turbo-claude-code  # Check logs
docker-compose restart turbo-claude-code  # Restart if needed
```

### "Subagent invocation failed"

**Cause:** Invalid agent name or backend configuration issue

**Fix:**
1. Check agent name matches registry: `cat subagents/registry.json`
2. Verify backend setting in Settings page
3. Check Claude service logs for errors

### Dialog doesn't open

**Cause:** JavaScript error or missing component

**Fix:**
1. Check browser console for errors
2. Verify all UI components are built: `npm run build`
3. Check network tab for failed requests

## Future Enhancements

Potential improvements:

1. **Streaming Responses** - Show agent's response as it's generated
2. **Action Auto-Apply** - Allow agents to directly update entities (with confirmation)
3. **Conversation History** - Track previous interactions with agents
4. **Custom Agents** - Allow users to create custom subagents
5. **Agent Analytics** - Track which agents are most helpful
6. **Batch Operations** - Run agent on multiple entities at once

## Related Documentation

- [Claude Code Subagents Integration](./claude-code-subagents-integration.md) - Overall architecture
- [Claude Backend Comparison](./claude-backend-comparison.md) - API vs CLI backend
- [Subagent Registry](../subagents/registry.json) - All agent definitions
- [React Hooks](../frontend/hooks/use-subagent.ts) - Frontend integration
