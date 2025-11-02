# Sub-Agent Orchestration Plan

**Date**: October 23, 2025
**Status**: Planning Phase

## Vision

Enable multiple Claude Code instances to work in parallel on different issues within the same project, coordinated through the turboCode system with git worktrees for isolation.

## Architecture

### Core Components

1. **Main Coordinator (turboCode System)**
   - Central database tracking all work
   - Work queue management
   - Worktree allocation
   - Progress monitoring
   - Conflict detection

2. **Sub-Agent Instances (Claude Code)**
   - Independent Claude Code sessions
   - Each assigned to specific issues
   - Isolated git worktrees
   - MCP connection to turboCode
   - Autonomous task execution

3. **Communication Layer**
   - WebSocket connections for real-time updates
   - Webhook system for event notifications
   - MCP protocol for database operations
   - Git for code synchronization

## Workflow

### 1. Work Assignment

```python
# Main coordinator assigns work to sub-agents
async def assign_work_to_subagent(agent_id: str, issue_id: UUID):
    """
    Assign an issue to a sub-agent.

    1. Mark issue as 'assigned' in database
    2. Create git worktree for the issue
    3. Notify sub-agent via webhook
    4. Track assignment in work log
    """
    issue = await issue_service.get_issue_by_id(issue_id)

    # Create worktree
    worktree = await worktree_service.create_worktree(
        issue_id=issue_id,
        project_path=project.local_path,
        base_branch="main"
    )

    # Update issue
    await issue_service.update_issue(issue_id, {
        "status": "assigned",
        "assigned_to": f"ai:{agent_id}"
    })

    # Start work log
    work_log = await issue_service.start_work(
        issue_id=issue_id,
        started_by=f"ai:{agent_id}",
        project_path=project.local_path
    )

    # Notify sub-agent
    await notify_subagent(agent_id, {
        "action": "work_assigned",
        "issue": issue,
        "worktree_path": worktree["worktree_path"],
        "branch_name": worktree["branch_name"]
    })
```

### 2. Sub-Agent Execution

Each sub-agent:
1. Receives work assignment via webhook
2. Changes directory to worktree
3. Reads issue details from turboCode
4. Executes development tasks autonomously
5. Commits changes to branch
6. Submits for review when complete

```bash
# Sub-agent workflow
cd ~/worktrees/turboCode-TURBOCODE-1/

# Read issue context
mcp__turbo__get_issue(issue_id="TURBOCODE-1")

# Work on the issue
# ... autonomous development ...

# Commit work
git add .
git commit -m "TURBOCODE-1: Implement feature X"
git push origin TURBOCODE-1/implement-feature-x

# Submit for review
mcp__turbo__submit_issue_for_review(
    issue_id="TURBOCODE-1",
    commit_url="https://github.com/org/repo/commit/abc123"
)
```

### 3. Progress Monitoring

Main coordinator tracks:
- Active work logs per sub-agent
- Worktree status (uncommitted changes, etc.)
- Issue dependencies and blockers
- Overall project completion

```python
# Monitor all sub-agents
async def monitor_subagents():
    """Check status of all active sub-agents."""
    active_work_logs = await work_log_service.get_active_work_logs()

    for log in active_work_logs:
        if log.worktree_path:
            # Check worktree status
            status = await worktree_service.get_worktree_status(
                log.worktree_path
            )

            # Alert if uncommitted for too long
            if status["has_changes"]:
                time_since_start = datetime.now() - log.started_at
                if time_since_start > timedelta(hours=2):
                    await alert_stale_work(log)
```

### 4. Conflict Resolution

Strategies for handling conflicts:
1. **Issue Dependencies**: Block dependent issues until blockers complete
2. **File Conflicts**: Detect via git merge simulation
3. **Resource Contention**: One sub-agent per issue maximum
4. **Priority Handling**: Higher priority issues get resources first

### 5. Completion & Cleanup

When sub-agent completes:
1. Push branch to remote
2. Create pull request
3. Submit for review in turboCode
4. Remove worktree
5. End work log
6. Free up sub-agent for next task

## Implementation Phases

### Phase 1: Foundation (COMPLETED)
- ✅ Entity keys system
- ✅ Git worktree management
- ✅ Work log tracking
- ✅ Webhook infrastructure
- ✅ MCP tools for worktree operations

### Phase 2: Sub-Agent Communication (2-3 days)
- [ ] Webhook event system for work assignment
- [ ] WebSocket connections for real-time updates
- [ ] Sub-agent registration/deregistration
- [ ] Heartbeat monitoring
- [ ] Work queue distribution algorithm

### Phase 3: Orchestration Logic (3-5 days)
- [ ] Automatic work assignment based on priority
- [ ] Dependency-aware scheduling
- [ ] Conflict detection and prevention
- [ ] Progress tracking dashboard
- [ ] Sub-agent health monitoring

### Phase 4: Advanced Features (5-7 days)
- [ ] Automatic PR creation
- [ ] CI/CD integration per worktree
- [ ] Test execution in parallel worktrees
- [ ] Code review automation
- [ ] Sub-agent specialization (backend, frontend, testing, etc.)

## Configuration

### Sub-Agent Pool

```yaml
subagents:
  - id: backend-1
    specialization: backend
    max_concurrent_issues: 2
    capabilities:
      - python
      - fastapi
      - database

  - id: frontend-1
    specialization: frontend
    max_concurrent_issues: 1
    capabilities:
      - typescript
      - react
      - nextjs

  - id: testing-1
    specialization: testing
    max_concurrent_issues: 3
    capabilities:
      - pytest
      - integration-tests
```

### Work Queue Prioritization

```python
# Priority calculation
def calculate_priority_score(issue):
    score = 0

    # Base priority
    priority_weights = {
        "critical": 100,
        "high": 50,
        "medium": 25,
        "low": 10
    }
    score += priority_weights[issue.priority]

    # Dependency factor
    blockers = get_blocking_issues(issue.id)
    if not blockers:  # No blockers, ready to work
        score += 20

    # Age factor
    age_days = (datetime.now() - issue.created_at).days
    score += min(age_days * 0.5, 20)

    # Blocking factor (this issue blocks others)
    blocked = get_blocked_issues(issue.id)
    score += len(blocked) * 5

    return score
```

## Safety & Constraints

### Resource Limits
- Max 5 concurrent sub-agents
- Max 2 issues per sub-agent
- Max 10 active worktrees per project
- Work session timeout: 4 hours

### Safeguards
- Never force-push to main/master
- Always create PRs, never direct merge
- Require human approval for deployment
- Auto-rollback on test failures
- Rate limiting on API calls

### Monitoring Alerts
- Sub-agent inactive for > 30 minutes
- Worktree with uncommitted changes > 2 hours
- Test failures in any worktree
- Merge conflicts detected
- Resource exhaustion warnings

## Benefits

1. **Parallel Development**: 5x faster development with 5 sub-agents
2. **Specialized Expertise**: Backend, frontend, testing agents
3. **24/7 Operation**: Continuous development
4. **Isolation**: No branch conflicts, clean separation
5. **Traceability**: Full audit trail in work logs
6. **Human-Readable**: Entity keys make tracking easy

## Challenges

1. **Coordination Overhead**: Need robust orchestration
2. **Resource Management**: CPU, memory, API quotas
3. **Code Quality**: Ensuring consistent standards
4. **Test Coverage**: Coordinating test suites
5. **Review Process**: Managing multiple PRs

## Next Steps

1. **Week 1**: Implement webhook event system
2. **Week 2**: Build orchestration logic
3. **Week 3**: Test with 2-3 sub-agents
4. **Week 4**: Scale to 5 sub-agents
5. **Week 5**: Advanced features & optimization

## Success Metrics

- **Development Velocity**: Issues completed per day
- **Code Quality**: Test coverage, review pass rate
- **Resource Efficiency**: Sub-agent utilization rate
- **Conflict Rate**: Merge conflicts per 100 commits
- **Time to Production**: Average PR merge time

## Related Documentation

- `GIT_WORKTREE_INTEGRATION.md`: Worktree management
- `ENTITY_KEYS_IMPLEMENTATION_STATUS.md`: Entity keys system
- `WEBHOOK_IMPLEMENTATION_GUIDE.md`: Webhook infrastructure
