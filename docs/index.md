# Turbo Code Documentation

Welcome to the Turbo Code documentation! This directory contains comprehensive guides and references for using and developing with Turbo Code.

## Quick Start

New to Turbo Code? Start here:

1. **[Main README](README.md)** - Project overview and quick start
2. **[Database Configuration](#database-setup)** - Set up your database
3. **[Basic Usage](#basic-usage)** - Create your first project

## Documentation Index

### User Guides

- **[CLI Reference](CLI_REFERENCE.md)** - Complete command-line interface documentation
  - All commands and options
  - Examples and usage patterns
  - Output formats and filtering
  - Configuration management

### Deployment Guides

- **[Docker Deployment](DOCKER_DEPLOYMENT.md)** - Production deployment with Docker
  - Quick start with docker-compose
  - Development workflows
  - Production configuration
  - Monitoring and troubleshooting

### Developer Guides

- **[Development Guide](DEVELOPMENT.md)** - Contributing and development setup
  - Project architecture
  - Test-driven development
  - Adding new features
  - Code quality standards

## Quick Reference

### Database Setup

Choose your database backend:

```bash
# Local SQLite (development)
turbo config database --type sqlite

# PostgreSQL with Docker (production)
turbo config database --type postgres
docker-compose up -d
```

### Basic Usage

```bash
# Initialize workspace
turbo init

# Create a project
turbo projects create --name "My Project" --description "A sample project"

# Create an issue
turbo issues create --title "Add feature" --project-id <project-id>

# List everything
turbo projects list
turbo issues list
```

### Docker Quick Start

```bash
# Start full stack
docker-compose up -d

# Configure CLI to use Docker database
turbo config database --type postgres

# Use CLI with containerized API
turbo projects list
```

### API Access

```bash
# Start API server
uvicorn turbo.main:app --reload

# Access documentation
open http://localhost:8000/docs

# With Docker
docker-compose up -d
open http://localhost:8001/docs
```

## Architecture Overview

Turbo Code follows clean architecture principles:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Interface     │  │   Interface     │  │   Interface     │
│   (CLI)         │  │   (API)         │  │   (Web UI)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────────┐
                    │   Application   │
                    │   (Services)    │
                    └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Domain        │
                    │   (Models)      │
                    └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Infrastructure│
                    │   (Database)    │
                    └─────────────────┘
```

### Core Components

- **Models**: SQLAlchemy entities (Project, Issue, Document, Tag)
- **Schemas**: Pydantic validation and serialization
- **Repositories**: Data access layer with async support
- **Services**: Business logic and use cases
- **API**: FastAPI REST endpoints with auto-documentation
- **CLI**: Rich command-line interface with Click

## Development Workflow

### Test-Driven Development

Turbo Code was built using TDD:

1. **Write Tests First** - Create failing tests
2. **Implement Code** - Make tests pass
3. **Refactor** - Improve while keeping tests green

```bash
# Run tests
pytest                      # All tests
pytest tests/unit/          # Unit tests
pytest tests/integration/   # Integration tests

# With coverage
pytest --cov=turbo --cov-report=html
```

### Code Quality

```bash
# Format code
black .

# Check linting
ruff check . --fix

# Type checking
mypy .

# All quality checks
black . && ruff check --fix . && mypy . && pytest
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=sqlite+aiosqlite:///./turbo.db
DATABASE_URL=postgresql+asyncpg://turbo:password@localhost:5432/turbo

# Application
TURBO_ENVIRONMENT=development  # development, testing, production
TURBO_DEBUG=false
TURBO_LOG_LEVEL=INFO

# API Server
API_HOST=127.0.0.1
API_PORT=8000
```

### Configuration Commands

```bash
# View configuration
turbo config show

# Configure database
turbo config database

# Get specific values
turbo config get database.url
turbo config get environment
```

## Features

### Core Functionality

- [DONE] **Project Management** - Create, organize, and track projects
- [DONE] **Issue Tracking** - Full-featured issue management
- [DONE] **Document Management** - Store and organize documentation
- [DONE] **Tag System** - Categorize with colored tags
- [DONE] **Search & Filtering** - Powerful search capabilities

### Interfaces

- [DONE] **CLI Interface** - Rich command-line interface
- [DONE] **REST API** - Complete FastAPI-based API
- [WIP] **Web Interface** - Streamlit-based UI (coming soon)

### Technical Features

- [DONE] **Async/Await** - Modern Python async patterns
- [DONE] **Type Safety** - Full type hints and validation
- [DONE] **Database Agnostic** - SQLite and PostgreSQL support
- [DONE] **Docker Support** - Complete containerization
- [DONE] **Test Coverage** - Comprehensive test suite
- [DONE] **Code Quality** - Linting, formatting, type checking

## Support and Contributing

### Getting Help

1. **Check Documentation** - Start with these guides
2. **Search Issues** - Look for existing solutions
3. **Ask Questions** - Create new issues for help
4. **Community** - Join discussions and share feedback

### Contributing

1. **Read [Development Guide](DEVELOPMENT.md)** - Understand the codebase
2. **Follow TDD** - Write tests first
3. **Code Quality** - Run all quality checks
4. **Documentation** - Update relevant docs
5. **Pull Requests** - Submit well-documented changes

### Code Standards

- **Python 3.10+** - Modern Python features
- **Type Hints** - All functions must have type hints
- **Async/Await** - Use async patterns consistently
- **Test Coverage** - Comprehensive test coverage required
- **Documentation** - Clear docstrings and guides

## Roadmap

### Current Status (v1.0.0)

- [DONE] Core functionality complete
- [DONE] CLI interface with all commands
- [DONE] REST API with full CRUD operations
- [DONE] Docker deployment setup
- [DONE] Comprehensive test suite (352 tests)
- [DONE] Complete documentation

### Future Enhancements

- [WIP] **Web Interface** - Streamlit-based UI
- [TODO] **AI Integration** - Claude AI features
- [TODO] **Advanced Search** - Full-text search with PostgreSQL
- [TODO] **Real-time Updates** - WebSocket support
- [TODO] **File Attachments** - File upload and management
- [TODO] **User Management** - Authentication and authorization
- [TODO] **Notifications** - Email and webhook notifications
- [TODO] **Import/Export** - Additional format support

### Performance Targets

- [TARGET] **API Response Time** - <100ms for simple operations
- [TARGET] **Database Performance** - Optimized queries and indexing
- [TARGET] **Test Coverage** - >90% code coverage
- [TARGET] **CLI Performance** - <1s for most operations

## Version History

### v1.0.0 (Current)

- Core project management functionality
- Complete CLI interface
- REST API with auto-documentation
- Docker deployment support
- Comprehensive test suite
- Full documentation

For detailed release notes, see the main [README](README.md).

---

**Need help?** Check the specific guides above or create an issue for support!