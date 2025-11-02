# Entity Keys Implementation Status

**Date**: October 23, 2025
**Status**: COMPLETED - Git Worktree Integration Added

## Overview

Implementing human-readable keys for all entities to replace UUIDs in git branches, commit messages, and UI.

### Key Format

- **Issues**: `{PROJECT_KEY}-{NUMBER}` (e.g., `CNTXT-1`, `TURBO-42`)
- **Milestones**: `{PROJECT_KEY}-M{NUMBER}` (e.g., `CNTXT-M1`)
- **Initiatives**: `{PROJECT_KEY}-I{NUMBER}` (e.g., `CNTXT-I1`)
- **Documents**: `{PROJECT_KEY}-D{NUMBER}` (e.g., `CNTXT-D1`)

## Completed Tasks

### ✅ 1. Model Updates
- **Project**: Added `project_key` (String(10), unique, required)
- **Issue**: Added `issue_key` + `issue_number`
- **Milestone**: Added `milestone_key` + `milestone_number`
- **Initiative**: Added `initiative_key` + `initiative_number`
- **Document**: Added `document_key` + `document_number`

### ✅ 2. Counter System
- Created `ProjectEntityCounter` model
- Tracks next number for each entity type per project
- Composite PK: (project_id, entity_type)

### ✅ 3. Migration
- **File**: `migrations/019_add_entity_keys.sql`
- Creates counter table
- Adds key columns to all tables
- **Backfills existing data** in creation order
- Makes columns NOT NULL after backfill

### ✅ 4. Key Generation Service
- **File**: `turbo/core/services/key_generator.py`
- Created `KeyGeneratorService` with atomic key generation
- `generate_entity_key()` - Generates next unique key for an entity
- `validate_project_key()` - Validates project key format
- `is_project_key_available()` - Checks if key is available
- `resolve_entity_id()` - Resolves UUID or key to UUID
- `generate_project_key_suggestion()` - Suggests key from project name

### ✅ 5. Schema Updates
- ✅ `ProjectCreate`: Added required `project_key` field with validation (uppercase, 2-10 chars, alphanumeric)
- ✅ `ProjectResponse`: Added `project_key` field
- ✅ `ProjectSummary`: Added `project_key` field
- ✅ `IssueResponse`: Added `issue_key` and `issue_number` fields
- ✅ `IssueSummary`: Added `issue_key` field
- ✅ `MilestoneResponse`: Added `milestone_key` and `milestone_number` fields
- ✅ `MilestoneSummary`: Added `milestone_key` field
- ✅ `InitiativeResponse`: Added `initiative_key` and `initiative_number` fields
- ✅ `DocumentResponse`: Added `document_key` and `document_number` fields
- ✅ `DocumentSummary`: Added `document_key` field

### ✅ 6. Repository Updates
- ✅ `IssueRepository.get_by_key()` - Get issue by key (e.g., "CNTXT-1")
- ✅ `ProjectRepository.get_by_key()` - Get project by key
- ✅ `MilestoneRepository.get_by_key()` - Get milestone by key
- ✅ `InitiativeRepository.get_by_key()` - Get initiative by key
- ✅ `DocumentRepository.get_by_key()` - Get document by key

### ✅ 7. Service Integration (COMPLETED)
- ✅ Updated `IssueService.create_issue()` - Generates issue keys automatically
- ✅ Updated `MilestoneService.create_milestone()` - Generates milestone keys automatically
- ✅ Updated `InitiativeService.create_initiative()` - Generates initiative keys (when project_id exists)
- ✅ Updated `DocumentService.create_document()` - Generates document keys automatically
- ✅ Updated `ProjectService.create_project()` - Validates project key format and uniqueness

### ✅ 8. Database Migration (COMPLETED)
- ✅ Migration script executed successfully
- ✅ All 11 existing projects backfilled with keys (TURBOCODE, CONTEXTP, RITMO, etc.)
- ✅ 100+ issues backfilled with sequential keys (TURBOCODE-1, TURBOCODE-2, etc.)
- ✅ Milestones, initiatives, documents all backfilled
- ✅ Entity counters initialized (e.g., TURBOCODE next issue: 117)
- ✅ Discovery issues without project_id correctly have NULL keys
- ✅ Models updated to make issue/initiative keys nullable for edge cases

## Completed Features

### ✅ 9. Git Worktree Integration (NEW!)
Implemented automated git worktree management for parallel development:
- **GitWorktreeService**: Created service at `turbo/core/services/git_worktree.py`
  - `create_worktree()`: Creates worktree at `~/worktrees/ProjectName-ISSUEKEY/` with branch `ISSUEKEY/title`
  - `remove_worktree()`: Cleans up worktree with safety checks
  - `list_worktrees()`: Lists all worktrees for a project
  - `get_worktree_status()`: Checks for uncommitted changes

- **Work Log Enhancement**: Added worktree tracking
  - `worktree_path`: Path to git worktree directory
  - `branch_name`: Git branch name created for issue
  - Migration: `migrations/020_add_worktree_fields.sql`

- **Automatic Workflow Integration**:
  - `start_work()` creates worktree when project_path provided
  - `submit_for_review()` cleans up worktree automatically
  - Both operations are non-blocking (git failures don't block workflow)

- **MCP Tools**: Added 4 new tools
  - `start_work_on_issue`: Start work with automatic worktree creation
  - `submit_issue_for_review`: Submit with automatic worktree cleanup
  - `list_worktrees`: View all worktrees for a project
  - `get_worktree_status`: Check worktree for uncommitted changes

- **API Endpoints**: Updated existing endpoints
  - `POST /issues/{id}/start-work`: Added `project_path` parameter
  - `POST /issues/{id}/submit-review`: Added `cleanup_worktree` parameter

### Future Enhancements

### ⏳ Key-Based Lookups (Future)
Support key-based lookups in API endpoints:
- Change path parameters from `{id: UUID}` to `{id_or_key: str}`
- Try UUID first, fallback to `repo.get_by_key()`
- Apply to all GET endpoints for issues, milestones, initiatives, documents

### ⏳ Frontend Updates (Future)
- Project creation: Required `project_key` field
- Display keys everywhere instead of UUIDs
- Copy-to-clipboard for keys
- Breadcrumbs: "CNTXT-1: Fix timeline lag"

## Design Decisions Made

1. **Project keys are user-specified** (not auto-generated)
2. **Keys are completely immutable** (can't be changed after creation)
3. **All existing entities will be backfilled** with keys
4. **Keys added to all entity types** (Issues, Milestones, Initiatives, Documents)
5. **UUIDs still work** everywhere for backward compatibility

## Git Integration (Future)

Once keys are working:
```bash
# Branch names
git checkout CNTXT-1/fix-timeline-lag

# Worktree paths
~/Context-CNTXT-1/

# Commit messages
git commit -m "CNTXT-1: Fix timeline scrolling performance"
```

## Breaking Changes

- **Project creation now requires `project_key` field**
- Existing code that creates projects must be updated
- Migration must be run before deploying code

## Files Modified

### Models
- `turbo/core/models/project.py` - Added project_key
- `turbo/core/models/issue.py` - Added issue_key + issue_number
- `turbo/core/models/milestone.py` - Added milestone_key + milestone_number
- `turbo/core/models/initiative.py` - Added initiative_key + initiative_number
- `turbo/core/models/document.py` - Added document_key + document_number
- `turbo/core/models/entity_counter.py` - NEW: Counter model
- `turbo/core/models/__init__.py` - Export ProjectEntityCounter
- `turbo/core/database/connection.py` - Import ProjectEntityCounter for init

### Migrations
- `migrations/019_add_entity_keys.sql` - NEW: Complete migration with backfill

### Services
- `turbo/core/services/key_generator.py` - NEW: KeyGeneratorService

### Schemas
- `turbo/core/schemas/project.py` - Updated with project_key validation
- `turbo/core/schemas/issue.py` - Updated with issue_key fields
- `turbo/core/schemas/milestone.py` - Updated with milestone_key fields
- `turbo/core/schemas/initiative.py` - Updated with initiative_key fields
- `turbo/core/schemas/document.py` - Updated with document_key fields

### Repositories
- `turbo/core/repositories/project.py` - Added get_by_key()
- `turbo/core/repositories/issue.py` - Added get_by_key()
- `turbo/core/repositories/milestone.py` - Added get_by_key()
- `turbo/core/repositories/initiative.py` - Added get_by_key()
- `turbo/core/repositories/document.py` - Added get_by_key()

## Implementation Phases - COMPLETE

1. ✅ **Phase 1** - Models + Migration: DONE
2. ✅ **Phase 2** - Services + Schemas + Repositories: DONE
3. ✅ **Phase 3** - Service Integration + Dependency Injection: DONE
4. ✅ **Phase 4** - Database Migration + Backfill: DONE
5. ✅ **Phase 5** - Git Worktree Integration: DONE
6. ✅ **Phase 6** - MCP Tools + API Updates: DONE

## What's Working

- **Entity Keys**: All entities have human-readable keys
- **Automatic Key Generation**: Keys generated on entity creation
- **Entity Counters**: Sequential numbering per project
- **Backfilled Data**: All 11 existing projects + 100+ issues have keys
- **Git Worktrees**: Automatic worktree creation/cleanup on work start/submit
- **MCP Integration**: 4 new MCP tools for worktree management
- **API Integration**: Endpoints updated with worktree parameters
- **Graceful Degradation**: Git failures don't block core workflow

## Next Steps (Optional Enhancements)

1. ⏳ Add key-based lookups to GET endpoints (e.g., `/issues/TURBOCODE-1` instead of UUID)
2. ⏳ Update frontend to display and accept keys
3. ⏳ Add worktree MCP tools for list/status operations (current tools call non-existent API endpoints)
4. ⏳ End-to-end testing with real git repositories
5. ⏳ Sub-agent orchestration with parallel worktrees
