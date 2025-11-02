# Quick Test Script for Fresh Claude Code Instance

Copy and paste this entire message to a fresh Claude Code instance:

---

**System**: You are testing the turboCode entity keys and git worktree system. All Docker containers are running and the system is ready.

**Your Task**: Run these tests in order and report results for each step.

## Test 1: Verify Entity Keys Exist

```python
# List a few issues and check for issue_key field
mcp__turbo__list_issues(limit=5)
```

**Expected**: Issues should have `issue_key` field (e.g., "TURBOCODE-1", "TURBOCODE-2")

## Test 2: Get Issue by Key (Not UUID!)

```python
# Try getting an issue using its key instead of UUID
mcp__turbo__get_issue(issue_id="TURBOCODE-1")
```

**Expected**: Issue details returned successfully using the key

## Test 3: Create Issue and Verify Auto-Key Generation

First, get a project UUID:
```python
projects = mcp__turbo__list_projects(limit=1)
# Use the project_id from the first project
```

Then create an issue:
```python
mcp__turbo__create_issue(
    title="Test Auto-Key Generation",
    description="Testing that new issues get automatic keys",
    type="task",
    priority="medium",
    status="ready",
    project_id="<paste-project-id-here>"
)
```

**Expected**: New issue has `issue_key` field auto-generated (e.g., "TURBOCODE-117")

## Test 4: Start Work and Create Worktree

**IMPORTANT**: Only run this test if you're working directly on the local machine with git access.
If you're in a container or don't have git access, skip to Test 5 to test the API directly.

Use the issue you just created (or use "TURBOCODE-1"):

```python
# Only run if you have git access to the local repository
mcp__turbo__start_work_on_issue(
    issue_id="TURBOCODE-1",  # Use the key from previous step
    started_by="ai:claude-test",
    project_path="/"
)
```

**Expected**:
- Issue status → "in_progress"
- Work log created with `worktree_path` and `branch_name`
- Worktree created at `~/worktrees/turboCode-TURBOCODE-1/`

**If this fails with git errors**: That's expected if Claude Code doesn't have direct git access. The MCP tools still work, but worktree creation will be skipped. This is fine - the work log will still be created without the worktree fields.

## Test 5: Verify Worktree Exists

```bash
ls ~/worktrees/
```

**Expected**: Should see directory `turboCode-TURBOCODE-1` (or similar with your issue key)

Also check git:
```bash
git worktree list
```

**Expected**: New worktree listed with branch name like `TURBOCODE-1/test-auto-key-generation`

## Test 6: Get Worktree Status

```python
mcp__turbo__get_worktree_status(
    worktree_path="/Users/alphonso/worktrees/turboCode-TURBOCODE-1"
)
```

**Expected**: Returns status with `has_changes`, `uncommitted_files`, `branch`, `path`

## Test 7: List All Worktrees

```python
mcp__turbo__list_worktrees(
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)
```

**Expected**: List of worktrees including main repo and your test worktree

## Test 8: Submit for Review and Cleanup Worktree

```python
mcp__turbo__submit_issue_for_review(
    issue_id="TURBOCODE-1",  # Same issue key
    commit_url="https://github.com/test/repo/commit/testCommit123"
)
```

**Expected**:
- Issue status → "review"
- Work log ended with commit URL and time spent
- Worktree removed from `~/worktrees/`

## Test 9: Verify Worktree Removed

```bash
ls ~/worktrees/
```

**Expected**: The test worktree directory should be gone

```bash
git worktree list
```

**Expected**: Test worktree should NOT be in the list anymore

## Test 10: API Direct Test (Optional)

```bash
curl http://localhost:8000/api/v1/issues/TURBOCODE-1
```

**Expected**: Issue details returned (proves API accepts keys instead of UUIDs)

---

## Report Format

Please report results like this:

```
✅ Test 1: PASSED - Found 5 issues, all have issue_key field (TURBOCODE-1, TURBOCODE-2, etc.)
✅ Test 2: PASSED - Retrieved issue using key "TURBOCODE-1"
✅ Test 3: PASSED - Created issue, auto-assigned key "TURBOCODE-117"
✅ Test 4: PASSED - Started work, worktree created at ~/worktrees/turboCode-TURBOCODE-117/
✅ Test 5: PASSED - Verified worktree exists
✅ Test 6: PASSED - Worktree status: branch=TURBOCODE-117/test-auto-key-generation, has_changes=false
✅ Test 7: PASSED - Listed 2 worktrees (main + test)
✅ Test 8: PASSED - Submitted for review, work log ended, time spent: 2 minutes
✅ Test 9: PASSED - Worktree removed successfully
✅ Test 10: PASSED - API returned issue with key

Summary: 10/10 tests passed ✅
```

Or if something fails:
```
❌ Test 4: FAILED - Error: "Issue must be in 'ready' status"
   Issue: The test issue was created with status "open" instead of "ready"
   Fix: Create issue with status="ready" or update issue status first
```

---

**Start testing now!** Run each test in order and report the results.
