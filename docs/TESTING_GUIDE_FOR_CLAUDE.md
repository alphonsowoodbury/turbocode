# Testing Guide for Claude Code - Entity Keys & Worktree System

**Purpose**: This guide helps a fresh Claude Code instance test the complete entity keys and git worktree system.

## Prerequisites

- turboCode system running (all Docker containers up)
- Database migrated with entity keys (migration 019 and 020)
- MCP server configured and connected
- API running at http://localhost:8000

## Quick System Verification

### Step 1: Verify MCP Tools Are Available

Ask Claude to run:
```python
# List all available turbo MCP tools
# Should include: start_work_on_issue, submit_issue_for_review, list_worktrees, get_worktree_status
```

Expected tools (among others):
- `start_work_on_issue`
- `submit_issue_for_review`
- `list_worktrees`
- `get_worktree_status`

### Step 2: List Projects and Find One with Keys

```python
mcp__turbo__list_projects(limit=5)
```

Expected: Projects with `project_key` field (e.g., "TURBOCODE", "CONTEXTP")

### Step 3: List Issues and Verify Keys Exist

```python
mcp__turbo__list_issues(limit=10)
```

Expected: Issues with `issue_key` field (e.g., "TURBOCODE-1", "TURBOCODE-2")

## Test 1: Key-Based Issue Lookup

### Test Getting Issue by Key

```python
# Get issue by key (instead of UUID)
mcp__turbo__get_issue(issue_id="TURBOCODE-1")
```

**Expected Result**:
- Issue details returned
- Has `issue_key: "TURBOCODE-1"`
- Has `issue_number: 1`
- Includes all standard fields (title, description, status, etc.)

**Success Criteria**: ✅ Issue retrieved using key instead of UUID

## Test 2: Create Issue and Verify Key Generation

### Create New Issue

```python
mcp__turbo__create_issue(
    title="Test Entity Keys System",
    description="Testing automatic key generation",
    type="task",
    priority="medium",
    project_id="<uuid-of-project-with-key>"  # Use project UUID from Step 2
)
```

**Expected Result**:
- Issue created successfully
- Automatically assigned `issue_key` (e.g., "TURBOCODE-117")
- Automatically assigned `issue_number` (sequential within project)

**Success Criteria**: ✅ New issue has auto-generated key

## Test 3: Git Worktree Creation (Start Work)

### Prepare Test Issue

First, find or create an issue in "ready" status with a key.

### Start Work with Worktree Creation

```python
mcp__turbo__start_work_on_issue(
    issue_id="TURBOCODE-1",  # Use key, not UUID!
    started_by="ai:claude-test",
    project_path="/"
)
```

**Expected Result**:
```json
{
  "issue": {
    "status": "in_progress",
    "issue_key": "TURBOCODE-1",
    ...
  },
  "work_log": {
    "started_by": "ai:claude-test",
    "worktree_path": "/Users/alphonso/worktrees/turboCode-TURBOCODE-1",
    "branch_name": "TURBOCODE-1/test-entity-keys-system",
    ...
  },
  "message": "Work started successfully"
}
```

**Verify Worktree Created**:
```bash
# Ask Claude to run:
ls ~/worktrees/
# Should show: turboCode-TURBOCODE-1/

git worktree list
# Should show the new worktree
```

**Success Criteria**:
- ✅ Issue status changed to "in_progress"
- ✅ Work log created
- ✅ Worktree created at ~/worktrees/turboCode-TURBOCODE-1/
- ✅ Branch created: TURBOCODE-1/test-entity-keys-system

## Test 4: Check Worktree Status

### Get Status of Created Worktree

```python
mcp__turbo__get_worktree_status(
    worktree_path="/Users/alphonso/worktrees/turboCode-TURBOCODE-1"
)
```

**Expected Result**:
```json
{
  "has_changes": false,  # Or true if files were modified
  "uncommitted_files": 0,  # Number of uncommitted files
  "branch": "TURBOCODE-1/test-entity-keys-system",
  "path": "/Users/alphonso/worktrees/turboCode-TURBOCODE-1"
}
```

**Success Criteria**: ✅ Status returned with branch and path info

## Test 5: List All Worktrees

### List Worktrees for Project

```python
mcp__turbo__list_worktrees(
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)
```

**Expected Result**:
```json
[
  {
    "path": "/Users/alphonso/Documents/Code/PycharmProjects/turboCode",
    "branch": "refs/heads/main",
    "commit": "<commit-hash>"
  },
  {
    "path": "/Users/alphonso/worktrees/turboCode-TURBOCODE-1",
    "branch": "refs/heads/TURBOCODE-1/test-entity-keys-system",
    "commit": "<commit-hash>"
  }
]
```

**Success Criteria**: ✅ All worktrees listed including the main repo and test worktree

## Test 6: Submit for Review (Worktree Cleanup)

### Submit Issue for Review

```python
mcp__turbo__submit_issue_for_review(
    issue_id="TURBOCODE-1",  # Use key!
    commit_url="https://github.com/test/repo/commit/abc123",
    cleanup_worktree=True  # Default
)
```

**Expected Result**:
```json
{
  "issue": {
    "status": "review",
    "issue_key": "TURBOCODE-1",
    ...
  },
  "work_log": {
    "ended_at": "<timestamp>",
    "commit_url": "https://github.com/test/repo/commit/abc123",
    "time_spent_minutes": <number>,
    ...
  },
  "message": "Issue submitted for review successfully"
}
```

**Verify Worktree Removed**:
```bash
# Ask Claude to run:
ls ~/worktrees/
# Should NOT show: turboCode-TURBOCODE-1/ (removed)

git worktree list
# Should NOT show the test worktree
```

**Success Criteria**:
- ✅ Issue status changed to "review"
- ✅ Work log ended with commit URL
- ✅ Worktree removed from ~/worktrees/
- ✅ Time spent calculated

## Test 7: API Direct Testing (Optional)

### Test Key-Based API Endpoints

Ask Claude to run these curl commands:

```bash
# Get issue by key (not UUID!)
curl http://localhost:8000/api/v1/issues/TURBOCODE-1

# Update issue by key
curl -X PUT http://localhost:8000/api/v1/issues/TURBOCODE-1 \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'

# List worktrees
curl "http://localhost:8000/api/v1/worktrees/?project_path=/Users/alphonso/Documents/Code/PycharmProjects/turboCode"

# Get worktree status
curl "http://localhost:8000/api/v1/worktrees/status?worktree_path=/Users/alphonso/worktrees/turboCode-TURBOCODE-1"
```

**Success Criteria**: ✅ All endpoints return successful responses

## Test 8: Frontend Verification (Visual)

### Check Issue Keys in UI

1. Open frontend: http://localhost:3010
2. Navigate to Work Queue
3. Look for issue cards

**Expected**: Issue keys displayed as badges (e.g., `[TURBOCODE-1]`) before issue titles

**Success Criteria**: ✅ Keys visible in monospace font in work queue

## Complete Test Workflow (End-to-End)

### Full Cycle Test

```python
# 1. Create test issue
new_issue = mcp__turbo__create_issue(
    title="Full Workflow Test",
    description="Testing complete entity keys and worktree workflow",
    type="task",
    priority="medium",
    status="ready",  # Important: must be ready to start work
    project_id="<project-uuid-with-key>"
)

# Note the issue_key from response (e.g., "TURBOCODE-118")

# 2. Start work (creates worktree)
work_started = mcp__turbo__start_work_on_issue(
    issue_id=new_issue["issue_key"],  # Use the key!
    started_by="ai:claude-test",
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)

# 3. Verify worktree exists
worktree_status = mcp__turbo__get_worktree_status(
    worktree_path=work_started["work_log"]["worktree_path"]
)

# 4. List all worktrees
all_worktrees = mcp__turbo__list_worktrees(
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)

# 5. Submit for review (removes worktree)
review_submitted = mcp__turbo__submit_issue_for_review(
    issue_id=new_issue["issue_key"],
    commit_url="https://github.com/test/repo/commit/test123"
)

# 6. Verify worktree removed
# Should get error or empty result
final_check = mcp__turbo__list_worktrees(
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)
```

**Success Criteria**:
- ✅ All steps complete without errors
- ✅ Issue key used throughout (not UUID)
- ✅ Worktree created then removed
- ✅ Work log tracks entire session

## Troubleshooting

### Issue: "Issue not found" with key

**Solution**: Verify the issue exists and has a key:
```python
mcp__turbo__list_issues(project_id="<project-uuid>", limit=10)
```

### Issue: Worktree creation fails

**Possible Causes**:
1. Not a git repository at `project_path`
2. Issue doesn't have a key (discovery issues without project_id)
3. Worktree already exists at that path

**Solution**: Check issue has `issue_key` field and `project_id` set

### Issue: MCP tools not available

**Solution**: Verify MCP server is running:
```bash
docker ps | grep claude-code
docker logs turbo-claude-code
```

### Issue: API endpoints return 404

**Solution**: Verify API is running:
```bash
curl http://localhost:8000/health
docker logs turbo-api
```

## Summary Checklist

Use this checklist to verify the system:

- [ ] MCP tools available (start_work_on_issue, submit_issue_for_review, etc.)
- [ ] Projects have `project_key` field
- [ ] Issues have `issue_key` and `issue_number` fields
- [ ] Can get issue by key (not just UUID)
- [ ] New issues auto-generate keys
- [ ] Start work creates worktree at ~/worktrees/ProjectName-KEY/
- [ ] Start work creates branch KEY/sanitized-title
- [ ] Work log tracks worktree_path and branch_name
- [ ] Get worktree status returns uncommitted files count
- [ ] List worktrees returns all worktrees including test one
- [ ] Submit for review removes worktree
- [ ] Submit for review ends work log with time spent
- [ ] API endpoints accept keys (GET /issues/TURBOCODE-1)
- [ ] Frontend displays issue keys in work queue

## Expected Final State

After all tests:
- At least one issue created with auto-generated key
- Work log created and completed for test issue
- Worktree created then removed (cleanup verified)
- All MCP tools tested and working
- API endpoints tested with keys
- Frontend showing keys in UI

## Quick Test Script for Claude

**Copy and paste this to Claude Code to run all tests**:

```
I need you to test the entity keys and git worktree system. Please:

1. List projects and verify they have project_key fields
2. List issues and verify they have issue_key fields
3. Get one issue by its key (e.g., "TURBOCODE-1") instead of UUID
4. Create a new test issue and verify it gets an auto-generated key
5. Start work on an issue (with project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode") and verify worktree is created
6. Check the worktree status
7. List all worktrees
8. Submit the issue for review and verify worktree is removed

For each step, tell me the result and whether it succeeded or failed.
```

## Reference Documentation

- `GIT_WORKTREE_INTEGRATION.md` - Complete worktree system docs
- `ENTITY_KEYS_IMPLEMENTATION_STATUS.md` - Entity keys status
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full implementation summary
- `SUBAGENT_ORCHESTRATION_PLAN.md` - Future sub-agent planning
