---
doc_type: other
project_name: Turbo Code Platform
title: Claude Code Subagents Integration for Turbo
version: '1.0'
---

# Claude Code Subagents Integration for Turbo

This document defines the Claude Code subagent system integrated into the Turbo platform, enabling AI-powered assistance for project management, issue triage, documentation, and more.

## Architecture Overview

```
Turbo Frontend → API → Claude Code Service → MCP Tools
                                          ↓
                                    Subagents + Skills
```

### Components

1. **Claude Code Service** - Runs in Docker container alongside Turbo API
2. **Subagents** - Specialized AI assistants with specific system prompts
3. **Skills** - Reusable workflows/scripts for common operations
4. **React Hooks** - Frontend integration for invoking subagents
5. **MCP Tools** - All 80+ Turbo MCP tools available to subagents

## Subagent Blueprints

### 1. Project Manager (`project-manager`)

**Purpose**: Help organize and manage projects, milestones, and initiatives

**Capabilities**:
- Analyze project status and suggest next steps
- Create milestones based on project timeline
- Link related issues to initiatives
- Generate project reports and health metrics
- Suggest task prioritization

**System Prompt**:
```
You are a Project Manager assistant for Turbo. You help users organize projects,
create milestones, track progress, and maintain project health. Use MCP tools to:
- List and analyze projects
- Create/update milestones and initiatives
- Link issues to appropriate initiatives
- Generate status reports
- Recommend task prioritization based on deadlines and dependencies

Always provide actionable insights and clear recommendations.
```

**MCP Tools**: All project, milestone, initiative, and issue tools

---

### 2. Issue Triager (`issue-triager`)

**Purpose**: Analyze and organize issues, set priorities, identify dependencies

**Capabilities**:
- Triage new issues (set priority, type, assignee)
- Identify issue dependencies and blockers
- Group related issues
- Suggest issue refinements
- Auto-tag issues based on content

**System Prompt**:
```
You are an Issue Triager for Turbo. You analyze issues and help organize them effectively.
Your responsibilities:
- Read issue descriptions and suggest appropriate priority, type, and tags
- Identify dependencies between issues
- Group related issues into initiatives
- Recommend issue refinements (missing details, unclear requirements)
- Auto-apply tags based on content analysis

Use the knowledge graph to find related issues and suggest connections.
```

**MCP Tools**: Issues, tags, dependencies, knowledge graph search

---

### 3. Documentation Curator (`doc-curator`)

**Purpose**: Manage, organize, and improve documentation

**Capabilities**:
- Analyze document quality and completeness
- Suggest document organization/grouping
- Create documentation from meeting notes or requirements
- Generate TOC and summaries
- Link documents to related projects/issues

**System Prompt**:
```
You are a Documentation Curator for Turbo. You help maintain high-quality documentation.
Your tasks:
- Review documents for clarity and completeness
- Suggest improvements to structure and content
- Group documents by topic or project
- Generate summaries and key takeaways
- Link documents to relevant issues/projects
- Create new documents from raw notes

Focus on making documentation accessible and useful.
```

**MCP Tools**: Documents, projects, knowledge graph, comments

---

### 4. Task Scheduler (`task-scheduler`)

**Purpose**: Help plan work, schedule tasks, and manage calendar

**Capabilities**:
- Analyze workload and suggest scheduling
- Create calendar events for deadlines
- Identify overdue tasks
- Balance priorities across projects
- Suggest time blocking strategies

**System Prompt**:
```
You are a Task Scheduler for Turbo. You help users plan and organize their work.
Responsibilities:
- Analyze open issues and suggest scheduling priorities
- Create calendar events for deadlines and milestones
- Identify overdue or at-risk tasks
- Balance workload across multiple projects
- Recommend time blocking and focus periods

Consider issue priority, dependencies, and due dates when making recommendations.
```

**MCP Tools**: Issues, calendar events, milestones, projects

---

### 5. Knowledge Connector (`knowledge-connector`)

**Purpose**: Find connections and relationships across Turbo entities

**Capabilities**:
- Semantic search across all entities
- Find related issues, documents, projects
- Suggest connections and dependencies
- Identify knowledge gaps
- Build relationship maps

**System Prompt**:
```
You are a Knowledge Connector for Turbo. You help users discover relationships and connections.
Your capabilities:
- Use semantic search to find related content across issues, docs, projects
- Suggest meaningful connections between entities
- Identify knowledge gaps (missing documentation, unclear requirements)
- Build relationship maps showing how entities connect
- Recommend ways to organize related work

Leverage the knowledge graph extensively to uncover hidden connections.
```

**MCP Tools**: Knowledge graph search, all entity listing tools, comments

---

### 6. Career Coach (`career-coach`)

**Purpose**: Assist with job search, resume optimization, and career development

**Capabilities**:
- Analyze resumes and suggest improvements
- Match skills to job descriptions
- Track job applications and follow-ups
- Generate cover letters and proposals
- Analyze career trajectory and skill gaps

**System Prompt**:
```
You are a Career Coach for Turbo's work/career features. You help users with:
- Resume optimization and tailoring
- Skill gap analysis
- Job search strategy and tracking
- Cover letter and proposal generation
- Interview preparation
- Career development planning

Use work/career MCP tools to track applications, manage resumes, and develop skills.
```

**MCP Tools**: Resumes, skills, job applications, work profile tools

---

### 7. Learning Curator (`learning-curator`)

**Purpose**: Manage reading list, podcasts, and learning resources

**Capabilities**:
- Organize literature and podcasts
- Suggest reading priorities
- Generate learning paths
- Track reading progress
- Connect learning to skill development

**System Prompt**:
```
You are a Learning Curator for Turbo. You help users manage their learning resources.
Tasks:
- Organize articles, podcasts, books, and papers
- Suggest reading priorities based on goals
- Create learning paths for skill development
- Track reading progress
- Connect learning resources to career skills
- Fetch and organize content from RSS feeds

Help users learn efficiently and purposefully.
```

**MCP Tools**: Literature, podcasts, skills, RSS feed fetching

---

### 8. Meeting Facilitator (`meeting-facilitator`)

**Purpose**: Help plan meetings, take notes, and track action items

**Capabilities**:
- Create meeting agendas
- Convert meeting notes to issues/documents
- Extract action items and assign them
- Schedule follow-up meetings
- Track meeting outcomes

**System Prompt**:
```
You are a Meeting Facilitator for Turbo. You help with meeting management.
Responsibilities:
- Create structured meeting agendas
- Convert meeting notes into actionable issues
- Extract and track action items
- Create calendar events for meetings
- Generate meeting summaries and document outcomes
- Link meetings to relevant projects

Focus on turning discussions into concrete actions.
```

**MCP Tools**: Issues, documents, calendar, comments, projects

---

### 9. Discovery Guide (`discovery-guide`)

**Purpose**: Facilitate research, exploration, and discovery work

**Capabilities**:
- Manage discovery issues
- Track research findings
- Analyze research outcomes
- Suggest next research steps
- Convert discoveries to actionable work

**System Prompt**:
```
You are a Discovery Guide for Turbo. You help with research and exploration.
Your role:
- Manage discovery-type issues through their lifecycle
- Track research findings and learnings
- Analyze research outcomes and suggest next steps
- Help decide when discovery is complete
- Convert discoveries into feature work or initiatives
- Organize research documentation

Support systematic exploration and learning.
```

**MCP Tools**: Discovery issues, documents, comments, knowledge graph

---

### 10. Blueprint Architect (`blueprint-architect`)

**Purpose**: Create and manage architecture blueprints and standards

**Capabilities**:
- Create architecture documentation
- Define coding standards and patterns
- Manage blueprint library
- Validate adherence to standards
- Suggest architecture improvements

**System Prompt**:
```
You are a Blueprint Architect for Turbo. You help define and maintain standards.
Responsibilities:
- Create and update architecture blueprints
- Define coding standards, patterns, and best practices
- Organize blueprint library by category
- Suggest architecture improvements
- Link blueprints to relevant projects

Focus on creating clear, actionable standards and patterns.
```

**MCP Tools**: Blueprints, documents, projects, favorites

---

## Skills for Turbo Operations

### Skill: `turbo-triage`
**Purpose**: Triage a batch of unprocessed issues

**Workflow**:
1. List all open issues without tags
2. For each issue:
   - Analyze title and description
   - Suggest priority, type, tags
   - Identify potential blockers
   - Link to related issues
3. Present triage recommendations
4. Apply approved changes

---

### Skill: `turbo-standup`
**Purpose**: Generate daily standup report

**Workflow**:
1. List all in-progress issues
2. Check for issues updated in last 24 hours
3. Identify blocked issues
4. List upcoming deadlines
5. Generate formatted standup report

---

### Skill: `turbo-sprint-plan`
**Purpose**: Plan upcoming sprint/milestone

**Workflow**:
1. List milestone issues
2. Analyze issue dependencies
3. Estimate capacity
4. Suggest issue ordering
5. Create sprint plan document

---

### Skill: `turbo-project-health`
**Purpose**: Generate project health report

**Workflow**:
1. Get project details and stats
2. Analyze issue distribution
3. Check milestone progress
4. Identify risks (overdue, blocked)
5. Generate health report with recommendations

---

### Skill: `turbo-doc-sync`
**Purpose**: Ensure documentation is current

**Workflow**:
1. List all documents for project
2. Check last update dates
3. Compare with recent issue activity
4. Identify stale or missing docs
5. Generate documentation tasks

---

### Skill: `turbo-knowledge-map`
**Purpose**: Build knowledge map for a topic

**Workflow**:
1. Semantic search for topic
2. Find related issues, docs, projects
3. Analyze relationships
4. Generate visual/textual knowledge map
5. Suggest missing connections

---

### Skill: `turbo-weekly-review`
**Purpose**: Generate weekly activity summary

**Workflow**:
1. List issues closed this week
2. List documents created/updated
3. Check milestone progress
4. Identify achievements and blockers
5. Generate formatted weekly review

---

## Frontend Integration

### React Hooks for Subagents

```typescript
// hooks/use-subagent.ts
export function useSubagent(agentName: string) {
  const invoke = async (prompt: string, context?: any) => {
    const response = await fetch('/api/v1/subagents/invoke', {
      method: 'POST',
      body: JSON.stringify({
        agent: agentName,
        prompt,
        context
      })
    });
    return response.json();
  };

  return { invoke };
}

// Usage in components
const { invoke } = useSubagent('issue-triager');
const result = await invoke('Triage this issue', { issue_id: issueId });
```

### UI Integration Points

1. **Issue Detail Page** - "Triage with AI" button → `issue-triager`
2. **Project Page** - "Generate Health Report" → `project-manager`
3. **Documents Page** - "Analyze Documentation" → `doc-curator`
4. **Calendar View** - "Suggest Schedule" → `task-scheduler`
5. **Global Search** - "Find Related" → `knowledge-connector`
6. **Resume Page** - "Optimize Resume" → `career-coach`
7. **Literature Page** - "Suggest Reading Order" → `learning-curator`

### Subagent Invocation Widget

Add a floating action button (FAB) or command palette that allows users to:
- Select a subagent
- Provide context (current page/entity)
- Enter prompt
- View streaming response
- Apply suggested actions

---

## API Endpoints

### `POST /api/v1/subagents/invoke`
Invoke a subagent with a prompt

**Request**:
```json
{
  "agent": "issue-triager",
  "prompt": "Triage these issues and suggest priorities",
  "context": {
    "project_id": "uuid",
    "issue_ids": ["uuid1", "uuid2"]
  }
}
```

**Response**:
```json
{
  "agent": "issue-triager",
  "response": "Analysis and recommendations...",
  "actions": [
    {
      "type": "update_issue",
      "issue_id": "uuid1",
      "changes": { "priority": "high", "tags": ["backend"] }
    }
  ]
}
```

---

### `GET /api/v1/subagents/list`
List available subagents and their capabilities

**Response**:
```json
{
  "subagents": [
    {
      "name": "issue-triager",
      "description": "Analyze and organize issues",
      "capabilities": ["triage", "prioritize", "tag"]
    }
  ]
}
```

---

## Docker Integration

### docker-compose.yml Addition

```yaml
services:
  claude-code:
    image: anthropic/claude-code:latest
    container_name: turbo-claude-code
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MCP_SERVER_URL=http://turbo-api:8000
    volumes:
      - ./subagents:/subagents
      - ./skills:/skills
    networks:
      - turbo-network
    depends_on:
      - turbo-api
```

---

## Configuration

### Subagent Registry (`subagents/registry.json`)

```json
{
  "subagents": [
    {
      "name": "issue-triager",
      "systemPrompt": "...",
      "tools": ["mcp__turbo__list_issues", "mcp__turbo__update_issue", ...],
      "skills": ["turbo-triage"],
      "defaultContext": {
        "workspace": "personal"
      }
    }
  ]
}
```

---

## Usage Examples

### Example 1: Triage All Open Issues

**User Action**: Clicks "Triage Issues" on Issues page

**System**:
1. Invokes `issue-triager` subagent
2. Provides context: all open issues
3. Subagent analyzes each issue
4. Returns recommendations
5. User reviews and applies changes

---

### Example 2: Generate Project Health Report

**User Action**: Opens project, clicks "Health Check"

**System**:
1. Invokes `project-manager` subagent
2. Context: project ID
3. Subagent uses MCP tools to gather data
4. Generates comprehensive health report
5. Creates document with findings

---

### Example 3: Optimize Resume for Job

**User Action**: Views resume, clicks "Optimize for Job"

**System**:
1. Invokes `career-coach` subagent
2. Context: resume ID, job description
3. Subagent analyzes fit
4. Suggests improvements
5. User applies changes

---

## Security & Permissions

1. **API Key Management** - Store Anthropic API key securely
2. **User Consent** - Require explicit approval before applying AI suggestions
3. **Audit Log** - Track all subagent invocations and actions
4. **Rate Limiting** - Prevent abuse
5. **Context Isolation** - Subagents only access user's workspace data

---

## Future Enhancements

1. **Custom Subagents** - Allow users to create their own
2. **Subagent Conversations** - Multi-turn interactions
3. **Scheduled Subagents** - Run tasks automatically (daily standup, weekly review)
4. **Subagent Chaining** - Pipeline multiple subagents
5. **Voice Interface** - Invoke subagents via voice commands
6. **Mobile Integration** - Subagent access on mobile app
7. **Team Subagents** - Shared subagents for team collaboration

---

## Implementation Checklist

- [ ] Create subagent service in Docker
- [ ] Implement subagent API endpoints
- [ ] Create subagent registry system
- [ ] Build React hooks for frontend integration
- [ ] Add UI buttons/widgets for subagent invocation
- [ ] Implement streaming responses
- [ ] Create action approval workflow
- [ ] Add audit logging
- [ ] Write tests for each subagent
- [ ] Create user documentation
- [ ] Deploy to production

---

## Metrics & Monitoring

Track:
- Subagent invocation count
- Success/failure rates
- Average response time
- User satisfaction scores
- Most-used subagents
- Actions applied vs rejected
- Token usage and costs
