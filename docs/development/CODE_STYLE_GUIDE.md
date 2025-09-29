# Turbo: Code Style Guide

**Version:** 1.0
**Date:** September 28, 2025
**Owner:** Engineering Team

---

## Overview

This guide establishes coding standards for the Turbo project to ensure consistency, maintainability, and readability across the codebase. All code must follow these standards and pass automated quality checks.

## General Principles

### 1. Code Quality Philosophy
- **Clarity over Cleverness**: Write code that is easy to understand
- **Consistency**: Follow established patterns throughout the codebase
- **Simplicity**: Prefer simple solutions over complex ones
- **Testability**: Write code that is easy to test
- **Documentation**: Code should be self-documenting when possible

### 2. Automation First
- Use automated tools for formatting and linting
- Pre-commit hooks enforce standards before commits
- CI/CD pipelines validate code quality
- Manual code reviews focus on logic and architecture

## Python Style Standards

### 1. PEP 8 Compliance
Follow [PEP 8](https://peps.python.org/pep-0008/) with project-specific modifications:

```python
# Line length: 88 characters (Black default)
# Use double quotes for strings
message = "This is a string with double quotes"

# Use single quotes only for string literals that contain double quotes
html_content = 'This contains "quoted" text'

# Function and variable names: snake_case
def calculate_project_health(project_id: str) -> float:
    completion_rate = get_completion_rate(project_id)
    return completion_rate

# Class names: PascalCase
class ProjectRepository:
    def __init__(self) -> None:
        pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT_SECONDS = 30
```

### 2. Import Organization
Imports are automatically sorted by Ruff. Follow this order:

```python
# Standard library imports
import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

# Third-party imports
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import Column, String
from sqlalchemy.orm import Session

# Local application imports
from turbo.core.database import get_db_session
from turbo.core.models import Project
from turbo.core.schemas import ProjectCreate, ProjectResponse
```

### 3. Type Hints
All public functions must have type hints:

```python
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

# Function signatures
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db_session)
) -> ProjectResponse:
    """Create a new project with validation."""
    pass

# Class attributes
class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self._repository = repository
        self._cache: Dict[str, Any] = {}

# Optional and Union types
def get_project_by_id(
    project_id: UUID,
    include_archived: bool = False
) -> Optional[Project]:
    """Retrieve project by ID."""
    pass

# Generic types
def process_items(items: List[Dict[str, Any]]) -> List[str]:
    """Process a list of items and return IDs."""
    return [item["id"] for item in items]
```

### 4. Docstrings
Use Google-style docstrings for all public functions and classes:

```python
def generate_project_spec(
    project_id: UUID,
    spec_type: str = "technical",
    include_context: bool = True
) -> Dict[str, Any]:
    """Generate project specification using AI.

    Creates a comprehensive specification document for the given project
    using Claude integration and project context compilation.

    Args:
        project_id: Unique identifier for the project
        spec_type: Type of specification to generate (technical, user_story, etc.)
        include_context: Whether to include project context in generation

    Returns:
        Dictionary containing the generated specification with metadata

    Raises:
        ProjectNotFoundError: If project doesn't exist
        ClaudeIntegrationError: If AI generation fails
        ValidationError: If spec_type is invalid

    Example:
        >>> spec = generate_project_spec(
        ...     UUID("123e4567-e89b-12d3-a456-426614174000"),
        ...     spec_type="technical"
        ... )
        >>> print(spec["title"])
        "Technical Specification for Project Alpha"
    """
    pass

class ProjectRepository:
    """Repository for project data access and persistence.

    Provides CRUD operations for projects with proper error handling,
    transaction management, and query optimization.

    Attributes:
        session: Database session for operations
        cache_enabled: Whether to use query result caching
    """

    def __init__(self, session: Session, cache_enabled: bool = True) -> None:
        """Initialize repository with database session.

        Args:
            session: SQLAlchemy database session
            cache_enabled: Enable query result caching
        """
        self.session = session
        self.cache_enabled = cache_enabled
```

## Code Organization

### 1. Directory Structure
```
turbo/
├── core/                   # Core business logic
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   └── database/          # Database configuration
├── api/                   # FastAPI routes and endpoints
│   ├── v1/               # API version 1
│   ├── dependencies/     # Dependency injection
│   └── middleware/       # Custom middleware
├── claude/               # Claude integration
│   ├── templates/        # AI prompt templates
│   ├── interface/        # File-based communication
│   └── processors/       # Response processing
├── web/                  # Web interface
│   ├── app/             # Streamlit application
│   ├── components/      # Reusable UI components
│   └── utils/           # Web utilities
├── cli/                 # Command-line interface
│   ├── commands/        # CLI command implementations
│   └── utils/           # CLI utilities
└── utils/               # Shared utilities
    ├── logging.py       # Logging configuration
    ├── config.py        # Configuration management
    └── exceptions.py    # Custom exceptions
```

### 2. Module Structure
Each module should follow this pattern:

```python
"""Module for project management operations.

This module provides comprehensive project management functionality including
CRUD operations, validation, and business logic for project entities.
"""

# Imports (sorted automatically by Ruff)
import asyncio
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy.orm import Session

from turbo.core.models import Project
from turbo.utils.exceptions import ProjectNotFoundError

# Module-level constants
DEFAULT_PAGE_SIZE = 20
MAX_PROJECT_NAME_LENGTH = 100

# Public interface - what other modules can import
__all__ = [
    "ProjectService",
    "create_project",
    "get_project_by_id",
    "ProjectNotFoundError",
]

# Implementation follows...
```

### 3. Class Design Patterns

#### Repository Pattern
```python
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

class BaseRepository(ABC):
    """Abstract base class for all repositories."""

    @abstractmethod
    async def create(self, entity: BaseModel) -> BaseModel:
        """Create a new entity."""
        pass

    @abstractmethod
    async def get_by_id(self, entity_id: UUID) -> Optional[BaseModel]:
        """Retrieve entity by ID."""
        pass

class ProjectRepository(BaseRepository):
    """Concrete implementation for project data access."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def create(self, project_data: ProjectCreate) -> Project:
        """Create a new project."""
        project = Project(**project_data.model_dump())
        self._session.add(project)
        await self._session.commit()
        return project
```

#### Service Layer Pattern
```python
class ProjectService:
    """Service for project business logic."""

    def __init__(
        self,
        repository: ProjectRepository,
        claude_service: ClaudeIntegrationService
    ) -> None:
        self._repository = repository
        self._claude_service = claude_service

    async def create_project_with_spec(
        self,
        project_data: ProjectCreate
    ) -> ProjectWithSpec:
        """Create project and generate initial specification."""
        # Business logic implementation
        project = await self._repository.create(project_data)
        spec = await self._claude_service.generate_spec(project.id)
        return ProjectWithSpec(project=project, spec=spec)
```

## Error Handling

### 1. Custom Exceptions
```python
# turbo/utils/exceptions.py
class TurboBaseException(Exception):
    """Base exception for all Turbo-specific errors."""

    def __init__(self, message: str, error_code: Optional[str] = None) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code

class ProjectNotFoundError(TurboBaseException):
    """Raised when a project cannot be found."""

    def __init__(self, project_id: UUID) -> None:
        super().__init__(
            f"Project with ID {project_id} not found",
            error_code="PROJECT_NOT_FOUND"
        )
        self.project_id = project_id

class ClaudeIntegrationError(TurboBaseException):
    """Raised when Claude integration fails."""

    def __init__(self, operation: str, details: Optional[str] = None) -> None:
        message = f"Claude integration failed for operation: {operation}"
        if details:
            message += f" - {details}"
        super().__init__(message, error_code="CLAUDE_INTEGRATION_ERROR")
```

### 2. Error Handling Patterns
```python
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def get_project_safely(project_id: UUID) -> Optional[Project]:
    """Safely retrieve project with proper error handling."""
    try:
        project = await project_repository.get_by_id(project_id)
        if not project:
            logger.warning(f"Project not found: {project_id}")
            return None
        return project
    except DatabaseConnectionError as e:
        logger.error(f"Database error retrieving project {project_id}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error retrieving project {project_id}: {e}")
        raise TurboBaseException(f"Failed to retrieve project: {e}")

# FastAPI error handling
from fastapi import HTTPException, status

@app.exception_handler(ProjectNotFoundError)
async def project_not_found_handler(request, exc: ProjectNotFoundError):
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": exc.error_code, "message": exc.message}
    )
```

## Database and Models

### 1. SQLAlchemy Models
```python
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from turbo.core.database import Base

class Project(Base):
    """Project model for database persistence."""

    __tablename__ = "projects"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Required fields
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)

    # Optional fields
    priority = Column(String(10), default="medium")
    is_archived = Column(Boolean, default=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    issues = relationship("Issue", back_populates="project", lazy="dynamic")
    documents = relationship("Document", back_populates="project")

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}')>"
```

### 2. Pydantic Schemas
```python
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

class ProjectBase(BaseModel):
    """Base project schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", regex="^(low|medium|high|critical)$")

class ProjectCreate(ProjectBase):
    """Schema for creating new projects."""

    status: str = Field(default="active", regex="^(active|on_hold|completed)$")

    @validator("name")
    def validate_name(cls, v: str) -> str:
        """Validate project name."""
        if not v.strip():
            raise ValueError("Project name cannot be empty or whitespace")
        return v.strip()

class ProjectResponse(ProjectBase):
    """Schema for project API responses."""

    id: UUID
    status: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectWithIssues(ProjectResponse):
    """Project response with related issues."""

    issues: List["IssueResponse"] = []
```

## Testing Standards

### 1. Test Organization
```python
# tests/unit/test_project_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from uuid import uuid4

from turbo.core.services import ProjectService
from turbo.core.schemas import ProjectCreate
from turbo.utils.exceptions import ProjectNotFoundError

class TestProjectService:
    """Test suite for ProjectService."""

    @pytest.fixture
    def mock_repository(self):
        """Mock project repository."""
        return Mock()

    @pytest.fixture
    def mock_claude_service(self):
        """Mock Claude integration service."""
        return Mock()

    @pytest.fixture
    def project_service(self, mock_repository, mock_claude_service):
        """Project service with mocked dependencies."""
        return ProjectService(mock_repository, mock_claude_service)

    async def test_create_project_success(self, project_service, mock_repository):
        """Test successful project creation."""
        # Arrange
        project_data = ProjectCreate(
            name="Test Project",
            description="Test Description"
        )
        expected_project = Project(id=uuid4(), **project_data.model_dump())
        mock_repository.create.return_value = expected_project

        # Act
        result = await project_service.create_project(project_data)

        # Assert
        assert result.name == project_data.name
        assert result.description == project_data.description
        mock_repository.create.assert_called_once_with(project_data)

    async def test_get_project_not_found(self, project_service, mock_repository):
        """Test project not found error handling."""
        # Arrange
        project_id = uuid4()
        mock_repository.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ProjectNotFoundError) as exc_info:
            await project_service.get_project_by_id(project_id)

        assert exc_info.value.project_id == project_id
```

### 2. Test Fixtures
```python
# tests/conftest.py
import asyncio
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from turbo.core.database import Base
from turbo.core.models import Project

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_db():
    """Test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture
def sample_project(test_db):
    """Sample project for testing."""
    project = Project(
        name="Sample Project",
        description="Sample Description",
        status="active"
    )
    test_db.add(project)
    test_db.commit()
    return project
```

## API Standards

### 1. FastAPI Endpoints
```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from turbo.core.schemas import ProjectCreate, ProjectResponse
from turbo.core.services import ProjectService
from turbo.api.dependencies import get_project_service

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
    description="Create a new project with the provided data"
)
async def create_project(
    project_data: ProjectCreate,
    service: ProjectService = Depends(get_project_service)
) -> ProjectResponse:
    """Create a new project."""
    try:
        project = await service.create_project(project_data)
        return ProjectResponse.from_orm(project)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project by ID",
    description="Retrieve a specific project by its unique identifier"
)
async def get_project(
    project_id: UUID,
    service: ProjectService = Depends(get_project_service)
) -> ProjectResponse:
    """Get project by ID."""
    project = await service.get_project_by_id(project_id)
    return ProjectResponse.from_orm(project)
```

## Configuration and Settings

### 1. Settings Management
```python
# turbo/utils/config.py
from pydantic import BaseSettings, Field
from typing import List, Optional

class DatabaseSettings(BaseSettings):
    """Database configuration settings."""

    url: str = Field(default="sqlite:///./turbo.db", env="DATABASE_URL")
    echo: bool = Field(default=False, env="DATABASE_ECHO")
    pool_size: int = Field(default=5, env="DATABASE_POOL_SIZE")

    class Config:
        env_prefix = "DATABASE_"

class APISettings(BaseSettings):
    """API server configuration settings."""

    host: str = Field(default="127.0.0.1", env="API_HOST")
    port: int = Field(default=8000, env="API_PORT")
    workers: int = Field(default=1, env="API_WORKERS")
    reload: bool = Field(default=False, env="API_RELOAD")

    class Config:
        env_prefix = "API_"

class Settings(BaseSettings):
    """Main application settings."""

    environment: str = Field(default="development", env="TURBO_ENV")
    debug: bool = Field(default=False, env="TURBO_DEBUG")
    log_level: str = Field(default="INFO", env="TURBO_LOG_LEVEL")

    # Nested settings
    database: DatabaseSettings = DatabaseSettings()
    api: APISettings = APISettings()

    class Config:
        env_file = ".env"
        env_nested_delimiter = "__"

# Usage
settings = Settings()
```

## Logging Standards

### 1. Logging Configuration
```python
# turbo/utils/logging.py
import logging
import sys
from typing import Optional

def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> None:
    """Set up application logging configuration."""
    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - "
            "%(filename)s:%(lineno)d - %(message)s"
        )

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=format_string,
        handlers=[
            logging.StreamHandler(sys.stdout),
            *([logging.FileHandler(log_file)] if log_file else [])
        ]
    )

# Usage in modules
logger = logging.getLogger(__name__)

def some_function():
    logger.info("Starting function execution")
    try:
        # Function logic
        logger.debug("Debug information")
    except Exception as e:
        logger.error(f"Error in function: {e}", exc_info=True)
        raise
```

## Performance Guidelines

### 1. Database Queries
```python
# Use proper indexes and query optimization
from sqlalchemy import func
from sqlalchemy.orm import selectinload

# Good: Use selectinload for N+1 query prevention
async def get_projects_with_issues():
    return await session.execute(
        select(Project)
        .options(selectinload(Project.issues))
        .where(Project.is_archived.is_(False))
    )

# Good: Use database functions for aggregation
async def get_project_stats():
    return await session.execute(
        select(
            Project.status,
            func.count(Project.id).label("count")
        )
        .group_by(Project.status)
    )
```

### 2. Async Best Practices
```python
import asyncio
from typing import List

# Good: Use async/await properly
async def process_projects_concurrently(project_ids: List[UUID]) -> List[Project]:
    """Process multiple projects concurrently."""
    tasks = [get_project_by_id(pid) for pid in project_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle exceptions in results
    projects = []
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Failed to process project: {result}")
        else:
            projects.append(result)

    return projects
```

## Security Guidelines

### 1. Input Validation
```python
from pydantic import BaseModel, validator
import re

class ProjectCreate(BaseModel):
    """Secure project creation schema."""

    name: str
    description: str

    @validator("name")
    def validate_name(cls, v: str) -> str:
        """Validate project name for security."""
        # Remove any potential script tags or harmful content
        if re.search(r'<script|javascript:|data:', v, re.IGNORECASE):
            raise ValueError("Invalid characters in project name")
        return v.strip()

    @validator("description")
    def validate_description(cls, v: str) -> str:
        """Validate project description."""
        # Basic XSS prevention
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'data:text/html',
            r'vbscript:'
        ]
        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError("Invalid content in description")
        return v
```

---

## Enforcement

### Automated Checks
All code must pass these automated checks before merge:
- Black code formatting
- Ruff linting and import sorting
- MyPy type checking
- Pytest test suite with 85%+ coverage
- Bandit security scanning
- Pre-commit hooks validation

### Code Review Checklist
Manual reviews should verify:
- [ ] Logic correctness and algorithm efficiency
- [ ] Proper error handling and edge cases
- [ ] Security considerations
- [ ] Performance implications
- [ ] Test coverage for new functionality
- [ ] Documentation completeness
- [ ] API design consistency
- [ ] Database query optimization

This style guide ensures that all Turbo code maintains high quality, security, and maintainability standards while enabling efficient development workflows.