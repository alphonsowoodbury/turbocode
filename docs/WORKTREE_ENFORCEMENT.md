# Git Worktree Enforcement System

**Date**: October 23, 2025
**Status**: ACTIVE

## Overview

To ensure safe parallel development and prevent accidental changes to the main working directory, we've implemented a **two-layer enforcement system** for git worktree usage with Claude Code.

## Enforcement Layers

### Layer 1: Pre-Edit Hook (Technical Enforcement)

**Location**: `~/.config/claude-code/hooks/pre-edit.sh`

**Function**: Automatically blocks file edits outside of git worktrees.

**How It Works**:
1. Hook is called before every file edit operation
2. Checks if file path is within `~/worktrees/*`
3. If YES → Allow edit (exit 0)
4. If NO and in main project directory → Block edit (exit 1)
5. If NO and outside project → Allow (for config files, etc.)

**Error Message**:
```
❌ ERROR: Cannot edit files in main working directory!

File: /Users/alphonso/Documents/Code/PycharmProjects/turboCode/some_file.py

You must create a worktree first using:
  mcp__turbo__start_work_on_issue(
    issue_id='TURBOCODE-X',
    started_by='ai:claude',
    project_path='/Users/alphonso/Documents/Code/PycharmProjects/turboCode'
  )

Then cd into the worktree:
  cd ~/worktrees/turboCode-TURBOCODE-X

📋 Workflow:
  1. Find issue to work on (mcp__turbo__list_issues)
  2. Create worktree (mcp__turbo__start_work_on_issue)
  3. Change to worktree directory (cd ~/worktrees/...)
  4. Make your edits
  5. Commit changes (git add && git commit)
  6. Submit for review (mcp__turbo__submit_issue_for_review)
```

### Layer 2: System Prompt (AI Awareness)

**Location**: `CLAUDE.md` (automatically loaded by Claude Code)

**Function**: Teaches Claude the required workflow before it attempts edits.

**Key Rules**:
- Check `pwd` before making changes
- Never edit outside `~/worktrees/*`
- Always create worktree first
- Follow the 6-step workflow

**Benefits**:
- Claude knows to check directory first
- Prevents hook errors by following workflow
- Self-corrects when reminded

## Required Workflow

### Step-by-Step Process

```python
# 1. Find issue to work on
issues = mcp__turbo__list_issues(status="open", priority="high")

# 2. Create worktree
result = mcp__turbo__start_work_on_issue(
    issue_id="TURBOCODE-123",
    started_by="ai:claude",
    project_path="/"
)
# Creates: ~/worktrees/turboCode-TURBOCODE-123/
# Branch: TURBOCODE-123/issue-title-sanitized

# 3. Change to worktree
cd
~ / worktrees / turboCode - TURBOCODE - 123

# 4. Make changes
# ... edit files safely ...

# 5. Commit changes
git
add.
git
commit - m
"TURBOCODE-123: Implement feature X

- Added
feature
A
- Fixed
bug
B
- Updated
tests
"

# 6. Submit for review (auto-cleanup)
mcp__turbo__submit_issue_for_review(
    issue_id="TURBOCODE-123",
    commit_url="https://github.com/user/repo/commit/abc123def"
)
# Removes worktree automatically
```

## Directory Structure

```
~/worktrees/                           # All worktrees live here
  ├── turboCode-TURBOCODE-1/          # Worktree for issue 1
  │   ├── turbo/                       # Same structure as main repo
  │   ├── tests/
  │   └── ...
  ├── turboCode-TURBOCODE-5/          # Worktree for issue 5
  └── Context-CONTEXTP-22/            # Worktree for Context project

/Users/alphonso/Documents/Code/
  └── PycharmProjects/
      └── turboCode/                   # Main repo (READ-ONLY for Claude)
          ├── turbo/
          ├── tests/
          └── ...
```

## Hook Installation

The hook is already installed at:
```
~/.config/claude-code/hooks/pre-edit.sh
```

To verify installation:
```bash
ls -la ~/.config/claude-code/hooks/
# Should show: -rwxr-xr-x ... pre-edit.sh
```

To test the hook manually:
```bash
~/.config/claude-code/hooks/pre-edit.sh "/Users/alphonso/Documents/Code/PycharmProjects/turboCode/test.py"
# Should output: ❌ ERROR: Cannot edit files in main working directory!

~/.config/claude-code/hooks/pre-edit.sh "/Users/alphonso/worktrees/turboCode-TEST/test.py"
# Should output: ✅ Editing in worktree: turboCode-TEST
```

## Benefits

### For Safety
- ✅ Main working directory stays pristine
- ✅ No accidental commits to main branch
- ✅ Changes are always isolated
- ✅ Easy rollback (just delete worktree)

### For Parallel Work
- ✅ Multiple issues worked on simultaneously
- ✅ Each issue has its own branch
- ✅ No branch switching needed
- ✅ No merge conflicts between concurrent work

### For Tracking
- ✅ Work logs automatically created
- ✅ Time tracking per issue
- ✅ Worktree path stored in database
- ✅ Clear audit trail

### For Automation
- ✅ Claude Code can work autonomously
- ✅ Automatic worktree creation
- ✅ Automatic cleanup after review
- ✅ Prevents mistakes via hook enforcement

## Troubleshooting

### "Cannot edit files in main working directory"

**Cause**: Trying to edit files outside a worktree.

**Solution**: Follow the workflow:
1. Create worktree with `start_work_on_issue`
2. `cd` into the worktree
3. Then make your edits

### "Worktree already exists"

**Cause**: Trying to create worktree that already exists.

**Solution**:
```bash
# List existing worktrees
mcp__turbo__list_worktrees(
    project_path="/Users/alphonso/Documents/Code/PycharmProjects/turboCode"
)

# Either use existing worktree:
cd ~/worktrees/turboCode-TURBOCODE-X

# Or remove old worktree first:
git worktree remove ~/worktrees/turboCode-TURBOCODE-X
```

### "Hook not executing"

**Cause**: Hook not executable or not in correct location.

**Solution**:
```bash
chmod +x ~/.config/claude-code/hooks/pre-edit.sh
```

## Disabling Enforcement (Not Recommended)

If you need to temporarily disable the hook:

```bash
# Rename hook to disable
mv ~/.config/claude-code/hooks/pre-edit.sh ~/.config/claude-code/hooks/pre-edit.sh.disabled

# Re-enable later
mv ~/.config/claude-code/hooks/pre-edit.sh.disabled ~/.config/claude-code/hooks/pre-edit.sh
```

**Warning**: Disabling the hook removes safety guarantees. Only disable for specific administrative tasks, then re-enable immediately.

## Related Documentation

- `GIT_WORKTREE_INTEGRATION.md` - Technical details of worktree system
- `CLAUDE.md` - System prompt with workflow rules
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full implementation overview
- `TESTING_GUIDE_FOR_CLAUDE.md` - Testing procedures

## Future Enhancements

Potential improvements to the enforcement system:

1. **Post-commit hook** - Verify commit messages follow ISSUEKEY-X format
2. **Pre-push hook** - Prevent accidental pushes to main branch
3. **Worktree metadata** - Store additional context in work logs
4. **Multi-project support** - Handle multiple projects with different worktree rules
5. **Visual indicators** - Claude Code UI shows current worktree status

## Conclusion

The combination of technical enforcement (hook) and AI awareness (system prompt) creates a robust safety system that:

- Prevents mistakes before they happen
- Teaches Claude the correct workflow
- Maintains clean separation of work
- Enables safe parallel development
- Supports autonomous AI agents

This system is **production-ready** and **actively enforced**.
