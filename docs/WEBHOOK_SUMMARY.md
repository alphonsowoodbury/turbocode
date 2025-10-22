---
doc_type: other
project_name: Turbo Code Platform
title: Webhook System Summary
version: '1.0'
---

# Webhook System Summary

## Current Status

### ✅ Currently Implemented

**1. Comment Webhook** (`comment.created`)
- **File**: `turbo/api/v1/endpoints/comments.py:18-44`
- **Webhook Server**: `scripts/claude_webhook_server.py`
- **Status**: Running on port 9000
- **Purpose**: Triggers Claude Code AI responses to user comments
- **Flow**:
  1. User adds comment to issue
  2. API calls webhook service (background task)
  3. Webhook server receives request
  4. Claude Code CLI invoked in headless mode
  5. Claude analyzes issue and comments
  6. Claude posts AI-generated response

**Configuration**:
```env
CLAUDE_AUTO_RESPOND=true
CLAUDE_WEBHOOK_URL=http://host.docker.internal:9000/webhook/comment
```

---

## 📊 Complete Webhook Inventory

### By Priority

#### 🔥 Critical (Implement First)
1. `issue.created` - New issue created
2. `issue.status_changed` - Status transition
3. `issue.assigned` - Assignee added
4. `project.created` - New project
5. `milestone.completed` - Milestone done

#### ⚡ High Priority
6. `issue.updated` - Any issue field changed
7. `issue.closed` - Issue closed
8. `issue.reopened` - Issue reopened
9. `project.status_changed` - Project status change
10. `milestone.overdue` - Missed deadline

#### 📈 Medium Priority
11. `issue.priority_changed` - Priority escalation
12. `issue.due_date_approaching` - Deadline warning
13. `issue.overdue` - Missed issue deadline
14. `initiative.created` - New initiative
15. `document.created` - New documentation

#### 📝 Low Priority / Nice to Have
16. `issue.tagged` - Tag applied
17. `literature.fetched` - Article saved
18. `calendar.event_created` - Event scheduled
19. `terminal.session_started` - Terminal opened
20. `system.daily_digest` - Daily summary

---

## 📈 Webhook Statistics

### Total Webhooks Available
- **Entities**: 11 (Issue, Project, Milestone, Initiative, Comment, Document, Tag, Literature, Terminal, Calendar, System)
- **Total Events**: 70+ webhook events
- **Implemented**: 1 (comment.created)
- **Ready to Implement**: 69

### By Category
- **Issue Webhooks**: 16 events
- **Project Webhooks**: 6 events
- **Milestone Webhooks**: 7 events
- **Initiative Webhooks**: 5 events
- **Comment Webhooks**: 4 events
- **Document Webhooks**: 4 events
- **Tag Webhooks**: 3 events
- **Literature Webhooks**: 3 events
- **Terminal Webhooks**: 3 events
- **Calendar Webhooks**: 2 events
- **System Webhooks**: 5 events

---

## 🎯 Quick Implementation Guide

### Add Webhook in 5 Minutes

**Example**: Add `issue.created` webhook

1. **Update Service** (`turbo/core/services/issue.py`):
```python
from turbo.core.services.webhook_dispatcher import get_webhook_dispatcher

async def create_issue(self, issue_data: IssueCreate) -> IssueResponse:
    # ... existing code ...
    issue = await self._issue_repository.create(issue_data)

    # Add this webhook emit
    dispatcher = await get_webhook_dispatcher(self._issue_repository._session)
    await dispatcher.emit(
        event_type="issue.created",
        entity_type="issue",
        entity_id=issue.id,
        data={"current": issue.model_dump()},
        context={"project_id": issue.project_id} if issue.project_id else {},
    )

    return IssueResponse.model_validate(issue)
```

2. **Test It**:
```bash
# Create test webhook receiver
python scripts/test_webhook_receiver.py

# Create issue
turbo issues create --title "Test" --description "Test" --project-id <id>

# See webhook received!
```

---

## 🔌 Integration Possibilities

### What You Can Build

#### 1. Slack Notifications
- New issues posted to #dev-alerts
- High priority issues to #urgent
- Daily digest to #team-updates

#### 2. Discord Bot
- Project updates in project channels
- Issue assignments as DMs
- Milestone celebrations

#### 3. Email Notifications
- Assignee notifications
- Overdue issue alerts
- Weekly team reports

#### 4. Jira/Linear Sync
- Two-way issue sync
- Status updates
- Comment sync

#### 5. GitHub Integration
- Create GitHub issues from Turbo issues
- Link PRs to issues
- Auto-close on merge

#### 6. CI/CD Triggers
- Run tests when issue moved to testing
- Deploy when milestone completed
- Generate release notes

#### 7. Analytics Dashboard
- Real-time project metrics
- Team velocity tracking
- Burndown charts

#### 8. Custom Automation
- Auto-assign based on issue type
- Tag suggestion based on content
- Priority escalation rules
- Due date reminders

---

## 📊 Webhook Event Details

### Issue Webhooks (16 Events)

| Event | When | Use Cases |
|-------|------|-----------|
| `issue.created` | New issue | Auto-assign, notify team, AI analysis |
| `issue.updated` | Any field changed | Sync to external tools, track history |
| `issue.assigned` | Assignee added | Notify assignee, update workload |
| `issue.unassigned` | Assignee removed | Return to queue, notify |
| `issue.status_changed` | Status transition | Move cards, notify, update metrics |
| `issue.priority_changed` | Priority modified | Alert on escalations |
| `issue.closed` | Marked closed | Notify, update metrics, surveys |
| `issue.reopened` | Closed → Open | Investigate, re-prioritize |
| `issue.commented` | ✅ Comment added | AI response, notify participants |
| `issue.tagged` | Tag applied | Auto-categorize, notify watchers |
| `issue.due_date_approaching` | 1-7 days away | Remind assignee |
| `issue.overdue` | Past due date | Escalate to manager |
| `issue.blocked` | Dependency added | Notify of blocker |
| `issue.unblocked` | Blocker resolved | Resume work |
| `issue.linked_to_milestone` | Added to milestone | Update milestone progress |
| `issue.linked_to_initiative` | Added to initiative | Update roadmap |

### Project Webhooks (6 Events)

| Event | When | Use Cases |
|-------|------|-----------|
| `project.created` | New project | Initialize tools, create repos, notify team |
| `project.updated` | Details changed | Sync changes, notify stakeholders |
| `project.status_changed` | Status modified | Trigger workflows, update dashboards |
| `project.completion_milestone` | 25%, 50%, 75%, 100% | Celebrate, generate reports |
| `project.archived` | Marked archived | Archive resources, backup data |
| `project.deleted` | Permanently deleted | Cleanup, audit logging |

### Milestone Webhooks (7 Events)

| Event | When | Use Cases |
|-------|------|-----------|
| `milestone.created` | New milestone | Schedule planning, notify team |
| `milestone.updated` | Details changed | Recalculate timelines |
| `milestone.status_changed` | Status modified | Notify stakeholders |
| `milestone.completed` | All issues done | Celebrate, release notes |
| `milestone.due_date_approaching` | Deadline near | Progress warnings |
| `milestone.overdue` | Past due date | Escalate, adjust timeline |
| `milestone.progress_updated` | Completion % changes | Update dashboards |

### System Webhooks (5 Events)

| Event | When | Use Cases |
|-------|------|-----------|
| `system.daily_digest` | Daily at configured time | Email summaries, reports |
| `system.weekly_report` | Weekly | Performance reports, planning |
| `system.backup_completed` | Backup done | Notify admins, verify integrity |
| `system.health_check_failed` | Health check fails | Alert on-call, incident response |
| `system.ai_analysis_complete` | AI task done | Notify user, display results |

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create webhook dispatcher service
- [ ] Add webhook subscription database tables
- [ ] Build webhook management API
- [ ] Create test webhook receiver

### Phase 2: Core Webhooks (Week 3-4)
- [ ] `issue.created`, `issue.updated`, `issue.status_changed`
- [ ] `project.created`, `project.status_changed`
- [ ] `milestone.completed`
- [ ] Test with multiple subscribers

### Phase 3: UI & Management (Week 5-6)
- [ ] Webhook settings page in frontend
- [ ] Test webhook functionality
- [ ] View webhook logs
- [ ] Retry failed webhooks

### Phase 4: Integrations (Week 7-8)
- [ ] Slack integration pack
- [ ] Discord integration pack
- [ ] Email notifications
- [ ] GitHub sync

---

## 📚 Documentation

### Available Guides
1. **WEBHOOK_SYSTEM_DESIGN.md** - Complete system design with all 70+ webhooks
2. **WEBHOOK_IMPLEMENTATION_GUIDE.md** - Step-by-step code examples
3. **WEBHOOK_SUMMARY.md** - This file, quick reference

### Key Files
- `scripts/claude_webhook_server.py` - Current webhook server
- `turbo/core/services/claude_webhook.py` - Webhook service
- `turbo/api/v1/endpoints/comments.py` - Comment webhook implementation

---

## 🎉 Quick Wins

### Implement These 3 Today (1 hour total)

1. **`issue.created`** (30 min)
   - High value for automation
   - Easy to implement
   - Multiple use cases

2. **`issue.status_changed`** (20 min)
   - Critical for workflows
   - Simple to add
   - Enables board automation

3. **`project.created`** (10 min)
   - Low hanging fruit
   - Tests project webhooks
   - Enables project automation

### Expected Results
- 4 working webhooks (including existing comment webhook)
- Real-time notifications to Slack/Discord/Custom
- Foundation for more complex automations
- Team can start building integrations

---

## 💡 Ideas & Use Cases

### Team Notifications
- New high-priority issues → #urgent channel
- Issue assigned to you → DM
- Milestone completed → #celebrations
- Daily digest → #team-updates

### Automation
- Issue created with label "bug" → Auto-assign to QA team
- Issue moved to "testing" → Trigger test suite
- Milestone completed → Generate release notes
- Project created → Initialize GitHub repo

### Analytics
- Track issue lifecycle times
- Team velocity metrics
- Burndown charts
- Bottleneck detection

### AI Enhancements
- ✅ Comment analysis (current)
- Issue complexity estimation
- Auto-tagging based on content
- Duplicate detection
- Priority suggestions

---

## 🔧 Troubleshooting

### Webhook Server Not Running?
```bash
# Check if running
lsof -i :9000

# Start it
python scripts/claude_webhook_server.py
```

### Webhook Not Triggering?
1. Check webhook subscription exists
2. Verify event type matches
3. Check API logs: `docker-compose logs -f turbo-api | grep webhook`
4. Ensure CLAUDE_AUTO_RESPOND=true

### Test Webhook Manually
```bash
curl -X POST http://localhost:9000/webhook/comment \
  -H "Content-Type: application/json" \
  -d '{"issue_id": "your-uuid"}'
```

---

## 📞 Support

Questions? Ideas? Issues?
- See comprehensive design: `docs/WEBHOOK_SYSTEM_DESIGN.md`
- See implementation guide: `docs/WEBHOOK_IMPLEMENTATION_GUIDE.md`
- Check current implementation: `scripts/claude_webhook_server.py`

---

**Status**: ✅ 1 webhook implemented, 69 ready to implement
**Next Action**: Implement top 3 webhooks (1 hour)
**Goal**: Enable powerful integrations and automation across Turbo Code
