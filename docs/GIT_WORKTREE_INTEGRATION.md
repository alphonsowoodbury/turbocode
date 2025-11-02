# Git Worktree Integration

**Date**: October 23, 2025
**Status**: COMPLETED - Local Execution Model

## Overview

Implemented automated git worktree management that creates isolated development environments for each issue. When you start work on an issue, a dedicated git worktree is automatically created with its own branch. When work is completed, the worktree is automatically cleaned up.

**⚠️ ARCHITECTURE NOTE**: Git operations run **locally** via the MCP server (not in the API container). Claude Code instances run on your local Mac and execute git commands directly on your filesystem. The API container only handles database operations (work logs, issue status updates).

## Key Features

### Automatic Worktree Creation
- **Triggered**: When calling `start_work()` on an issue
- **Location**: `~/worktrees/ProjectName-ISSUEKEY/` (e.g., `~/worktrees/turboCode-TURBOCODE-1/`)
- **Branch Name**: `ISSUEKEY/sanitized-title` (e.g., `TURBOCODE-1/fix-auth-bug`)
- **Base Branch**: Defaults to `main`, configurable
- **Tracked in Work Log**: Worktree path and branch name stored in work log

### Automatic Worktree Cleanup
- **Triggered**: When calling `submit_for_review()` on an issue
- **Safety Checks**: Checks for uncommitted changes before removal
- **Force Removal**: Uses `--force` to handle any uncommitted changes (with warning)
- **Optional**: Can disable cleanup with `cleanup_worktree=False` parameter

### Git Worktree Functions

Git operations are implemented as local functions in the MCP server (`turbo/mcp_server.py`):

```python
# Local git helper functions (run on your Mac, not in container)
def create_worktree_local(issue_key, issue_title, project_name, project_path, base_branch="main") -> dict
def remove_worktree_local(worktree_path, force=False) -> bool
def list_worktrees_local(project_path) -> list[dict]
def get_worktree_status_local(worktree_path) -> dict
```

These functions use `subprocess` to call local git commands directly on your filesystem.

### Work Log Enhancement

Added worktree tracking fields to work logs:
- `worktree_path`: Path to git worktree directory
- `branch_name`: Git branch name created for the issue

## Workflow Example

### Starting Work
```python
# Via API or MCP
await issue_service.start_work(
    issue_id=issue_id,
    started_by="user",
    project_path="/path/to/repo"
)

# What happens:
# 1. Validates issue is in 'ready' status
# 2. Creates worktree at ~/worktrees/ProjectName-ISSUEKEY/
# 3. Creates branch ISSUEKEY/fix-auth-bug from main
# 4. Updates issue status to 'in_progress'
# 5. Creates work log with worktree_path and branch_name
# 6. Adds automatic comment
```

### Submitting for Review
```python
# Via API or MCP
await issue_service.submit_for_review(
    issue_id=issue_id,
    commit_url="https://github.com/org/repo/commit/abc123",
    cleanup_worktree=True  # default
)

# What happens:
# 1. Validates issue is 'in_progress'
# 2. Checks worktree for uncommitted changes
# 3. Removes worktree (with force if needed)
# 4. Updates issue status to 'review'
# 5. Ends work log with commit URL
# 6. Adds automatic comment with time spent
```

## Manual Worktree Management

The service also supports manual operations:

```python
# List all worktrees for a project
worktrees = await worktree_service.list_worktrees("/path/to/repo")

# Check worktree status
status = await worktree_service.get_worktree_status("~/worktrees/Project-KEY-1/")
# Returns: {
#   "has_changes": bool,
#   "uncommitted_files": int,
#   "branch": str,
#   "path": str
# }

# Manual cleanup
removed = await worktree_service.remove_worktree(issue_id, force=True)
```

## Implementation Details

### Files Modified

#### New Files
- `turbo/core/services/git_worktree.py` - Git worktree management service
- `migrations/020_add_worktree_fields.sql` - Database migration

#### Updated Models
- `turbo/core/models/work_log.py` - Added `worktree_path` and `branch_name` columns

#### Updated Schemas
- `turbo/core/schemas/work_log.py` - Added worktree fields to `WorkLogBase`

#### Updated Services
- `turbo/core/services/issue.py`:
  - Added `worktree_service` parameter to `__init__`
  - Updated `start_work()` - Creates worktree, accepts `project_path` parameter
  - Updated `submit_for_review()` - Cleans up worktree, accepts `cleanup_worktree` parameter

#### Updated Dependency Injection
- `turbo/api/dependencies.py`:
  - Added `get_git_worktree_service()` factory
  - Injected worktree service into `get_issue_service()`

### Database Migration

Migration `020_add_worktree_fields.sql` adds:
- `issue_work_logs.worktree_path VARCHAR(500)` - Path to worktree directory
- `issue_work_logs.branch_name VARCHAR(100)` - Git branch name
- Indexes on both columns for performance
- Column comments for documentation

### Configuration

Default worktree location: `~/worktrees/`

To customize, create `GitWorktreeService` with:
```python
GitWorktreeService(
    issue_repository,
    project_repository,
    base_worktree_path="/custom/path/worktrees"
)
```

## Error Handling

### Graceful Failures
Both worktree creation and cleanup are **non-blocking**:
- If worktree creation fails, work still starts (logged as warning)
- If worktree cleanup fails, review still succeeds (logged as warning)
- This ensures git issues don't block core workflow

### Common Errors Handled
- **Not a git repo**: Validates with `git rev-parse --show-toplevel`
- **Worktree already exists**: Checks path before creation
- **Uncommitted changes**: Warns and uses `--force` on cleanup
- **Issue without key**: Only creates worktrees for issues with keys

## Integration with Entity Keys

Worktree management **requires entity keys** to function:
- Branch names use issue keys: `TURBOCODE-1/fix-auth-bug`
- Worktree directories use issue keys: `~/worktrees/turboCode-TURBOCODE-1/`
- Discovery issues without keys skip worktree creation (gracefully)

## Safety Features

1. **Validation**: Checks if project_path is a git repository
2. **Uniqueness**: Prevents duplicate worktrees for same issue
3. **Sanitization**: Branch/directory names are sanitized (alphanumeric, hyphens, underscores only)
4. **Status Checks**: Verifies issue status before operations
5. **Force Cleanup**: Handles uncommitted changes on cleanup
6. **Logging**: All operations logged for debugging

## Testing Recommendations

### Manual Testing

1. **Test Worktree Creation**:
   ```bash
   # Start work on an issue with a key (e.g., TURBOCODE-1)
   curl -X POST http://localhost:8000/api/v1/issues/{issue_id}/start \
     -H "Content-Type: application/json" \
     -d '{"started_by": "user", "project_path": "/path/to/turboCode"}'

   # Verify worktree created
   ls ~/worktrees/
   git worktree list
   ```

2. **Test Worktree Cleanup**:
   ```bash
   # Submit for review
   curl -X POST http://localhost:8000/api/v1/issues/{issue_id}/submit \
     -H "Content-Type: application/json" \
     -d '{"commit_url": "https://github.com/org/repo/commit/abc123"}'

   # Verify worktree removed
   ls ~/worktrees/
   git worktree list
   ```

3. **Test Manual Operations**:
   ```python
   # Via Python
   from turbo.core.services.git_worktree import GitWorktreeService

   service = GitWorktreeService(issue_repo, project_repo)

   # Create manually
   info = await service.create_worktree(
       issue_id=issue_id,
       project_path="/path/to/repo",
       base_branch="main"
   )
   print(info)  # {'worktree_path': '...', 'branch_name': '...', 'issue_key': '...'}

   # Check status
   status = await service.get_worktree_status(info['worktree_path'])
   print(status)

   # Cleanup
   removed = await service.remove_worktree(issue_id, force=True)
   print(removed)  # True
   ```

### Edge Cases to Test

1. **Discovery issues without project_id**: Should skip worktree creation
2. **Issues without keys**: Should skip worktree creation
3. **Non-git directory**: Should raise ValueError with clear message
4. **Existing worktree**: Should raise ValueError
5. **Uncommitted changes on cleanup**: Should warn and force remove
6. **Invalid project_path**: Should handle gracefully

## Future Enhancements

### Potential Improvements
1. **MCP Integration**: Add MCP tools for worktree management
2. **API Endpoints**: REST endpoints for manual worktree operations
3. **Webhook Events**: Emit events on worktree creation/cleanup
4. **Auto-push**: Optionally push branch to remote on creation
5. **Commit Validation**: Verify commit exists before cleanup
6. **Branch Protection**: Prevent cleanup if branch has remote commits
7. **Workspace Switching**: Helper to switch between worktrees
8. **Status Dashboard**: UI to show all active worktrees

### Long-term Vision
- **Sub-agent Orchestration**: Multiple Claude instances working in parallel worktrees
- **Automated Testing**: Run tests in each worktree before merge
- **CI/CD Integration**: Trigger builds for each worktree branch
- **Conflict Detection**: Warn if worktrees have conflicting changes

## Troubleshooting

### Worktree not created
- Check if issue has `issue_key` (discovery issues need project_id)
- Verify `project_path` is a valid git repository
- Check logs for error messages

### Worktree not cleaned up
- Check if `cleanup_worktree=True` (default)
- Look for warnings about uncommitted changes
- Manually remove with `git worktree remove --force <path>`

### Branch name issues
- Branch names are sanitized (alphanumeric + hyphens/underscores)
- Max length: 50 characters
- Format: `ISSUEKEY/sanitized-title`

### Permission issues
- Ensure user has write access to `~/worktrees/`
- Verify git repository permissions
- Check Docker volume mounts if running in container

## Related Documentation

- **Entity Keys**: `ENTITY_KEYS_IMPLEMENTATION_STATUS.md`
- **Work Logs**: `turbo/core/models/work_log.py`
- **Issue Service**: `turbo/core/services/issue.py`
- **Migration**: `migrations/020_add_worktree_fields.sql`

## Completion Status

- ✅ GitWorktreeService implementation
- ✅ Work log model updates
- ✅ Schema updates
- ✅ Issue service integration
- ✅ Dependency injection
- ✅ Database migration
- ✅ API container rebuild
- ⏳ End-to-end testing
- ⏳ MCP tool integration
- ⏳ API endpoint creation

**Next Steps**:
1. Test the workflow manually
2. Add MCP tools for worktree operations
3. Create REST API endpoints
4. Update documentation with real usage examples
