# Turbo Code Webhook System - Comprehensive Design

## Overview

This document outlines a comprehensive webhook system for Turbo Code that enables real-time notifications and automation across all entities and operations. The webhook system allows external services, AI agents, and automation tools to react to events in the platform.

## Architecture

### Current Implementation

**Webhook Server**: `scripts/claude_webhook_server.py`
- Runs on host machine (port 9000)
- Receives webhook POST requests from API
- Triggers Claude Code CLI in headless mode
- Currently handles: Comment creation events

**API Integration**: `turbo/core/services/claude_webhook.py`
- Service layer for sending webhook requests
- Configuration via environment variables
- Background task execution to avoid blocking API responses

### Proposed Architecture

```
┌─────────────────┐
│   Turbo API     │
│   (FastAPI)     │
└────────┬────────┘
         │
         │ HTTP POST (webhook event)
         ▼
┌─────────────────┐
│  Webhook Router │  (New: Event dispatcher)
│  (In API)       │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │Claude  │    │Slack   │    │Discord │    │Custom  │
    │Webhook │    │Webhook │    │Webhook │    │Webhook │
    │Server  │    │Server  │    │Server  │    │Handlers│
    └────────┘    └────────┘    └────────┘    └────────┘
```

### Webhook Event Structure

```json
{
  "event_id": "uuid",
  "event_type": "issue.created",
  "timestamp": "2025-10-15T14:00:00Z",
  "entity_type": "issue",
  "entity_id": "uuid",
  "action": "created",
  "actor": {
    "type": "user|ai|system",
    "name": "user@example.com",
    "metadata": {}
  },
  "data": {
    "current": { /* Current state */ },
    "previous": { /* Previous state (for updates) */ },
    "changes": [ /* List of changed fields */ ]
  },
  "context": {
    "project_id": "uuid",
    "milestone_id": "uuid",
    "initiative_id": "uuid"
  }
}
```

---

## Webhook Events by Entity

### 1. Project Webhooks

#### 1.1 `project.created`
**Trigger**: New project is created
**Use Cases**:
- Initialize project management tools (Jira, Linear, etc.)
- Create corresponding repositories (GitHub, GitLab)
- Setup CI/CD pipelines automatically
- Notify team members
- Create default milestones and templates

**Payload**:
```json
{
  "event_type": "project.created",
  "entity_type": "project",
  "entity_id": "project-uuid",
  "action": "created",
  "data": {
    "current": {
      "name": "New Project",
      "description": "Project description",
      "status": "active",
      "priority": "high",
      "completion_percentage": 0.0
    }
  }
}
```

#### 1.2 `project.updated`
**Trigger**: Project details are modified
**Use Cases**:
- Sync changes to external systems
- Notify stakeholders of priority changes
- Track project evolution for analytics
- Trigger automated workflows based on status changes

**Payload**: Includes `previous` state and `changes` array

#### 1.3 `project.status_changed`
**Trigger**: Project status changes (active → on_hold, completed, archived)
**Use Cases**:
- Notify team of status changes
- Trigger closing workflows (documentation, retrospectives)
- Archive related resources
- Update project dashboards

#### 1.4 `project.completion_milestone`
**Trigger**: Project completion reaches 25%, 50%, 75%, 100%
**Use Cases**:
- Celebrate milestones
- Generate progress reports
- Schedule reviews or demos
- Notify stakeholders

#### 1.5 `project.archived`
**Trigger**: Project is archived
**Use Cases**:
- Archive external resources
- Notify team members
- Backup project data
- Update project portfolio

#### 1.6 `project.deleted`
**Trigger**: Project is permanently deleted
**Use Cases**:
- Cleanup external resources
- Remove from integrations
- Audit logging
- Data retention compliance

---

### 2. Issue Webhooks

#### 2.1 `issue.created`
**Trigger**: New issue is created
**Use Cases**:
- Auto-assign based on type/priority
- Create corresponding tickets in external systems
- Notify relevant team members
- Trigger AI analysis for priority/complexity
- Add to knowledge graph

**Payload**:
```json
{
  "event_type": "issue.created",
  "entity_type": "issue",
  "entity_id": "issue-uuid",
  "data": {
    "current": {
      "title": "Bug in login system",
      "type": "bug",
      "status": "open",
      "priority": "high",
      "project_id": "project-uuid"
    }
  },
  "context": {
    "project_id": "project-uuid"
  }
}
```

#### 2.2 `issue.updated`
**Trigger**: Issue fields are modified
**Use Cases**:
- Sync changes to external trackers
- Notify assignee of changes
- Track issue history
- Update related issues

#### 2.3 `issue.assigned`
**Trigger**: Issue is assigned to someone
**Use Cases**:
- Notify assignee
- Update workload tracking
- Send to assignee's preferred tools (Slack, email)
- Trigger AI assistance for complex issues

#### 2.4 `issue.unassigned`
**Trigger**: Assignee is removed from issue
**Use Cases**:
- Return to unassigned queue
- Notify previous assignee
- Trigger re-assignment workflows

#### 2.5 `issue.status_changed`
**Trigger**: Issue status changes (open → in_progress → review → testing → closed)
**Use Cases**:
- Move cards in external boards
- Notify stakeholders
- Trigger automated testing (for testing status)
- Update project completion metrics
- Generate time tracking reports

#### 2.6 `issue.priority_changed`
**Trigger**: Issue priority is modified
**Use Cases**:
- Notify team of escalations
- Re-prioritize work queues
- Alert on-call engineers (for critical)
- Update capacity planning

#### 2.7 `issue.closed`
**Trigger**: Issue status set to closed
**Use Cases**:
- Notify creator and assignee
- Update project metrics
- Close related issues
- Trigger satisfaction surveys
- Archive associated resources

#### 2.8 `issue.reopened`
**Trigger**: Closed issue is reopened
**Use Cases**:
- Notify previous assignee
- Investigate why it was reopened
- Update metrics
- Re-prioritize in backlog

#### 2.9 `issue.commented`
**Trigger**: New comment added to issue (CURRENT IMPLEMENTATION)
**Use Cases**:
- Trigger AI response (Claude Code)
- Notify participants
- Update activity feeds
- Extract action items

#### 2.10 `issue.tagged`
**Trigger**: Tag added to issue
**Use Cases**:
- Auto-categorize issues
- Notify tag watchers
- Update filtered views
- Trigger tag-specific workflows

#### 2.11 `issue.due_date_approaching`
**Trigger**: Issue due date is within configured threshold (1 day, 3 days, 1 week)
**Use Cases**:
- Remind assignee
- Escalate to manager if not progressing
- Suggest time extension
- Update risk dashboards

#### 2.12 `issue.overdue`
**Trigger**: Issue due date has passed
**Use Cases**:
- Escalate to team lead
- Auto-update status
- Generate overdue reports
- Trigger intervention workflows

#### 2.13 `issue.blocked`
**Trigger**: Issue dependency added (blocked_by relationship)
**Use Cases**:
- Notify assignee of blocker
- Update critical path analysis
- Surface blockers to management
- Trigger dependency resolution workflows

#### 2.14 `issue.unblocked`
**Trigger**: Blocking dependency resolved
**Use Cases**:
- Notify assignee work can resume
- Re-prioritize issue
- Update timelines

#### 2.15 `issue.linked_to_milestone`
**Trigger**: Issue associated with milestone
**Use Cases**:
- Update milestone progress
- Notify milestone owner
- Recalculate milestone timeline

#### 2.16 `issue.linked_to_initiative`
**Trigger**: Issue associated with initiative
**Use Cases**:
- Update initiative progress
- Notify initiative stakeholders
- Update feature roadmap

---

### 3. Milestone Webhooks

#### 3.1 `milestone.created`
**Trigger**: New milestone is created
**Use Cases**:
- Schedule planning meetings
- Create milestone documentation
- Notify project stakeholders
- Setup milestone tracking dashboards

#### 3.2 `milestone.updated`
**Trigger**: Milestone details modified
**Use Cases**:
- Notify affected team members
- Recalculate project timelines
- Update roadmap visualizations

#### 3.3 `milestone.status_changed`
**Trigger**: Milestone status changes (planned → in_progress → completed → cancelled)
**Use Cases**:
- Notify stakeholders
- Trigger release workflows (for completed)
- Update project status
- Generate milestone reports

#### 3.4 `milestone.completed`
**Trigger**: All milestone issues are closed
**Use Cases**:
- Celebrate milestone achievement
- Generate release notes
- Schedule retrospectives
- Update roadmap

#### 3.5 `milestone.due_date_approaching`
**Trigger**: Milestone due date is near
**Use Cases**:
- Send progress warnings
- Schedule status meetings
- Evaluate if timeline is realistic
- Trigger scope review

#### 3.6 `milestone.overdue`
**Trigger**: Milestone due date passed
**Use Cases**:
- Escalate to management
- Trigger timeline adjustment
- Generate delay analysis
- Update stakeholder communications

#### 3.7 `milestone.progress_updated`
**Trigger**: Milestone completion percentage changes significantly (every 10%)
**Use Cases**:
- Update progress dashboards
- Notify stakeholders
- Predict completion date
- Adjust resource allocation

---

### 4. Initiative Webhooks

#### 4.1 `initiative.created`
**Trigger**: New initiative is created
**Use Cases**:
- Create initiative documentation
- Schedule kickoff meetings
- Notify stakeholders
- Initialize tracking systems

#### 4.2 `initiative.updated`
**Trigger**: Initiative details modified
**Use Cases**:
- Sync to product roadmap tools
- Notify team of changes
- Update strategic plans

#### 4.3 `initiative.status_changed`
**Trigger**: Initiative status changes (planning → in_progress → on_hold → completed → cancelled)
**Use Cases**:
- Notify stakeholders
- Reallocate resources
- Update portfolio management
- Trigger retrospectives

#### 4.4 `initiative.completed`
**Trigger**: Initiative marked as completed
**Use Cases**:
- Generate success metrics
- Schedule retrospectives
- Document learnings
- Celebrate team achievement

#### 4.5 `initiative.issue_added`
**Trigger**: Issue linked to initiative
**Use Cases**:
- Update initiative scope
- Recalculate timelines
- Notify initiative owner

---

### 5. Comment Webhooks

#### 5.1 `comment.created` ✅ IMPLEMENTED
**Trigger**: New comment added to issue
**Use Cases**:
- Trigger AI response (Claude Code)
- Notify issue participants
- Extract action items
- Update activity feed

**Current Implementation**: `turbo/api/v1/endpoints/comments.py:18`

#### 5.2 `comment.updated`
**Trigger**: Comment content is edited
**Use Cases**:
- Track comment history
- Notify mentioned users
- Re-trigger AI analysis if needed

#### 5.3 `comment.deleted`
**Trigger**: Comment is removed
**Use Cases**:
- Audit logging
- Notify issue owner
- Remove from activity feeds

#### 5.4 `comment.mention`
**Trigger**: User is @mentioned in comment
**Use Cases**:
- Notify mentioned user
- Add to their notifications
- Create follow-up tasks

---

### 6. Document Webhooks

#### 6.1 `document.created`
**Trigger**: New document created
**Use Cases**:
- Index in search system
- Notify project team
- Add to knowledge graph
- Trigger AI summarization

#### 6.2 `document.updated`
**Trigger**: Document content modified
**Use Cases**:
- Re-index for search
- Notify subscribers
- Track version history
- Update knowledge graph

#### 6.3 `document.linked`
**Trigger**: Document linked to project/issue/milestone
**Use Cases**:
- Notify entity owners
- Update related documentation views
- Improve context for AI

#### 6.4 `document.deleted`
**Trigger**: Document removed
**Use Cases**:
- Archive or backup
- Remove from search index
- Notify stakeholders

---

### 7. Tag Webhooks

#### 7.1 `tag.created`
**Trigger**: New tag created
**Use Cases**:
- Suggest applying to existing items
- Create tag-based views
- Notify taxonomy managers

#### 7.2 `tag.applied`
**Trigger**: Tag added to an entity
**Use Cases**:
- Notify tag watchers
- Update tag-based dashboards
- Trigger tag-specific automation

#### 7.3 `tag.removed`
**Trigger**: Tag removed from entity
**Use Cases**:
- Update filtered views
- Notify tag watchers
- Audit tag usage

---

### 8. Literature Webhooks

#### 8.1 `literature.fetched`
**Trigger**: Article/paper fetched from URL or RSS
**Use Cases**:
- Trigger AI summarization
- Extract key insights
- Categorize automatically
- Add to reading lists

#### 8.2 `literature.marked_read`
**Trigger**: Item marked as read
**Use Cases**:
- Track reading progress
- Update learning metrics
- Suggest related content

#### 8.3 `literature.favorited`
**Trigger**: Item added to favorites
**Use Cases**:
- Add to curated lists
- Share with team
- Trigger deep analysis

---

### 9. Terminal Session Webhooks

#### 9.1 `terminal.session_started`
**Trigger**: New terminal session created
**Use Cases**:
- Track development activity
- Record session for playback
- Link to issue for context

#### 9.2 `terminal.session_ended`
**Trigger**: Terminal session closed
**Use Cases**:
- Analyze commands run
- Extract insights for documentation
- Track time spent

#### 9.3 `terminal.command_executed`
**Trigger**: Command executed in terminal
**Use Cases**:
- Track development patterns
- Generate command suggestions
- Audit security-sensitive commands

---

### 10. Calendar Event Webhooks

#### 10.1 `calendar.event_created`
**Trigger**: New event scheduled
**Use Cases**:
- Send calendar invites
- Block time on external calendars
- Notify participants

#### 10.2 `calendar.event_starting_soon`
**Trigger**: Event starting in 15 minutes
**Use Cases**:
- Send reminders
- Prepare meeting materials
- Open related documents

---

### 11. System-Level Webhooks

#### 11.1 `system.daily_digest`
**Trigger**: Scheduled daily (configurable time)
**Use Cases**:
- Send daily summary emails
- Generate activity reports
- Update external dashboards
- Run analytics

#### 11.2 `system.weekly_report`
**Trigger**: Scheduled weekly
**Use Cases**:
- Generate team performance reports
- Summarize completed work
- Identify trends
- Plan upcoming week

#### 11.3 `system.backup_completed`
**Trigger**: Database backup finishes
**Use Cases**:
- Notify admins
- Verify backup integrity
- Update backup dashboards

#### 11.4 `system.health_check_failed`
**Trigger**: System health check fails
**Use Cases**:
- Alert on-call engineers
- Trigger incident response
- Log for monitoring

#### 11.5 `system.ai_analysis_complete`
**Trigger**: Background AI analysis finishes
**Use Cases**:
- Notify user who requested analysis
- Display results
- Trigger follow-up actions

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)

**1. Create Webhook Event System**
- `turbo/core/services/webhook_dispatcher.py` - Central event dispatcher
- `turbo/core/schemas/webhook.py` - Event schemas
- `turbo/utils/webhook_manager.py` - Subscription management

**2. Implement Event Emitters**
- Add webhook triggers to all service methods
- Use decorator pattern for automatic event emission
- Background task execution to avoid blocking

**3. Build Webhook Registry**
- Database table for webhook subscriptions
- Admin API for managing webhooks
- Support multiple URLs per event type
- Retry logic for failed webhooks

### Phase 2: Priority Webhooks (Week 3-4)

Implement in this order:
1. ✅ `comment.created` (Already done)
2. `issue.created`, `issue.updated`, `issue.status_changed`
3. `project.created`, `project.status_changed`
4. `milestone.completed`, `milestone.overdue`
5. `issue.assigned`, `issue.overdue`

### Phase 3: Advanced Features (Week 5-6)

1. **Webhook UI in Frontend**
   - `/settings/webhooks` page
   - Test webhook functionality
   - View webhook logs
   - Retry failed webhooks

2. **Conditional Webhooks**
   - Filter by conditions (e.g., only high priority)
   - Custom payload templates
   - Rate limiting per webhook

3. **Webhook Analytics**
   - Success/failure rates
   - Response times
   - Most active webhooks

### Phase 4: Integration Packs (Week 7-8)

Pre-built integrations:
1. **Slack** - Send notifications to channels
2. **Discord** - Post updates to Discord servers
3. **Email** - Email notifications
4. **GitHub** - Create issues, update PR status
5. **Zapier** - Connect to 5000+ apps

---

## Configuration

### Environment Variables

```bash
# Webhook System
WEBHOOK_ENABLED=true
WEBHOOK_TIMEOUT=30  # seconds
WEBHOOK_RETRY_COUNT=3
WEBHOOK_RETRY_DELAY=5  # seconds

# Specific Webhook URLs
CLAUDE_WEBHOOK_URL=http://localhost:9000/webhook/comment
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Database Schema

```sql
CREATE TABLE webhook_subscriptions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    event_types TEXT[] NOT NULL,  -- Array of event types
    active BOOLEAN DEFAULT true,
    secret_token VARCHAR(255),  -- For webhook verification
    filters JSONB,  -- Conditional filters
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY,
    subscription_id UUID REFERENCES webhook_subscriptions(id),
    event_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL,  -- pending, success, failed
    response_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);
```

---

## Security Considerations

### 1. Webhook Verification
- Include HMAC signature in webhook headers
- Verify signature on receiving end
- Use secret tokens per webhook

### 2. Rate Limiting
- Limit webhook calls per subscription
- Prevent webhook loops
- Queue webhooks to avoid overwhelming receivers

### 3. Sensitive Data
- Filter sensitive data from payloads
- Support payload templates
- Audit webhook access

### 4. HTTPS Only
- Require HTTPS for webhook URLs
- Validate SSL certificates
- Support mutual TLS

---

## Testing Strategy

### 1. Unit Tests
- Test event emission
- Test payload construction
- Test retry logic

### 2. Integration Tests
- Test webhook delivery
- Test error handling
- Test timeout handling

### 3. Mock Webhook Server
- Create test webhook receiver
- Verify payload structure
- Test authentication

---

## Monitoring & Observability

### Metrics to Track
- Webhook delivery success rate
- Average response time
- Failed deliveries
- Most triggered events
- Active subscriptions

### Logging
- Log all webhook deliveries
- Log failures with full context
- Structured logging for analysis

### Alerting
- Alert on high failure rates
- Alert on webhook timeouts
- Alert on authentication failures

---

## Example Use Cases

### Use Case 1: Automated Issue Triage
**Webhook**: `issue.created`
**Handler**: AI Triage Agent
**Flow**:
1. New issue created
2. Webhook triggers AI agent
3. AI analyzes title/description
4. AI suggests priority, assignee, tags
5. AI posts recommendations as comment

### Use Case 2: Sprint Planning Automation
**Webhook**: `milestone.created`
**Handler**: Sprint Planning Bot
**Flow**:
1. New sprint milestone created
2. Bot creates sprint board
3. Bot suggests issues for sprint
4. Bot schedules sprint planning meeting

### Use Case 3: Deployment Pipeline
**Webhook**: `issue.status_changed` (to "testing")
**Handler**: CI/CD System
**Flow**:
1. Issue moved to testing
2. Trigger automated test suite
3. Create staging deployment
4. Post test results as comment

### Use Case 4: Team Notifications
**Webhook**: `issue.assigned`
**Handler**: Slack Integration
**Flow**:
1. Issue assigned to team member
2. Send Slack DM to assignee
3. Include issue details and link
4. Allow quick actions from Slack

### Use Case 5: Knowledge Base Updates
**Webhook**: `document.created`, `document.updated`
**Handler**: Knowledge Graph Service
**Flow**:
1. Document created or updated
2. Extract entities and concepts
3. Update knowledge graph
4. Link to related documents/issues

---

## Migration Guide

### Migrating from Current System

Current: Single webhook for comments
```python
# turbo/api/v1/endpoints/comments.py
if comment.author_type == "user":
    webhook_service = get_webhook_service()
    background_tasks.add_task(
        webhook_service.trigger_claude_response, comment.issue_id
    )
```

New: Event-driven system
```python
# turbo/api/v1/endpoints/comments.py
comment = await comment_service.create_comment(comment_data)

# Emit webhook event
await webhook_dispatcher.emit(
    event_type="comment.created",
    entity_type="comment",
    entity_id=comment.id,
    data={"current": comment.model_dump()},
    context={"issue_id": comment.issue_id}
)
```

---

## Future Enhancements

### 1. Webhook Marketplace
- Share webhook handlers
- Pre-built integrations
- Community contributions

### 2. Visual Webhook Builder
- No-code webhook creation
- Drag-and-drop workflow builder
- Template library

### 3. Webhook Analytics Dashboard
- Real-time monitoring
- Performance metrics
- Cost tracking

### 4. Bi-directional Webhooks
- Receive webhooks from external systems
- Two-way sync with external tools
- Conflict resolution

---

## Conclusion

This comprehensive webhook system transforms Turbo Code into an automation platform that can integrate with any external tool or service. By implementing these webhooks in phases, we can quickly provide value while building toward a robust, scalable system.

**Immediate Next Steps**:
1. Review and prioritize webhook events
2. Design webhook subscription UI
3. Implement core webhook dispatcher
4. Add top 5 priority webhooks
5. Create integration guides

**Success Metrics**:
- Number of active webhook subscriptions
- Webhook delivery success rate > 99%
- Average response time < 500ms
- Number of integrations built
- User satisfaction with automation
