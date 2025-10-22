---
doc_type: other
project_name: Turbo Code Platform
title: Issue Refinement Guide
version: '1.0'
---

# Issue Refinement Guide

**AI-Powered Issue Hygiene with Human-in-the-Loop**

The Issue Refinement system automatically analyzes your issues to identify maintenance opportunities while keeping you in control of critical decisions.

## Quick Start

### Option 1: Via MCP Tools (from Claude Code)

```
1. Analyze issues:
   Use the `refine_issues_analyze` tool to get a refinement plan

2. Review the plan:
   - SAFE changes: Auto-applicable (tags, templates)
   - REQUIRES APPROVAL: Need your approval (status, dependencies)

3. Execute changes:
   - Auto-apply safe changes: Use `refine_issues_execute` with mode="safe"
   - Apply approved changes: Use `refine_issues_execute` with mode="approved"
```

### Option 2: Via API

```bash
# Analyze all issues
curl -X POST "http://localhost:8001/api/v1/issue-refinement/analyze"

# Analyze specific project
curl -X POST "http://localhost:8001/api/v1/issue-refinement/analyze?project_id=<uuid>"

# Execute safe changes
curl -X POST "http://localhost:8001/api/v1/issue-refinement/execute-safe" \
  -H "Content-Type: application/json" \
  -d '[{"type": "add_tags", "issue_id": "..."}]'

# Execute approved changes
curl -X POST "http://localhost:8001/api/v1/issue-refinement/execute-approved" \
  -H "Content-Type: application/json" \
  -d '[{"type": "update_status", "issue_id": "..."}]'
```

## What It Detects

### SAFE Changes (Auto-Apply)

✅ **Content-Based Tags**
- Suggests tags based on issue content
- Examples: "frontend", "backend", "bug", "documentation"

✅ **Missing Descriptions**
- Adds appropriate templates for bug/feature/task issues
- Only for issues with < 20 characters in description

### REQUIRES APPROVAL Changes

⚠️ **Stale Status**
- Issues in "in_progress"/"review"/"testing" with no updates in 30+ days
- Proposes resetting to "open"

⚠️ **Missing Dependencies**
- Detects mentions like "blocked by #123" in descriptions
- Suggests adding formal blocking relationships

⚠️ **Orphaned Issues**
- Issues without project, assignee, or milestone
- Flags for review

## Example Workflow

### 1. Analyze Issues

**MCP Tool:**
```json
{
  "tool": "refine_issues_analyze",
  "arguments": {
    "project_id": "optional-uuid",
    "include_safe": true,
    "include_approval": true
  }
}
```

**Response:**
```
# Issue Refinement Analysis

**Summary:**
- Issues analyzed: 42
- Safe changes (auto-apply): 8
- Approval needed: 5

**SAFE CHANGES (Auto-applicable):**
- [add_tags] Add user authentication: Add tags: backend, security
- [add_description_template] Fix login bug: Add description template
...

**REQUIRES APPROVAL:**
- [update_status] Implement dashboard: Reset stale 'in_progress' → 'open'
  Reason: No updates in 30+ days while marked as 'in_progress'
- [add_dependency] Add API endpoint: Add blocker: 'Setup database' blocks this issue
  Reason: Mentioned in description: 'blocked by database setup'
...
```

### 2. Execute Safe Changes

**MCP Tool:**
```json
{
  "tool": "refine_issues_execute",
  "arguments": {
    "mode": "safe",
    "changes": [/* safe_changes array from analyze */]
  }
}
```

### 3. Review & Approve Critical Changes

Review the "REQUIRES APPROVAL" section. For each change:
- ✅ Approve: Add to approved array
- ❌ Reject: Skip it

### 4. Execute Approved Changes

**MCP Tool:**
```json
{
  "tool": "refine_issues_execute",
  "arguments": {
    "mode": "approved",
    "changes": [/* your approved changes */]
  }
}
```

## Configuration

### Analysis Scope

```python
# All issues
refine_issues_analyze()

# Specific project
refine_issues_analyze(project_id="uuid")

# Only safe changes
refine_issues_analyze(include_approval=False)

# Only changes needing approval
refine_issues_analyze(include_safe=False)
```

## Safety Guarantees

### Never Auto-Applied
- ❌ Status changes
- ❌ Dependency additions
- ❌ Milestone/initiative linking
- ❌ Priority changes
- ❌ Assignment changes

### Always Safe
- ✅ Tag suggestions (you review before applying)
- ✅ Description templates (appended, doesn't replace)
- ✅ Read-only analysis

## Advanced Usage

### Scheduled Refinement

Create a cron job or GitHub Action:

```yaml
# .github/workflows/issue-refinement.yml
name: Weekly Issue Refinement
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9am

jobs:
  refine:
    runs-on: ubuntu-latest
    steps:
      - name: Analyze Issues
        run: |
          curl -X POST "${{ secrets.TURBO_API_URL }}/issue-refinement/analyze"
      # Add notification step
```

### Integration with MCP

The MCP tools automatically format results for readability and provide structured data for programmatic use.

## Troubleshooting

### No suggestions found?
- Your issues might already be well-maintained! 🎉
- Try broadening scope: Remove `project_id` filter
- Check if issues are recent (stale detection is 30+ days)

### Safe changes not applying?
- Check API logs for errors
- Verify issue IDs are valid UUIDs
- Ensure database permissions are correct

### Want more aggressive automation?
- Modify `IssueRefinementService._suggest_tags()` patterns
- Adjust stale threshold in `_is_stale_status()`
- Add custom rules to analysis logic

## Files

- **Service**: `/turbo/core/services/issue_refinement.py`
- **API**: `/turbo/api/v1/endpoints/issue_refinement.py`
- **MCP Tools**: `/turbo/mcp_server.py` (search for "Issue Refinement")

## Future Enhancements

Potential additions:
- [ ] ML-based duplicate detection
- [ ] Automated dependency inference from code analysis
- [ ] Smart milestone suggestions based on deadlines
- [ ] Sentiment analysis for prioritization
- [ ] Auto-close stale issues with no activity
