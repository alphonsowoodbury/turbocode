# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Turbo Code** is an AI-powered local project management and development platform built with modern Python.

### Technology Stack
- **Framework**: FastAPI (REST API), Next.js (Web UI)
- **Database**: SQLAlchemy 2.0 with async support (PostgreSQL/SQLite)
- **Architecture**: Clean Architecture with Repository/Service pattern
- **Validation**: Pydantic schemas with automatic validation
- **Testing**: pytest with async support
- **MCP Server**: Model Context Protocol for Claude integration

### Project Structure
```
turbo/
├── api/                    # FastAPI REST API
│   ├── v1/endpoints/      # API endpoints (projects, issues, documents, tags, mentors)
│   └── dependencies.py    # Dependency injection
├── core/                  # Core business logic
│   ├── database/          # Database connection & session management
│   ├── models/            # SQLAlchemy models (Project, Issue, Document, Tag, Mentor)
│   ├── repositories/      # Data access layer (CRUD operations)
│   ├── schemas/           # Pydantic schemas (validation)
│   └── services/          # Business logic layer
├── utils/                 # Shared utilities (config, exceptions)
└── mcp_server.py          # MCP server for Claude integration
```

## Architecture Patterns

### Data Flow
```
MCP/API → Services → Repositories → Models → Database
         ↓
    Schemas (validation)
```

### Key Locations
- **Models**: `turbo/core/models/` - SQLAlchemy ORM models with relationships
- **Repositories**: `turbo/core/repositories/base.py:19` - BaseRepository with CRUD
- **Services**: `turbo/core/services/` - Business logic orchestration
- **API Endpoints**: `turbo/api/v1/endpoints/` - FastAPI routes
- **MCP Server**: `turbo/mcp_server.py` - MCP tools for Claude
- **Database**: `turbo/core/database/connection.py:69` - Session management

## MCP Integration (Primary Interface)

### Using MCP Tools

**ALWAYS use MCP tools** (prefixed with `mcp__turbo__`) for all database operations. These tools provide automatic validation, error handling, and consistent interfaces.

### Common MCP Operations

#### Projects
```python
# List projects
mcp__turbo__list_projects(status="active", limit=10)

# Get project details
mcp__turbo__get_project(project_id="uuid")

# Update project
mcp__turbo__update_project(
    project_id="uuid",
    name="New Name",
    completion_percentage=75.0
)

# Get project issues
mcp__turbo__get_project_issues(project_id="uuid")
```

#### Issues
```python
# Create issue
mcp__turbo__create_issue(
    title="Issue Title",
    description="Description",
    type="feature",
    priority="high",
    project_id="uuid"
)

# List issues with filters
mcp__turbo__list_issues(
    project_id="uuid",
    status="open",
    priority="high"
)

# Update issue
mcp__turbo__update_issue(
    issue_id="uuid",
    status="in_progress",
    priority="critical"
)

# Get issue details
mcp__turbo__get_issue(issue_id="uuid")
```

#### Mentors
```python
# Get mentor
mcp__turbo__get_mentor(mentor_id="uuid")

# Get conversation history
mcp__turbo__get_mentor_messages(mentor_id="uuid", limit=50)

# Add message to conversation
mcp__turbo__add_mentor_message(
    mentor_id="uuid",
    content="Response content"
)
```

#### Tags & Organization
```python
# Create tag
mcp__turbo__create_tag(
    name="frontend",
    color="#3b82f6",
    description="Frontend tasks"
)

# Add tag to entity
mcp__turbo__add_tag_to_entity(
    entity_type="issue",
    entity_id="uuid",
    tag_id="tag-uuid"
)
```

#### Comments
```python
# Add comment (works on any entity)
mcp__turbo__add_comment(
    entity_type="issue",
    entity_id="uuid",
    content="Comment text",
    author_type="ai",
    author_name="Claude"
)

# Get entity comments
mcp__turbo__get_entity_comments(
    entity_type="issue",
    entity_id="uuid"
)
```

#### Dependencies & Relationships
```python
# Add blocker (issue A blocks issue B)
mcp__turbo__add_blocker(
    blocking_issue_id="uuid-a",
    blocked_issue_id="uuid-b"
)

# Get related entities via knowledge graph
mcp__turbo__get_related_entities(
    entity_type="issue",
    entity_id="uuid",
    limit=10
)

# Semantic search
mcp__turbo__search_knowledge_graph(
    query="authentication bug",
    entity_types=["issue", "document"],
    min_relevance=0.7
)
```

### MCP Best Practices

1. **Always use MCP tools first** - Don't use API or direct database access unless MCP doesn't support the operation
2. **Let MCP handle validation** - All MCP tools validate inputs automatically
3. **Use semantic search** - `search_knowledge_graph` is powerful for finding related content
4. **Partial updates** - Only specify fields you want to change
5. **Check responses** - MCP tools return detailed error messages

## Database Operations

### Connection & Sessions
- **Session Factory**: `turbo/core/database/connection.py:56`
- **Async Session**: Uses `AsyncSession` with automatic commit/rollback
- **Context Manager**: `DatabaseConnection` class for manual transaction control
- **Connection Pooling**: Configured for PostgreSQL, StaticPool for SQLite

### Transaction Handling
```python
# Automatic via get_db_session (used by MCP/API)
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

## API Usage Guide

### Starting the API Server
```bash
# Docker (recommended)
docker-compose up -d

# Development with auto-reload
uvicorn turbo.main:app --reload

# Production
uvicorn turbo.main:app --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`

### Key API Endpoints

#### Projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/` - List projects (supports ?status=, ?priority=, ?limit=, ?offset=)
- `GET /api/v1/projects/{id}` - Get project
- `PUT /api/v1/projects/{id}` - Update project (partial updates)
- `DELETE /api/v1/projects/{id}` - Delete project

#### Issues
- `POST /api/v1/issues/` - Create issue
- `GET /api/v1/issues/` - List issues
- `GET /api/v1/issues/{id}` - Get issue
- `PUT /api/v1/issues/{id}` - Update issue
- `DELETE /api/v1/issues/{id}` - Delete issue

#### Mentors
- `GET /api/v1/mentors/` - List mentors
- `GET /api/v1/mentors/{id}` - Get mentor
- `POST /api/v1/mentors/{id}/messages` - Send message
- `GET /api/v1/mentors/{id}/messages` - Get conversation
- `DELETE /api/v1/mentors/{id}/conversation` - Clear conversation

### API Implementation
- **Endpoints**: `turbo/api/v1/endpoints/` - All REST endpoints
- **Dependencies**: `turbo/api/dependencies.py` - Dependency injection
- **Validation**: Automatic via Pydantic request/response models
- **Session**: Injected via `Depends(get_db_session)`

## Configuration

### Docker Deployment
```bash
# Start complete stack (API + DB + Frontend + Webhook Server)
docker-compose up -d

# View logs
docker-compose logs -f turbo-api
docker-compose logs -f turbo-frontend

# Stop
docker-compose down

# Rebuild after changes
docker-compose build api
docker-compose up -d
```

### Environment Configuration
- **Database URL**: Set in `docker-compose.yml` or `.env`
- **API Port**: 8000 (configurable)
- **Frontend Port**: 3010 (configurable)
- **MCP Server**: Runs within Claude Code environment

## Development Commands

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=turbo --cov-report=html

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
```

### Code Quality
```bash
# Format code
black .
ruff --fix .

# Check linting
ruff check .
mypy .
```

## Common Patterns for Claude

### When Asked to Update Database:

**ALWAYS use MCP tools first:**
```python
# Update issue status
mcp__turbo__update_issue(
    issue_id="uuid",
    status="closed"
)

# Update project completion
mcp__turbo__update_project(
    project_id="uuid",
    completion_percentage=100.0
)
```

### Getting Entity Information:

```python
# List to find UUIDs
projects = mcp__turbo__list_projects(status="active")

# Get detailed information
project = mcp__turbo__get_project(project_id="uuid")
issues = mcp__turbo__get_project_issues(project_id="uuid")

# Search for entities
results = mcp__turbo__search_knowledge_graph(
    query="authentication",
    entity_types=["issue", "document"]
)
```

### Best Practices:

- **Use MCP tools exclusively** - They handle all validation and error handling
- **Partial updates only** - Only specify fields that need to change
- **Leverage semantic search** - Use knowledge graph for finding related content
- **Check entity relationships** - Use get_related_entities for discovering connections
- **Add context via comments** - Use add_comment to document changes
- **Transaction safety** - All MCP tools auto-rollback on error

## Entity Field Patterns

### Project
- Required: `name`, `description`
- Optional: `priority` (low|medium|high|critical), `status` (active|on_hold|completed|archived), `completion_percentage` (0-100), `workspace` (personal|freelance|work)

### Issue
- Required: `title`, `description`, `project_id`, `type`, `priority`
- Optional: `status` (open|in_progress|review|testing|closed), `assignee` (email), `due_date`

### Mentor
- Required: `name`, `description`, `persona`, `workspace`
- Optional: `work_company`, `context_preferences`, `is_active`

### Document
- Required: `title`, `content`, `project_id`
- Optional: `doc_type`, `version`, `format`

### Tag
- Required: `name`, `color`
- Optional: `description`

## Webhook System

The platform includes a webhook server (`scripts/claude_webhook_server.py`) that handles asynchronous AI responses for mentor conversations. The webhook server:

- Listens for incoming mentor messages
- Builds context from projects, issues, and documents
- Calls Claude API with mentor persona
- Posts responses back via MCP tools
- Supports WebSearch for current information

This enables real-time AI mentor conversations without blocking the main application.
