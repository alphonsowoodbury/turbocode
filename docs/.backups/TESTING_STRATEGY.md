# Turbo: Testing Strategy and Quality Assurance

**Version:** 1.0
**Date:** September 28, 2025
**Owner:** Engineering Team

---

## Testing Overview

Turbo's testing strategy ensures reliability, performance, and quality through comprehensive automated testing, with special attention to AI integration, database operations, and user workflows. The strategy emphasizes early testing, continuous integration, and quality gates.

## Testing Philosophy

### Core Principles
1. **Test-Driven Development**: Write tests before implementation
2. **Comprehensive Coverage**: 90%+ code coverage for critical components
3. **Fast Feedback**: Tests complete in under 2 minutes
4. **Reliable Tests**: No flaky tests in CI/CD pipeline
5. **Real-World Scenarios**: Tests reflect actual usage patterns
6. **AI Integration Testing**: Special focus on Claude integration reliability

### Quality Goals
- **Unit Test Coverage**: ≥90% for core business logic
- **Integration Test Coverage**: ≥80% for API endpoints
- **E2E Test Coverage**: 100% of critical user workflows
- **Performance**: 95th percentile response times under SLA
- **Reliability**: 99.9% test pass rate in CI/CD

---

## Testing Pyramid

```
           ┌─────────────────────┐
           │    E2E Tests        │ ← 10% (UI workflows, user journeys)
           │   (Playwright)      │
           └─────────────────────┘
         ┌─────────────────────────┐
         │  Integration Tests      │ ← 20% (API, database, Claude)
         │   (FastAPI TestClient)  │
         └─────────────────────────┘
       ┌───────────────────────────────┐
       │      Unit Tests               │ ← 70% (business logic, utilities)
       │     (pytest)                  │
       └───────────────────────────────┘
```

## Unit Testing Strategy

### 1. Test Structure and Organization

#### Directory Structure
```
tests/
├── unit/
│   ├── core/
│   │   ├── models/
│   │   │   ├── test_project.py
│   │   │   ├── test_issue.py
│   │   │   └── test_document.py
│   │   ├── services/
│   │   │   ├── test_project_service.py
│   │   │   ├── test_issue_service.py
│   │   │   └── test_document_service.py
│   │   └── repositories/
│   │       ├── test_base_repository.py
│   │       └── test_project_repository.py
│   ├── claude/
│   │   ├── test_context_compiler.py
│   │   ├── test_template_engine.py
│   │   └── test_response_parser.py
│   └── api/
│       ├── test_projects_router.py
│       ├── test_issues_router.py
│       └── test_documents_router.py
├── integration/
├── e2e/
├── performance/
└── fixtures/
    ├── conftest.py
    ├── database_fixtures.py
    └── claude_fixtures.py
```

#### Test Configuration
```python
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --strict-config
    --verbose
    --cov=turbo
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=90
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow running tests
    claude: Tests requiring Claude integration
    database: Tests requiring database
```

### 2. Core Component Testing

#### Model Testing
```python
# tests/unit/core/models/test_project.py
import pytest
from datetime import datetime, timedelta
from turbo.core.models import Project, ProjectStatus, Priority

class TestProject:
    def test_project_creation_with_required_fields(self):
        """Test project creation with minimum required fields"""
        project = Project(
            name="Test Project",
            description="A test project"
        )
        assert project.name == "Test Project"
        assert project.description == "A test project"
        assert project.status == ProjectStatus.PLANNING
        assert project.priority == Priority.MEDIUM

    def test_project_completion_percentage_calculation(self):
        """Test automatic completion percentage calculation"""
        project = Project(name="Test")
        project.total_issues = 10
        project.completed_issues = 3

        assert project.completion_percentage == 30.0

    def test_project_status_transitions(self):
        """Test valid project status transitions"""
        project = Project(name="Test", status=ProjectStatus.PLANNING)

        # Valid transitions
        project.status = ProjectStatus.ACTIVE
        assert project.status == ProjectStatus.ACTIVE

        project.status = ProjectStatus.COMPLETED
        assert project.status == ProjectStatus.COMPLETED

    def test_project_validation_errors(self):
        """Test project validation rules"""
        with pytest.raises(ValidationError):
            Project(name="")  # Empty name should fail

        with pytest.raises(ValidationError):
            Project(
                name="Valid Name",
                target_completion=datetime.now() - timedelta(days=1)
            )  # Past date should fail

@pytest.fixture
def sample_project():
    """Fixture for creating sample project data"""
    return Project(
        name="Sample Project",
        description="A sample project for testing",
        priority=Priority.HIGH,
        target_completion=datetime.now() + timedelta(days=30)
    )
```

#### Service Testing
```python
# tests/unit/core/services/test_project_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from turbo.core.services import ProjectService
from turbo.core.models import Project, ProjectStatus

class TestProjectService:
    @pytest.fixture
    def mock_repository(self):
        """Mock repository for testing"""
        repo = Mock()
        repo.create = AsyncMock()
        repo.get_by_id = AsyncMock()
        repo.update = AsyncMock()
        repo.delete = AsyncMock()
        repo.list = AsyncMock()
        return repo

    @pytest.fixture
    def project_service(self, mock_repository):
        """Project service with mocked dependencies"""
        return ProjectService(repository=mock_repository)

    async def test_create_project_success(self, project_service, mock_repository):
        """Test successful project creation"""
        project_data = {
            "name": "New Project",
            "description": "Test project"
        }

        expected_project = Project(**project_data)
        mock_repository.create.return_value = expected_project

        result = await project_service.create_project(project_data)

        assert result.name == "New Project"
        mock_repository.create.assert_called_once()

    async def test_create_project_duplicate_name(self, project_service, mock_repository):
        """Test project creation with duplicate name"""
        mock_repository.create.side_effect = ValueError("Project name must be unique")

        with pytest.raises(ValueError, match="Project name must be unique"):
            await project_service.create_project({"name": "Duplicate"})

    async def test_update_project_status(self, project_service, mock_repository):
        """Test project status update"""
        project_id = "test-id"
        existing_project = Project(name="Test", status=ProjectStatus.PLANNING)
        updated_project = Project(name="Test", status=ProjectStatus.ACTIVE)

        mock_repository.get_by_id.return_value = existing_project
        mock_repository.update.return_value = updated_project

        result = await project_service.update_project_status(
            project_id,
            ProjectStatus.ACTIVE
        )

        assert result.status == ProjectStatus.ACTIVE
        mock_repository.update.assert_called_once()
```

## Integration Testing Strategy

### 1. API Integration Tests

#### FastAPI Test Client Setup
```python
# tests/integration/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from turbo.core.database import Base, get_db
from turbo.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine"""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_db_session(test_engine):
    """Create test database session"""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def test_client(test_db_session):
    """Create test client with test database"""
    def override_get_db():
        try:
            yield test_db_session
        finally:
            test_db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
```

#### API Endpoint Testing
```python
# tests/integration/api/test_projects_api.py
import pytest
from fastapi import status

class TestProjectsAPI:
    async def test_create_project_success(self, test_client):
        """Test successful project creation via API"""
        project_data = {
            "name": "API Test Project",
            "description": "Created via API test",
            "priority": "high"
        }

        response = test_client.post("/api/v1/projects", json=project_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["data"]["name"] == "API Test Project"
        assert data["data"]["priority"] == "high"
        assert "id" in data["data"]

    async def test_get_project_success(self, test_client, sample_project_id):
        """Test retrieving project via API"""
        response = test_client.get(f"/api/v1/projects/{sample_project_id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["data"]["id"] == sample_project_id

    async def test_get_project_not_found(self, test_client):
        """Test retrieving non-existent project"""
        response = test_client.get("/api/v1/projects/non-existent-id")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_list_projects_with_pagination(self, test_client):
        """Test project listing with pagination"""
        # Create multiple projects for pagination test
        for i in range(25):
            test_client.post("/api/v1/projects", json={
                "name": f"Project {i}",
                "description": f"Description {i}"
            })

        response = test_client.get("/api/v1/projects?page=1&page_size=10")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["data"]) == 10
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["page_size"] == 10
        assert data["pagination"]["total_count"] >= 25

    async def test_search_projects(self, test_client):
        """Test project search functionality"""
        # Create searchable projects
        test_client.post("/api/v1/projects", json={
            "name": "Searchable Project",
            "description": "Contains keyword: artificial intelligence"
        })

        response = test_client.get("/api/v1/projects?search=artificial intelligence")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["data"]) >= 1
        assert "artificial intelligence" in data["data"][0]["description"]
```

### 2. Database Integration Tests

#### Repository Testing
```python
# tests/integration/database/test_project_repository.py
import pytest
from turbo.core.repositories import ProjectRepository
from turbo.core.models import Project, ProjectStatus

class TestProjectRepository:
    @pytest.fixture
    def project_repository(self, test_db_session):
        """Create project repository with test database"""
        return ProjectRepository(session=test_db_session)

    async def test_create_and_retrieve_project(self, project_repository):
        """Test creating and retrieving a project"""
        project_data = Project(
            name="Repository Test Project",
            description="Testing repository operations"
        )

        # Create project
        created_project = await project_repository.create(project_data)
        assert created_project.id is not None

        # Retrieve project
        retrieved_project = await project_repository.get_by_id(created_project.id)
        assert retrieved_project.name == "Repository Test Project"
        assert retrieved_project.description == "Testing repository operations"

    async def test_update_project(self, project_repository):
        """Test updating project data"""
        # Create initial project
        project = await project_repository.create(Project(
            name="Update Test",
            status=ProjectStatus.PLANNING
        ))

        # Update project
        project.status = ProjectStatus.ACTIVE
        updated_project = await project_repository.update(project)

        assert updated_project.status == ProjectStatus.ACTIVE

    async def test_delete_project(self, project_repository):
        """Test deleting a project"""
        project = await project_repository.create(Project(name="Delete Test"))
        project_id = project.id

        await project_repository.delete(project_id)

        deleted_project = await project_repository.get_by_id(project_id)
        assert deleted_project is None

    async def test_list_projects_with_filters(self, project_repository):
        """Test listing projects with various filters"""
        # Create test projects
        await project_repository.create(Project(
            name="Active Project",
            status=ProjectStatus.ACTIVE
        ))
        await project_repository.create(Project(
            name="Planning Project",
            status=ProjectStatus.PLANNING
        ))

        # Filter by status
        active_projects = await project_repository.list(
            filters={"status": ProjectStatus.ACTIVE}
        )
        assert len(active_projects) >= 1
        assert all(p.status == ProjectStatus.ACTIVE for p in active_projects)
```

### 3. Claude Integration Testing

#### Mock Claude Integration
```python
# tests/integration/claude/test_claude_integration.py
import pytest
from unittest.mock import AsyncMock, patch
from turbo.claude import ClaudeIntegration, ContextCompiler

class TestClaudeIntegration:
    @pytest.fixture
    def mock_claude_responses(self):
        """Mock Claude responses for testing"""
        return {
            "technical_spec": """
            # Technical Specification

            ## Overview
            This is a generated technical specification.

            ## Requirements
            1. Feature A
            2. Feature B

            ## Implementation
            Detailed implementation plan.
            """,
            "marketing_copy": """
            # Product Landing Page

            ## Headline
            Revolutionary AI-Powered Development Platform

            ## Description
            Transform your development workflow with Turbo.
            """
        }

    @pytest.fixture
    def claude_integration(self, mock_claude_responses):
        """Claude integration with mocked responses"""
        integration = ClaudeIntegration()
        integration._generate_content = AsyncMock()
        integration._generate_content.side_effect = lambda prompt_type: mock_claude_responses.get(prompt_type, "Default response")
        return integration

    async def test_generate_technical_spec(self, claude_integration, sample_project):
        """Test technical specification generation"""
        spec_request = {
            "project_context": sample_project,
            "component_name": "User Authentication",
            "spec_type": "technical_spec"
        }

        result = await claude_integration.generate_technical_spec(spec_request)

        assert "Technical Specification" in result
        assert "Requirements" in result
        assert "Implementation" in result

    async def test_generate_marketing_content(self, claude_integration, sample_project):
        """Test marketing content generation"""
        content_request = {
            "project_context": sample_project,
            "content_type": "landing_page",
            "audience": "developers"
        }

        result = await claude_integration.generate_marketing_content(content_request)

        assert "Revolutionary AI-Powered" in result
        assert "Transform your development" in result

    async def test_context_compilation(self, sample_project):
        """Test project context compilation for Claude"""
        compiler = ContextCompiler()

        context = await compiler.compile_project_context(sample_project.id)

        assert context.project.name == sample_project.name
        assert len(context.recent_issues) >= 0
        assert context.compiled_at is not None

class TestClaudeFileIntegration:
    """Test file-based Claude communication"""

    @pytest.fixture
    def temp_claude_directory(self, tmp_path):
        """Create temporary Claude directory structure"""
        claude_dir = tmp_path / ".turbo"
        (claude_dir / "context").mkdir(parents=True)
        (claude_dir / "templates").mkdir(parents=True)
        (claude_dir / "responses").mkdir(parents=True)
        return claude_dir

    async def test_write_context_file(self, temp_claude_directory, sample_project):
        """Test writing context file for Claude"""
        from turbo.claude.file_interface import write_project_context

        context_file = await write_project_context(
            sample_project,
            temp_claude_directory / "context" / "project_context.md"
        )

        assert context_file.exists()
        content = context_file.read_text()
        assert sample_project.name in content
        assert "Project Overview" in content

    async def test_parse_claude_response(self, temp_claude_directory):
        """Test parsing Claude response file"""
        from turbo.claude.response_parser import parse_technical_spec

        # Create mock response file
        response_file = temp_claude_directory / "responses" / "generated_spec.md"
        response_file.write_text("""
        # Generated Technical Specification

        ## Overview
        This is a test specification.

        ## Requirements
        - Requirement 1
        - Requirement 2
        """)

        parsed_spec = await parse_technical_spec(response_file)

        assert parsed_spec.title == "Generated Technical Specification"
        assert len(parsed_spec.requirements) == 2
        assert "Requirement 1" in parsed_spec.requirements
```

## End-to-End Testing Strategy

### 1. User Workflow Testing

#### Playwright E2E Tests
```python
# tests/e2e/test_project_workflow.py
import pytest
from playwright.async_api import Page, expect

class TestProjectWorkflow:
    async def test_complete_project_creation_workflow(self, page: Page):
        """Test complete project creation and management workflow"""
        # Navigate to Turbo application
        await page.goto("http://localhost:8501")

        # Create new project
        await page.click("text=New Project")
        await page.fill("[data-testid=project-name]", "E2E Test Project")
        await page.fill("[data-testid=project-description]", "Created during E2E testing")
        await page.select_option("[data-testid=project-priority]", "high")
        await page.click("[data-testid=create-project-button]")

        # Verify project creation
        await expect(page.locator("text=E2E Test Project")).to_be_visible()

        # Add first issue
        await page.click("text=Add Issue")
        await page.fill("[data-testid=issue-title]", "Implement user authentication")
        await page.fill("[data-testid=issue-description]", "Add JWT-based authentication system")
        await page.select_option("[data-testid=issue-type]", "feature")
        await page.click("[data-testid=create-issue-button]")

        # Verify issue creation
        await expect(page.locator("text=Implement user authentication")).to_be_visible()

        # Generate specification with AI
        await page.click("text=Generate Spec")
        await page.fill("[data-testid=spec-prompt]", "Create technical specification for JWT authentication")
        await page.click("[data-testid=generate-spec-button]")

        # Verify spec generation (may take time)
        await expect(page.locator("text=Technical Specification")).to_be_visible(timeout=30000)

    async def test_issue_lifecycle_workflow(self, page: Page):
        """Test complete issue lifecycle from creation to completion"""
        await page.goto("http://localhost:8501")

        # Navigate to existing project
        await page.click("text=E2E Test Project")

        # Create issue
        await page.click("text=Add Issue")
        await page.fill("[data-testid=issue-title]", "Bug fix: Login validation")
        await page.select_option("[data-testid=issue-type]", "bug")
        await page.select_option("[data-testid=issue-priority]", "high")
        await page.click("[data-testid=create-issue-button]")

        # Move issue through workflow states
        await page.click("text=Bug fix: Login validation")

        # Start work on issue
        await page.click("[data-testid=start-work-button]")
        await expect(page.locator("text=In Progress")).to_be_visible()

        # Add work log
        await page.click("[data-testid=add-comment-button]")
        await page.fill("[data-testid=comment-text]", "Started investigating the validation logic")
        await page.click("[data-testid=save-comment-button]")

        # Complete issue
        await page.click("[data-testid=complete-issue-button]")
        await expect(page.locator("text=Done")).to_be_visible()

    async def test_content_generation_workflow(self, page: Page):
        """Test AI content generation workflow"""
        await page.goto("http://localhost:8501")
        await page.click("text=E2E Test Project")

        # Generate marketing content
        await page.click("text=Generate Content")
        await page.select_option("[data-testid=content-type]", "landing_page_copy")
        await page.fill("[data-testid=content-prompt]", "Create compelling landing page copy for our app")
        await page.click("[data-testid=generate-content-button]")

        # Verify content generation
        await expect(page.locator("[data-testid=generated-content]")).to_be_visible(timeout=30000)

        # Save generated content
        await page.click("[data-testid=save-content-button]")
        await expect(page.locator("text=Content saved successfully")).to_be_visible()
```

### 2. Performance Testing

#### Load Testing with Locust
```python
# tests/performance/locustfile.py
from locust import HttpUser, task, between

class TurboUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Setup for each user"""
        self.project_id = None
        self.create_test_project()

    def create_test_project(self):
        """Create a test project for each user"""
        response = self.client.post("/api/v1/projects", json={
            "name": f"Load Test Project {self.user_id}",
            "description": "Created during load testing"
        })
        if response.status_code == 201:
            self.project_id = response.json()["data"]["id"]

    @task(3)
    def list_projects(self):
        """Test project listing performance"""
        self.client.get("/api/v1/projects")

    @task(2)
    def get_project(self):
        """Test individual project retrieval"""
        if self.project_id:
            self.client.get(f"/api/v1/projects/{self.project_id}")

    @task(1)
    def create_issue(self):
        """Test issue creation performance"""
        if self.project_id:
            self.client.post(f"/api/v1/projects/{self.project_id}/issues", json={
                "title": f"Load test issue {self.user_id}",
                "description": "Created during load testing",
                "issue_type": "task"
            })

    @task(1)
    def search_projects(self):
        """Test search performance"""
        self.client.get("/api/v1/projects?search=load test")
```

#### Database Performance Testing
```python
# tests/performance/test_database_performance.py
import pytest
import time
import asyncio
from turbo.core.repositories import ProjectRepository
from turbo.core.models import Project

class TestDatabasePerformance:
    @pytest.mark.slow
    async def test_bulk_project_creation_performance(self, test_db_session):
        """Test performance of bulk project creation"""
        repository = ProjectRepository(session=test_db_session)

        start_time = time.time()

        # Create 1000 projects
        projects = []
        for i in range(1000):
            projects.append(Project(
                name=f"Performance Test Project {i}",
                description=f"Description {i}"
            ))

        # Bulk create
        created_projects = await repository.bulk_create(projects)

        end_time = time.time()
        duration = end_time - start_time

        assert len(created_projects) == 1000
        assert duration < 5.0  # Should complete in under 5 seconds
        print(f"Created 1000 projects in {duration:.2f} seconds")

    @pytest.mark.slow
    async def test_search_performance_with_large_dataset(self, test_db_session):
        """Test search performance with large dataset"""
        repository = ProjectRepository(session=test_db_session)

        # Create dataset if not exists
        existing_count = await repository.count()
        if existing_count < 10000:
            # Create test data
            projects = [
                Project(name=f"Search Test {i}", description=f"Searchable content {i}")
                for i in range(10000 - existing_count)
            ]
            await repository.bulk_create(projects)

        # Test search performance
        start_time = time.time()
        results = await repository.search("Search Test")
        end_time = time.time()

        assert len(results) > 0
        assert (end_time - start_time) < 1.0  # Search should complete in under 1 second
```

## Test Data Management

### 1. Test Fixtures and Factories

#### Pytest Fixtures
```python
# tests/fixtures/conftest.py
import pytest
from datetime import datetime, timedelta
from turbo.core.models import Project, Issue, Document, ProjectStatus, IssueStatus

@pytest.fixture
def sample_project():
    """Create a sample project for testing"""
    return Project(
        name="Sample Project",
        description="A project created for testing purposes",
        status=ProjectStatus.ACTIVE,
        priority=Priority.HIGH,
        created_at=datetime.now(),
        target_completion=datetime.now() + timedelta(days=30)
    )

@pytest.fixture
def sample_issues(sample_project):
    """Create sample issues for testing"""
    return [
        Issue(
            project_id=sample_project.id,
            title="Implement user authentication",
            description="Add JWT-based authentication system",
            issue_type=IssueType.FEATURE,
            status=IssueStatus.IN_PROGRESS,
            priority=Priority.HIGH
        ),
        Issue(
            project_id=sample_project.id,
            title="Fix login bug",
            description="Users cannot login with special characters in password",
            issue_type=IssueType.BUG,
            status=IssueStatus.TODO,
            priority=Priority.CRITICAL
        )
    ]

@pytest.fixture
def sample_documents(sample_project):
    """Create sample documents for testing"""
    return [
        Document(
            project_id=sample_project.id,
            title="Technical Specification",
            content="# Authentication System\n\nDetailed technical specification...",
            document_type=DocumentType.TECHNICAL_SPEC,
            status=DocumentStatus.APPROVED
        ),
        Document(
            project_id=sample_project.id,
            title="User Guide",
            content="# User Guide\n\nHow to use the authentication system...",
            document_type=DocumentType.USER_GUIDE,
            status=DocumentStatus.DRAFT
        )
    ]
```

#### Factory Pattern for Test Data
```python
# tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from turbo.core.models import Project, Issue, Document

class ProjectFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Project
        sqlalchemy_session_persistence = "commit"

    name = factory.Sequence(lambda n: f"Project {n}")
    description = factory.Faker("text", max_nb_chars=200)
    status = factory.Faker("random_element", elements=[status.value for status in ProjectStatus])
    priority = factory.Faker("random_element", elements=[priority.value for priority in Priority])

class IssueFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Issue
        sqlalchemy_session_persistence = "commit"

    project = factory.SubFactory(ProjectFactory)
    title = factory.Faker("sentence", nb_words=4)
    description = factory.Faker("text", max_nb_chars=500)
    issue_type = factory.Faker("random_element", elements=[type_.value for type_ in IssueType])
    status = factory.Faker("random_element", elements=[status.value for status in IssueStatus])
    priority = factory.Faker("random_element", elements=[priority.value for priority in Priority])

class DocumentFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Document
        sqlalchemy_session_persistence = "commit"

    project = factory.SubFactory(ProjectFactory)
    title = factory.Faker("sentence", nb_words=3)
    content = factory.Faker("text", max_nb_chars=2000)
    document_type = factory.Faker("random_element", elements=[type_.value for type_ in DocumentType])
    status = factory.Faker("random_element", elements=[status.value for status in DocumentStatus])
```

## Continuous Integration Strategy

### 1. GitHub Actions Workflow

#### Main CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.10, 3.11, 3.12]

    steps:
    - uses: actions/checkout@v4

    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -e ".[dev]"

    - name: Run linting
      run: |
        black --check .
        ruff check .
        mypy turbo/

    - name: Run unit tests
      run: |
        pytest tests/unit/ -v --cov=turbo --cov-report=xml

    - name: Run integration tests
      run: |
        pytest tests/integration/ -v

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: unittests
        name: codecov-umbrella

  e2e-tests:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: 3.11

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -e ".[dev]"
        playwright install

    - name: Start Turbo application
      run: |
        turbo start --test-mode &
        sleep 10  # Wait for application to start

    - name: Run E2E tests
      run: |
        pytest tests/e2e/ -v

    - name: Upload E2E test artifacts
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: e2e-test-results
        path: tests/e2e/screenshots/

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Run performance tests
      run: |
        pip install -e ".[dev]"
        pytest tests/performance/ -v --benchmark-json=benchmark.json

    - name: Store benchmark result
      uses: benchmark-action/github-action-benchmark@v1
      with:
        tool: 'pytest'
        output-file-path: benchmark.json
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Quality Gates

#### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]

  - repo: local
    hooks:
      - id: pytest-unit
        name: pytest-unit
        entry: pytest tests/unit/
        language: python
        always_run: true
        pass_filenames: false
```

#### Branch Protection Rules
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require review from code owners
- Dismiss stale PR approvals when new commits are pushed

## Test Coverage and Reporting

### 1. Coverage Requirements

#### Coverage Targets
- **Overall Coverage**: ≥90%
- **Core Business Logic**: ≥95%
- **API Endpoints**: ≥90%
- **Claude Integration**: ≥85%
- **Database Layer**: ≥90%

#### Coverage Configuration
```ini
# .coveragerc
[run]
source = turbo
omit =
    */tests/*
    */venv/*
    */migrations/*
    setup.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:

[html]
directory = htmlcov
```

### 2. Test Reporting

#### Test Report Generation
```python
# Generate comprehensive test report
pytest \
  --html=reports/test-report.html \
  --cov=turbo \
  --cov-report=html:reports/coverage \
  --cov-report=term \
  --junit-xml=reports/junit.xml \
  --benchmark-json=reports/benchmark.json
```

#### Quality Metrics Dashboard
- Test pass/fail rates
- Code coverage trends
- Performance benchmarks
- Bug discovery rates
- Technical debt metrics

---

This comprehensive testing strategy ensures Turbo maintains high quality, reliability, and performance throughout development and deployment. The multi-layered approach provides confidence in the system's behavior while enabling rapid iteration and continuous improvement.