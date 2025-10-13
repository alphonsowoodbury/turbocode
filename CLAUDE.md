# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Turbo Code** is an AI-powered local project management and development platform built with modern Python.

### Technology Stack
- **Framework**: FastAPI (REST API), Streamlit (Web UI), Typer/Click (CLI)
- **Database**: SQLAlchemy 2.0 with async support (PostgreSQL/SQLite)
- **Architecture**: Clean Architecture with Repository/Service pattern
- **Validation**: Pydantic schemas with automatic validation
- **Testing**: pytest with async support

### Project Structure
```
turbo/
├── api/                    # FastAPI REST API
│   ├── v1/endpoints/      # API endpoints (projects, issues, documents, tags)
│   └── dependencies.py    # Dependency injection
├── cli/                   # CLI interface
│   ├── commands/          # Command groups (projects, issues, etc.)
│   └── utils.py           # CLI utilities
├── core/                  # Core business logic
│   ├── database/          # Database connection & session management
│   ├── models/            # SQLAlchemy models (Project, Issue, Document, Tag)
│   ├── repositories/      # Data access layer (CRUD operations)
│   ├── schemas/           # Pydantic schemas (validation)
│   └── services/          # Business logic layer
└── utils/                 # Shared utilities (config, exceptions)
```

## Architecture Patterns

### Data Flow
```
CLI/API → Services → Repositories → Models → Database
         ↓
    Schemas (validation)
```

### Key Locations
- **Models**: `turbo/core/models/` - SQLAlchemy ORM models with relationships
- **Repositories**: `turbo/core/repositories/base.py:19` - BaseRepository with CRUD
- **Services**: `turbo/core/services/` - Business logic orchestration
- **API Endpoints**: `turbo/api/v1/endpoints/` - FastAPI routes
- **CLI Commands**: `turbo/cli/commands/` - Typer/Click commands
- **Database**: `turbo/core/database/connection.py:69` - Session management

## Database Operations

### Connection & Sessions
- **Session Factory**: `turbo/core/database/connection.py:56`
- **Async Session**: Uses `AsyncSession` with automatic commit/rollback
- **Context Manager**: `DatabaseConnection` class for manual transaction control
- **Connection Pooling**: Configured for PostgreSQL, StaticPool for SQLite

### Transaction Handling
```python
# Automatic via get_db_session (used by CLI/API)
async for session in get_db_session():
    service = create_project_service(session)
    await service.update_project(id, data)  # Auto-commit on success
```

### Update Pattern
All updates use **partial updates** via `model_dump(exclude_unset=True)`:
- Only send/update changed fields
- Automatic timestamp updates (`updated_at`)
- Validation before database operations
- Rollback on any error

## CLI Usage Guide

### Getting Project IDs
```bash
# List all projects
turbo projects list

# Get specific project (for UUIDs, get from list command)
turbo projects get <project-id>

# Search by name
turbo projects search "Turbo Code"
```

### Common CLI Workflows

#### Creating Resources
```bash
# Create project
turbo projects create --name "Project Name" --description "Description" --priority high

# Create issue (requires project-id)
turbo issues create \
  --title "Issue Title" \
  --description "Description" \
  --project-id <uuid> \
  --type [bug|feature|enhancement|task] \
  --priority [low|medium|high|critical] \
  --status open

# Create tag
turbo tags create --name "frontend" --color blue --description "Frontend tasks"
```

#### Updating Resources
```bash
# Update project (partial updates - only specify what changes)
turbo projects update <project-id> --name "New Name"
turbo projects update <project-id> --completion 75
turbo projects update <project-id> --status completed

# Update issue
turbo issues update <issue-id> --status in_progress --priority high
turbo issues assign <issue-id> developer@example.com
turbo issues close <issue-id> --resolution "Fixed the bug"
turbo issues reopen <issue-id>

# Update tags
turbo tags update <tag-id> --name "new-name" --color red
```

#### Querying & Filtering
```bash
# List with filters
turbo issues list --project-id <uuid>
turbo issues list --status open
turbo issues list --priority high
turbo issues list --assignee developer@example.com

# List with pagination
turbo projects list --limit 10 --offset 20

# Output formats
turbo projects list --format table   # Default, Rich formatted
turbo projects list --format json    # JSON output
turbo projects list --format csv     # CSV output
```

#### Statistics & Status
```bash
# Project statistics
turbo projects stats <project-id>

# Issue statistics for project
turbo issues stats <project-id>

# Workspace overview
turbo status

# Project search
turbo projects search "keyword"
turbo search "global keyword"  # Search across all entities
```

#### Archive & Delete
```bash
# Archive project (soft delete)
turbo projects archive <project-id>

# Delete (hard delete - use with caution)
turbo issues delete <issue-id> --confirm
turbo projects delete <project-id> --confirm
```

### CLI Implementation Details
- **Location**: `turbo/cli/commands/`
- **Pattern**: Each command uses `async for session in get_db_session()`
- **Services**: Created via utility functions in `turbo/cli/utils.py`
- **Validation**: Automatic via Pydantic schemas before DB operations
- **Error Handling**: `@handle_exceptions` decorator with Rich console output

## API Usage Guide

### Starting the API Server
```bash
# Development with auto-reload
uvicorn turbo.main:app --reload

# Production
uvicorn turbo.main:app --host 0.0.0.0 --port 8000

# Docker
docker-compose up -d
```

API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`

### API Endpoints

#### Projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/` - List projects (supports ?status=, ?priority=, ?limit=, ?offset=)
- `GET /api/v1/projects/{id}` - Get project
- `PUT /api/v1/projects/{id}` - Update project (partial updates)
- `DELETE /api/v1/projects/{id}` - Delete project
- `POST /api/v1/projects/{id}/archive` - Archive project
- `GET /api/v1/projects/{id}/stats` - Project statistics
- `GET /api/v1/projects/{id}/issues` - Get project issues
- `POST /api/v1/projects/{id}/tags/{tag_id}` - Add tag to project

#### Issues
- `POST /api/v1/issues/` - Create issue
- `GET /api/v1/issues/` - List issues
- `GET /api/v1/issues/{id}` - Get issue
- `PUT /api/v1/issues/{id}` - Update issue
- `DELETE /api/v1/issues/{id}` - Delete issue

#### Documents & Tags
- Similar REST patterns for `/api/v1/documents/` and `/api/v1/tags/`

### API Request Examples
```bash
# Create project
curl -X POST "http://localhost:8000/api/v1/projects/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Description",
    "priority": "high"
  }'

# Update project (partial)
curl -X PUT "http://localhost:8000/api/v1/projects/{id}" \
  -H "Content-Type: application/json" \
  -d '{"completion_percentage": 75.0}'

# Get with filters
curl "http://localhost:8000/api/v1/projects/?status=active&limit=10"
```

### API Implementation
- **Endpoints**: `turbo/api/v1/endpoints/projects.py:74` (update example)
- **Dependencies**: `turbo/api/dependencies.py` - Dependency injection
- **Validation**: Automatic via Pydantic request/response models
- **Session**: Injected via `Depends(get_db_session)`

## Configuration

### Database Setup
```bash
# Interactive configuration
turbo config database

# Direct configuration
turbo config database --type sqlite     # Local development
turbo config database --type postgres   # Production (requires Docker)

# Show current config
turbo config show

# Config file locations
turbo config path
```

### Configuration Files
- **User config**: `~/.turbo/database.env`
- **Project config**: `.turbo/config.toml`
- **Environment**: Set `DATABASE_URL` directly

### Docker Deployment
```bash
# Start complete stack (API + DB + Web UI)
docker-compose up -d

# View logs
docker-compose logs -f turbo-api

# Stop
docker-compose down
```

## Development Commands

### Installation
```bash
# Install in development mode
pip install -e .

# Install with dev dependencies
pip install -e ".[dev]"
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=turbo --cov-report=html

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
pytest -m "not slow"
```

### Code Quality
```bash
# Format code
black .
ruff --fix .

# Check linting
ruff check .
mypy .

# Clean emoji from docs
python scripts/cleanup_emoji.py
```

## Common Patterns for Claude

### When Asked to Update Database:
1. **CLI Method** (for single/manual updates):
   ```bash
   turbo issues update <id> --status closed
   ```

2. **API Method** (for programmatic updates):
   ```python
   # Use the service layer directly
   from turbo.core.services import IssueService
   await issue_service.update_issue(id, IssueUpdate(status="closed"))
   ```

3. **Direct Python** (for complex operations):
   ```python
   async with DatabaseConnection() as session:
       repo = IssueRepository(session)
       issue = await repo.update(id, update_data)
       await session.commit()
   ```

### Getting UUIDs for Commands:
```bash
# Always list first to get UUIDs
turbo projects list
turbo issues list --project-id <project-uuid>

# Or use Python to query
python -c "
import asyncio
from turbo.core.database.connection import get_db_session
from turbo.core.repositories import ProjectRepository

async def get():
    async for session in get_db_session():
        repo = ProjectRepository(session)
        projects = await repo.search_by_name('Turbo Code')
        for p in projects:
            print(f'{p.id}')
asyncio.run(get())
"
```

### Best Practices:
- **Always validate first**: CLI/API do automatic Pydantic validation
- **Use partial updates**: Only send changed fields
- **Check before delete**: Use `--confirm` flag or verify via API
- **Transaction safety**: All methods auto-rollback on error
- **Type hints**: All code uses full type hints for IDE support

## Quick Reference

### Entity Field Patterns

**Project**:
- Required: name, description
- Optional: priority (low|medium|high|critical), status (active|on_hold|completed|archived), completion_percentage (0-100), is_archived

**Issue**:
- Required: title, description, project_id
- Optional: type (bug|feature|enhancement|task), status (open|in_progress|review|testing|closed), priority (low|medium|high|critical), assignee (email)

**Document**:
- Required: title, content, project_id
- Optional: doc_type, version

**Tag**:
- Required: name
- Optional: color, description