# Turbo Code by Knol
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

### Database Configuration

```bash
# Configure database (one-time setup)
turbo config database  # Interactive prompt
# or
turbo config database --type sqlite    # Use local SQLite
turbo config database --type postgres  # Use PostgreSQL (requires Docker)
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

#### Configuration Commands
```bash
turbo config show        # Show current configuration
turbo config database    # Configure database connection
turbo config set         # Set configuration value
turbo config get         # Get configuration value
turbo config validate    # Validate configuration
turbo config path        # Show config file paths
```

#### Global Commands
```bash
turbo init               # Initialize workspace
turbo status             # Show workspace status
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

## Docker Deployment

### Quick Start with Docker

```bash
# Start the complete stack (API + Database + Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the stack
docker-compose down
```

The API will be available at `http://localhost:8001` with documentation at `http://localhost:8001/docs`.

### Service Overview

- **API Server**: `http://localhost:8001` (FastAPI application)
- **PostgreSQL**: `localhost:5432` (Database)
- **Redis**: `localhost:6379` (Caching - future use)
- **Test Database**: `localhost:5433` (For testing - start with `--profile testing`)

### Development Options

1. **Full Docker Stack**: Everything in containers
   ```bash
   docker-compose up -d
   ```

2. **Hybrid Development**: CLI on host, API in Docker
   ```bash
   # Start database and API in Docker
   docker-compose up -d
   # Configure CLI to use Docker database
   turbo config database --type postgres
   ```

3. **Local Development**: Everything on host
   ```bash
   turbo config database --type sqlite
   uvicorn turbo.main:app --reload
   ```

## API Usage

Start the API server locally:

```bash
# Development server
uvicorn turbo.main:app --reload

# Production server
uvicorn turbo.main:app --host 0.0.0.0 --port 8000
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

The application uses SQLAlchemy 2.0 with async support and the following main entities:

- **Project**: Main project entity with status, priority, completion tracking
- **Issue**: Issue tracking with assignments, priorities, and workflows
- **Document**: Document management with content, types, and versioning
- **Tag**: Categorization system with colors and relationships

#### Database Initialization

```bash
# For Docker setup (automatic)
docker-compose up -d

# For local setup
python -c "import asyncio; from turbo.core.database.connection import init_database; asyncio.run(init_database())"
```

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

# Run tests with coverage
pytest --cov=turbo --cov-report=html

# Current test status: 171 passed, 170 failed, 11 errors (352 total)
# Core functionality working, advanced features partially implemented
```

## Configuration

### Database Configuration

Turbo Code supports both SQLite (local) and PostgreSQL (production) databases. Use the configuration command for easy setup:

```bash
# Interactive configuration
turbo config database
# Choose: sqlite or postgres

# Direct configuration
turbo config database --type sqlite     # Local SQLite database
turbo config database --type postgres   # PostgreSQL (requires Docker)
```

This creates a configuration file at `~/.turbo/database.env` and sets the appropriate `DATABASE_URL` for your session.

### Configuration Management

Configuration can be managed through:

1. **CLI Commands**: `turbo config database`, `turbo config show`, etc.
2. **Environment Variables**: `DATABASE_URL`, `TURBO_DEBUG`, etc.
3. **Configuration Files**: `.turbo/config.toml` in workspace

### View Current Configuration

```bash
# Show all configuration
turbo config show

# Show in JSON format
turbo config show --format json

# Get specific value
turbo config get database.url

# Validate configuration
turbo config validate
```

### Configuration Sources (in order of preference)

1. Environment variables: `DATABASE_URL`, `TURBO_ENVIRONMENT`, etc.
2. User config: `~/.turbo/database.env`
3. Project config: `.turbo/config.toml`
4. Default values

### Example Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://turbo:turbo_password@localhost:5432/turbo

# API Server
API_HOST=0.0.0.0
API_PORT=8000

# Environment
TURBO_ENVIRONMENT=production
TURBO_DEBUG=false
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