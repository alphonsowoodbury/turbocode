# Turbo Code
`AI-Powered Project Management Platform`

[![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-green.svg)](https://fastapi.tiangolo.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-red.svg)](https://sqlalchemy.org)
[![Tests](https://img.shields.io/badge/tests-352-brightgreen.svg)](tests/)

Turbo Code is a modern, AI-powered local project management and development platform that helps you organize projects, track issues, manage documents, and collaborate efficiently.

## Features

### Core Functionality
- **Project Management**: Create, organize, and track projects with completion percentages
- **Issue Tracking**: Full-featured issue management with assignments, priorities, and workflows
- **Document Management**: Store, organize, and version control documentation
- **Tag System**: Categorize and organize items with colored tags
- **Search & Filtering**: Powerful search across all entities with advanced filtering

### User Interfaces
- **CLI Interface**: Beautiful command-line interface with Rich formatting
- **REST API**: Complete FastAPI-based REST API for programmatic access
- **Web Interface**: Streamlit-based web UI for visual interaction (coming soon)

### Architecture
- **Clean Architecture**: Layered design with clear separation of concerns
- **Async/Await**: Modern Python async patterns throughout
- **Type Safety**: Full type hints and Pydantic validation
- **Database Agnostic**: SQLAlchemy 2.0 with support for SQLite and PostgreSQL
- **Test-Driven Development**: Comprehensive test coverage with pytest

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd turboCode

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .
```

### Initialize Workspace

```bash
# Initialize a new Turbo Code workspace
turbo init

# Check workspace status
turbo status
```

### Basic Usage

```bash
# Create a project
turbo projects create --name "My Project" --description "A sample project"

# List projects
turbo projects list

# Create an issue
turbo issues create --title "Add feature" --description "Implement new feature" --project-id <project-id>

# Create tags for organization
turbo tags create --name "frontend" --color blue --description "Frontend tasks"

# Get help for any command
turbo --help
turbo projects --help
```

## Documentation

### CLI Commands

#### Projects
```bash
turbo projects create     # Create new project
turbo projects list       # List all projects
turbo projects get <id>   # Get project details
turbo projects update     # Update project
turbo projects delete     # Delete project
turbo projects archive    # Archive project
turbo projects search     # Search projects
turbo projects stats      # Project statistics
```

#### Issues
```bash
turbo issues create       # Create new issue
turbo issues list         # List all issues
turbo issues get <id>     # Get issue details
turbo issues update       # Update issue
turbo issues assign       # Assign issue
turbo issues close        # Close issue
turbo issues reopen       # Reopen issue
turbo issues delete       # Delete issue
turbo issues search       # Search issues
turbo issues stats        # Issue statistics
```

#### Documents
```bash
turbo documents create    # Create new document
turbo documents list      # List all documents
turbo documents get <id>  # Get document details
turbo documents update    # Update document
turbo documents delete    # Delete document
turbo documents search    # Search documents
turbo documents export    # Export document
turbo documents template  # Create from template
turbo documents edit      # Edit in external editor
```

#### Tags
```bash
turbo tags create         # Create new tag
turbo tags list           # List all tags
turbo tags get <id>       # Get tag details
turbo tags update         # Update tag
turbo tags delete         # Delete tag
turbo tags search         # Search tags
turbo tags usage          # Tag usage statistics
turbo tags colors         # Show available colors
turbo tags related        # Show related items
```

#### Global Commands
```bash
turbo init               # Initialize workspace
turbo status             # Show workspace status
turbo config             # Manage configuration
turbo search <query>     # Global search
turbo export             # Export workspace data
turbo import             # Import workspace data
turbo completion         # Shell completion setup
```

### Output Formats

Most list commands support multiple output formats:

```bash
# Table format (default)
turbo projects list

# JSON format
turbo projects list --format json

# CSV format
turbo projects list --format csv
```

### Filtering and Pagination

```bash
# Filter by status
turbo projects list --status active

# Filter by priority
turbo issues list --priority high

# Pagination
turbo projects list --limit 10 --offset 20
```

## API Usage

Start the API server:

```bash
# Development server
uvicorn turbo.api.main:app --reload

# Production server
uvicorn turbo.api.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with automatic documentation at `http://localhost:8000/docs`.

### Example API Calls

```bash
# Create a project
curl -X POST "http://localhost:8000/api/v1/projects/" \
  -H "Content-Type: application/json" \
  -d '{"name": "API Project", "description": "Created via API"}'

# Get all projects
curl "http://localhost:8000/api/v1/projects/"

# Get project by ID
curl "http://localhost:8000/api/v1/projects/{project_id}"
```

## Development

### Setup Development Environment

```bash
# Install development dependencies
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install

# Run tests
pytest

# Run tests with coverage
pytest --cov=turbo --cov-report=html

# Run linting
ruff check .
mypy .

# Format code
black .
ruff --fix .
```

### Project Structure

```
turbo/
├── api/                 # FastAPI REST API
│   ├── v1/             # API version 1
│   │   └── endpoints/  # API endpoints
│   └── dependencies.py # Dependency injection
├── cli/                # Command Line Interface
│   ├── commands/       # CLI command groups
│   └── utils.py        # CLI utilities
├── core/               # Core business logic
│   ├── database/       # Database configuration
│   ├── models/         # SQLAlchemy models
│   ├── repositories/   # Data access layer
│   ├── schemas/        # Pydantic schemas
│   └── services/       # Business logic
├── utils/              # Shared utilities
│   ├── config.py       # Configuration management
│   └── exceptions.py   # Custom exceptions
└── web/                # Web interface (Streamlit)
```

### Database Schema

The application uses SQLAlchemy models with the following main entities:

- **Project**: Main project entity with status, priority, completion tracking
- **Issue**: Issue tracking with assignments, priorities, and workflows
- **Document**: Document management with content, types, and versioning
- **Tag**: Categorization system with colors and relationships

### Testing

The project follows Test-Driven Development (TDD) with comprehensive test coverage:

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/unit/          # Unit tests
pytest tests/integration/   # Integration tests
pytest tests/unit/cli/      # CLI tests

# Run tests with specific markers
pytest -m "not slow"        # Skip slow tests
pytest -m integration       # Only integration tests
```

## Configuration

Configuration can be managed through:

1. **Environment Variables**: `TURBO_DATABASE_URL`, `TURBO_DEBUG`, etc.
2. **Configuration Files**: `.turbo/config.toml` in workspace
3. **CLI Commands**: `turbo config set/get/validate`

### Example Configuration

```toml
[database]
url = "sqlite:///turbo.db"
echo = false

[api]
host = "localhost"
port = 8000

[environment]
debug = false
log_level = "INFO"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass (`pytest`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Coding Standards

- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write docstrings for public APIs
- Add tests for new functionality
- Keep functions focused and small
- Use meaningful variable names

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent web framework
- [SQLAlchemy](https://sqlalchemy.org/) for the powerful ORM
- [Click](https://click.palletsprojects.com/) for the CLI framework
- [Rich](https://rich.readthedocs.io/) for beautiful terminal output
- [Pydantic](https://pydantic.dev/) for data validation

## Support

For support, please:

1. Check the [documentation](#documentation)
2. Search [existing issues](issues)
3. Create a [new issue](issues/new) if needed

---

**Built using modern Python and following best practices**