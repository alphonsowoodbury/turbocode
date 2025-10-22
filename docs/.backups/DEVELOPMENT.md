# Development Guide

This guide covers setting up a development environment, understanding the codebase architecture, and contributing to Turbo Code.

## Quick Development Setup

### Prerequisites

- Python 3.10 or higher
- Docker and Docker Compose (for PostgreSQL)
- Git
- Your favorite IDE/editor

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd turboCode

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install development dependencies
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install

# Configure database
turbo config database --type sqlite  # For local development

# Initialize database
python -c "import asyncio; from turbo.core.database.connection import init_database; asyncio.run(init_database())"

# Verify installation
turbo status
pytest --version
```

## Project Architecture

### Clean Architecture

Turbo Code follows clean architecture principles with clear separation of concerns:

```
turbo/
├── api/                 # FastAPI REST API (Interface Layer)
│   ├── v1/
│   │   └── endpoints/   # API endpoints
│   ├── dependencies.py  # Dependency injection
│   └── middleware.py    # API middleware
├── cli/                 # Command Line Interface (Interface Layer)
│   ├── commands/        # CLI command groups
│   ├── main.py          # CLI entry point
│   └── utils.py         # CLI utilities
├── core/                # Core Business Logic (Domain Layer)
│   ├── database/        # Database configuration
│   ├── models/          # SQLAlchemy models (Entities)
│   ├── repositories/    # Data access (Repository Pattern)
│   ├── schemas/         # Pydantic schemas (DTOs)
│   └── services/        # Business logic (Use Cases)
├── utils/               # Shared Infrastructure
│   ├── config.py        # Configuration management
│   └── exceptions.py    # Custom exceptions
└── web/                 # Web Interface (Future)
```

### Key Design Patterns

1. **Repository Pattern**: Data access abstraction (`core/repositories/`)
2. **Service Layer**: Business logic separation (`core/services/`)
3. **Dependency Injection**: FastAPI and CLI dependencies
4. **Schema Validation**: Pydantic for data validation
5. **Async/Await**: Modern Python async patterns

## Development Workflow

### Test-Driven Development (TDD)

Turbo Code was built using TDD. Follow this cycle:

1. **Write Tests First**: Create failing tests for new functionality
2. **Implement Code**: Write minimal code to make tests pass
3. **Refactor**: Improve code while keeping tests green

```bash
# Run tests during development
pytest                              # All tests
pytest tests/unit/                  # Unit tests only
pytest tests/integration/           # Integration tests only
pytest tests/unit/core/test_models.py  # Specific test file

# Run tests with coverage
pytest --cov=turbo --cov-report=html

# Run tests in watch mode (requires pytest-watch)
pip install pytest-watch
ptw
```

### Code Quality

```bash
# Format code
black .

# Check and fix linting issues
ruff check .
ruff check --fix .

# Type checking
mypy .

# Run all quality checks
black . && ruff check --fix . && mypy . && pytest
```

### Pre-commit Hooks

Pre-commit hooks automatically run quality checks:

```bash
# Install hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files

# Skip hooks (emergency only)
git commit --no-verify -m "Emergency commit"
```

## Database Development

### Database Models

SQLAlchemy models are in `turbo/core/models/`:

```python
# Example model
from turbo.core.database.base import BaseModel
from sqlalchemy import Column, String, Enum

class Project(BaseModel):
    __tablename__ = "projects"

    name = Column(String(255), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ACTIVE)
    # ... additional fields
```

### Schema Development

Pydantic schemas in `turbo/core/schemas/`:

```python
# Example schema
from pydantic import BaseModel, Field
from typing import Optional

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    # ... additional fields

class ProjectResponse(ProjectCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Database Migrations

For schema changes, create migration scripts:

```python
# scripts/migrate_add_column.py
import asyncio
from turbo.core.database.connection import get_db_session

async def migrate():
    async with get_db_session() as session:
        await session.execute(text("ALTER TABLE projects ADD COLUMN new_field VARCHAR(255)"))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(migrate())
```

## API Development

### Adding New Endpoints

1. **Create Schema** (`core/schemas/`):
   ```python
   class NewEntityCreate(BaseModel):
       name: str

   class NewEntityResponse(NewEntityCreate):
       id: UUID
       created_at: datetime
   ```

2. **Create Model** (`core/models/`):
   ```python
   class NewEntity(BaseModel):
       __tablename__ = "new_entities"
       name = Column(String(255), nullable=False)
   ```

3. **Create Repository** (`core/repositories/`):
   ```python
   class NewEntityRepository(BaseRepository[NewEntity]):
       pass
   ```

4. **Create Service** (`core/services/`):
   ```python
   class NewEntityService:
       def __init__(self, repository: NewEntityRepository):
           self.repository = repository

       async def create(self, data: NewEntityCreate) -> NewEntity:
           # Business logic here
           pass
   ```

5. **Create Endpoints** (`api/v1/endpoints/`):
   ```python
   @router.post("/", response_model=NewEntityResponse)
   async def create_entity(
       data: NewEntityCreate,
       service: NewEntityService = Depends(get_new_entity_service)
   ):
       entity = await service.create(data)
       return NewEntityResponse.model_validate(entity)
   ```

6. **Add Tests** (`tests/integration/api/`):
   ```python
   async def test_create_entity_success(test_client: AsyncClient):
       response = await test_client.post(
           "/api/v1/new-entities/",
           json={"name": "Test Entity"}
       )
       assert response.status_code == 201
   ```

### API Testing

```bash
# Start API server
uvicorn turbo.main:app --reload

# Test with curl
curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'

# Use API documentation
open http://localhost:8000/docs
```

## CLI Development

### Adding New Commands

1. **Create Command Group** (`cli/commands/new_entity.py`):
   ```python
   import click
   from turbo.cli.utils import handle_exceptions

   @click.group()
   def new_entity_group():
       """Manage new entities."""
       pass

   @new_entity_group.command()
   @click.option("--name", required=True, help="Entity name")
   @handle_exceptions
   def create(name):
       """Create a new entity."""
       # Implementation here
       pass
   ```

2. **Register Command** (`cli/main.py`):
   ```python
   from turbo.cli.commands.new_entity import new_entity_group

   cli.add_command(new_entity_group, name="new-entities")
   ```

3. **Add Tests** (`tests/unit/cli/test_new_entity.py`):
   ```python
   def test_create_entity_success(runner, mock_service):
       result = runner.invoke(new_entity_group, ["create", "--name", "Test"])
       assert result.exit_code == 0
   ```

### CLI Testing

```bash
# Test CLI commands
turbo --help
turbo projects --help
turbo projects create --name "Test Project"

# Debug CLI issues
turbo --verbose projects list
```

## Testing

### Test Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── unit/                    # Unit tests (fast, isolated)
│   ├── core/
│   │   ├── test_models.py   # Model tests
│   │   ├── test_schemas.py  # Schema validation tests
│   │   ├── test_repositories.py  # Repository tests
│   │   └── test_services.py # Service logic tests
│   └── cli/                 # CLI command tests
└── integration/             # Integration tests (slower, with database)
    └── api/                 # API endpoint tests
```

### Writing Tests

#### Unit Tests

```python
import pytest
from turbo.core.models import Project
from turbo.core.schemas import ProjectCreate

@pytest.mark.asyncio
async def test_create_project_with_required_fields(test_session):
    # Arrange
    project_data = {"name": "Test Project"}

    # Act
    project = Project(**project_data)
    test_session.add(project)
    await test_session.commit()

    # Assert
    assert project.name == "Test Project"
    assert project.id is not None
```

#### Integration Tests

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_project_success(test_client: AsyncClient):
    # Arrange
    project_data = {"name": "API Project", "description": "Test project"}

    # Act
    response = await test_client.post("/api/v1/projects/", json=project_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "API Project"
```

### Test Fixtures

Common fixtures in `conftest.py`:

```python
@pytest.fixture
async def test_session():
    """Database session for testing."""
    # Database setup/teardown
    yield session

@pytest.fixture
async def test_client():
    """HTTP client for API testing."""
    # API client setup
    yield client

@pytest.fixture
def runner():
    """CLI test runner."""
    return CliRunner()
```

### Running Specific Tests

```bash
# Run specific test file
pytest tests/unit/core/test_models.py

# Run specific test method
pytest tests/unit/core/test_models.py::TestProject::test_create_project

# Run tests matching pattern
pytest -k "project"

# Run tests with specific markers
pytest -m "not slow"
pytest -m integration
```

## Configuration Management

### Environment-based Configuration

Configuration is managed through nested Pydantic settings:

```python
# turbo/utils/config.py
class DatabaseSettings(BaseSettings):
    url: str = "sqlite+aiosqlite:///./turbo.db"
    echo: bool = False

    model_config = {"env_prefix": "DATABASE_"}

class Settings(BaseSettings):
    environment: str = "development"
    database: DatabaseSettings = DatabaseSettings()
```

### Configuration Sources

1. **Environment Variables**: `DATABASE_URL`, `TURBO_ENVIRONMENT`
2. **Configuration Files**: `.env`, `.turbo/config.toml`
3. **CLI Configuration**: `turbo config database`
4. **Default Values**: Defined in schema classes

### Adding New Configuration

```python
# 1. Add to appropriate settings class
class NewSettings(BaseSettings):
    new_option: str = "default_value"
    model_config = {"env_prefix": "NEW_"}

# 2. Include in main settings
class Settings(BaseSettings):
    new: NewSettings = NewSettings()

# 3. Use in code
from turbo.utils.config import get_settings
settings = get_settings()
value = settings.new.new_option
```

## Error Handling

### Custom Exceptions

```python
# turbo/utils/exceptions.py
class TurboCodeException(Exception):
    """Base exception for Turbo Code."""
    pass

class ProjectNotFoundError(TurboCodeException):
    """Project not found error."""
    pass
```

### Error Handling in Services

```python
# Service layer
async def get_project(self, project_id: UUID) -> Project:
    project = await self.repository.get_by_id(project_id)
    if not project:
        raise ProjectNotFoundError(f"Project {project_id} not found")
    return project
```

### Error Handling in API

```python
# API layer
@router.get("/{project_id}")
async def get_project(project_id: UUID, service: ProjectService = Depends()):
    try:
        project = await service.get_project(project_id)
        return ProjectResponse.model_validate(project)
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
```

## Debugging

### Debug Configuration

```bash
# Enable debug mode
export TURBO_DEBUG=true
export TURBO_LOG_LEVEL=DEBUG

# Debug specific components
export DATABASE_ECHO=true  # SQL query logging
```

### Debugging Tools

```python
# Add breakpoints
import pdb; pdb.set_trace()

# Or use ipdb for better experience
import ipdb; ipdb.set_trace()

# Rich debugging
from rich import print
print({"debug_data": some_variable})
```

### Database Debugging

```python
# Enable SQL logging
# In config: database.echo = True

# Raw database access
from turbo.core.database.connection import get_db_session

async with get_db_session() as session:
    result = await session.execute(text("SELECT * FROM projects"))
    print(result.fetchall())
```

## Performance

### Database Performance

```python
# Use select loading for relationships
from sqlalchemy.orm import selectinload

query = select(Project).options(selectinload(Project.issues))
result = await session.execute(query)
projects = result.scalars().all()

# Use pagination for large datasets
def paginate_query(query, limit: int = 50, offset: int = 0):
    return query.limit(limit).offset(offset)
```

### API Performance

```python
# Use async/await consistently
async def get_projects(service: ProjectService = Depends()):
    projects = await service.list_projects()  # Don't forget await!
    return projects

# Cache frequently accessed data
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_settings():
    return get_settings()
```

### CLI Performance

```bash
# Use pagination for large outputs
turbo projects list --limit 20 --offset 0

# Use JSON format for programmatic access
turbo projects list --format json | jq '.[] | .name'
```

## Contributing Guidelines

### Code Style

1. **Follow PEP 8**: Use Black for formatting
2. **Type Hints**: All functions must have type hints
3. **Docstrings**: Public APIs need docstrings
4. **Async Consistency**: Use async/await consistently
5. **Error Handling**: Handle errors gracefully

### Commit Messages

```bash
# Good commit messages
feat: add project archive functionality
fix: resolve database connection timeout
docs: update API documentation
test: add integration tests for issues API
refactor: extract common repository methods
```

### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Write Tests**: Add comprehensive tests
3. **Implement Feature**: Follow TDD approach
4. **Run Quality Checks**: `black . && ruff check --fix . && mypy . && pytest`
5. **Update Documentation**: Update relevant docs
6. **Create Pull Request**: Include clear description and tests

### Code Review Checklist

- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

## Common Development Tasks

### Adding a New Entity

1. Create model in `core/models/`
2. Create schemas in `core/schemas/`
3. Create repository in `core/repositories/`
4. Create service in `core/services/`
5. Add API endpoints in `api/v1/endpoints/`
6. Add CLI commands in `cli/commands/`
7. Write comprehensive tests
8. Update documentation

### Database Schema Changes

1. Create migration script
2. Update model classes
3. Update schemas
4. Update tests
5. Test migration thoroughly

### Performance Optimization

1. Identify bottlenecks with profiling
2. Optimize database queries
3. Add appropriate indexes
4. Consider caching strategies
5. Measure improvement

For more information, see:
- [README](../README.md) - Project overview
- [CLI Reference](CLI_REFERENCE.md) - Complete CLI documentation
- [Docker Deployment](DOCKER_DEPLOYMENT.md) - Docker setup and deployment