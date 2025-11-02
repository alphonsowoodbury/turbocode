# Testing Entity Keys System (No Git Access Required)

**Purpose**: Test the entity keys system when Claude Code doesn't have direct git repository access (e.g., running in Xcode, container, or remote environment).

This focuses on testing the **database and API features** without requiring git worktree creation.

## What You CAN Test Without Git

1. ✅ Entity keys exist on all entities
2. ✅ Auto-generation of keys for new entities
3. ✅ Key-based lookups (use key instead of UUID)
4. ✅ MCP tools accept keys
5. ✅ API endpoints accept keys
6. ✅ Work logs are created (without worktree fields)

## What You CANNOT Test Without Git

1. ❌ Git worktree creation
2. ❌ Git worktree cleanup
3. ❌ Worktree status checks
4. ❌ Branch creation

**Note**: The worktree features are gracefully skipped if git access is unavailable. The core workflow still works!

## Quick Test Script (No Git Required)

### Test 1: Verify Entity Keys Exist

```python
# Check that existing issues have keys
issues = mcp__turbo__list_issues(limit=5)
```

**Look for**: Each issue should have `issue_key` field (e.g., "TURBOCODE-1")

**Success**: ✅ If issues have issue_key and issue_number fields

---

### Test 2: Get Issue by Key

```python
# Use a key you found in Test 1
issue = mcp__turbo__get_issue(issue_id="TURBOCODE-1")
```

**Look for**: Issue details returned

**Success**: ✅ If issue is retrieved using the key (not a UUID)

---

### Test 3: Create Issue with Auto-Key

```python
# First get a project ID
projects = mcp__turbo__list_projects(limit=1)
project_id = projects[0]["id"]

# Create a new issue
new_issue = mcp__turbo__create_issue(
    title="Test Entity Key Auto-Generation",
    description="Testing that new issues automatically get keys",
    type="task",
    priority="medium",
    status="open",
    project_id=project_id
)
```

**Look for**:
- `issue_key` field in response (e.g., "TURBOCODE-117")
- `issue_number` field in response (sequential number)

**Success**: ✅ If new issue has auto-generated key

---

### Test 4: Update Issue by Key

```python
# Use the key from the issue you just created
updated = mcp__turbo__update_issue(
    issue_id="TURBOCODE-117",  # Use your auto-generated key
    status="ready"
)
```

**Look for**: Issue updated successfully

**Success**: ✅ If update worked using the key

---

### Test 5: Test All Entity Types Have Keys

```python
# Check projects
projects = mcp__turbo__list_projects(limit=3)
# Look for: project_key field (e.g., "TURBOCODE")

# Check milestones
milestones = mcp__turbo__list_milestones(limit=3)
# Look for: milestone_key field (e.g., "TURBOCODE-M1")

# Check documents
documents = mcp__turbo__list_documents(limit=3)
# Look for: document_key field (e.g., "TURBOCODE-D1")

# Check initiatives
initiatives = mcp__turbo__list_initiatives(limit=3)
# Look for: initiative_key field (e.g., "TURBOCODE-I1")
```

**Success**: ✅ If all entity types have key fields

---

### Test 6: API Endpoint Key Support (Direct Test)

```bash
# Test GET by key
curl http://localhost:8000/api/v1/issues/TURBOCODE-1

# Test PUT by key
curl -X PUT http://localhost:8000/api/v1/issues/TURBOCODE-1 \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

**Look for**: Successful responses (200 OK)

**Success**: ✅ If API accepts keys instead of UUIDs

---

### Test 7: Work Log Without Worktree

Since Claude Code might not have git access, test the work log system without worktree creation:

```python
# First update an issue to "ready" status
mcp__turbo__update_issue(
    issue_id="TURBOCODE-117",
    status="ready"
)

# Start work WITHOUT project_path (skips worktree creation)
work_started = mcp__turbo__start_work_on_issue(
    issue_id="TURBOCODE-117",
    started_by="ai:claude-test"
    # No project_path = no worktree creation
)
```

**Look for**:
- Issue status changed to "in_progress"
- Work log created
- `worktree_path` and `branch_name` will be null (expected without git access)

**Success**: ✅ If work starts successfully without worktree

---

### Test 8: Submit for Review Without Worktree

```python
# Submit the work (no worktree to cleanup)
review_submitted = mcp__turbo__submit_issue_for_review(
    issue_id="TURBOCODE-117",
    commit_url="https://github.com/test/repo/commit/test123"
)
```

**Look for**:
- Issue status changed to "review"
- Work log ended with commit URL
- Time spent calculated

**Success**: ✅ If review submission works without worktree

---

## Summary Test Results Format

Report your results like this:

```
Entity Keys System Test (No Git Access)
========================================

✅ Test 1: PASSED - 5 issues found, all have issue_key field
✅ Test 2: PASSED - Retrieved TURBOCODE-1 using key
✅ Test 3: PASSED - Created issue, auto-assigned TURBOCODE-117
✅ Test 4: PASSED - Updated issue using key
✅ Test 5: PASSED - All entity types (projects, issues, milestones, documents, initiatives) have keys
✅ Test 6: PASSED - API accepts keys in GET and PUT requests
✅ Test 7: PASSED - Started work without worktree (worktree_path=null as expected)
✅ Test 8: PASSED - Submitted for review, work log completed, time: 3 minutes

Summary: 8/8 core tests passed ✅

Note: Git worktree tests skipped (no git access) - this is expected and fine!
The entity keys and work log system works perfectly without worktrees.
```

## What This Proves

Even without git access, you can verify:

1. **Entity Keys Work**: All entities have human-readable keys
2. **Auto-Generation Works**: New entities get sequential keys
3. **Key-Based Lookups Work**: Can use TURBOCODE-1 instead of UUID everywhere
4. **MCP Integration Works**: All MCP tools accept keys
5. **API Integration Works**: All API endpoints accept keys
6. **Work Flow Works**: Can start work and submit for review (worktree optional)

The git worktree features are **bonus features** that add parallel development capabilities. The core system works great without them!

## Testing Git Features Later

When you DO have git access (e.g., you manually run commands in a terminal on the host machine), you can test:

```bash
# Manually verify worktrees work
cd /Users/alphonso/Documents/Code/PycharmProjects/turboCode

# List worktrees
git worktree list

# Check if any test worktrees exist
ls ~/worktrees/

# If you want to manually test worktree creation
git worktree add -b TURBOCODE-999/manual-test ~/worktrees/turboCode-TURBOCODE-999 main

# Then list again to verify
git worktree list

# Cleanup
git worktree remove ~/worktrees/turboCode-TURBOCODE-999
```

## Conclusion

The entity keys system is **fully functional** and can be tested without git access. The worktree features are **optional enhancements** for parallel development that require git access.

**Bottom line**: You can verify 95% of the implementation without touching git!
