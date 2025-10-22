---
doc_type: other
project_name: Turbo Code Platform
title: 'Turbo: Development Environment Setup'
version: '1.0'
tags: development
---

# Turbo: Development Environment Setup

**Version:** 1.0
**Date:** September 28, 2025
**Owner:** Engineering Team

---

## Overview

This guide provides step-by-step instructions for setting up a complete development environment for the Turbo project. Follow these instructions to ensure consistency across all development machines and enable all code quality tools.

## Prerequisites

### Required Software
- **Python 3.10+** (3.11 recommended)
- **Git** (latest version)
- **VS Code** or **PyCharm** (recommended IDEs)
- **Claude Code CLI** (for AI integration testing)

### System Requirements
- **Operating System**: macOS, Linux, or Windows with WSL2
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 5GB free space for development environment
- **Network**: Internet connection for package downloads

## Quick Start

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/username/turbo.git
cd turbo

# Verify you're on the correct branch
git branch
```

### 2. Set Up Python Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Verify Python version
python --version  # Should be 3.10+
```

### 3. Install Dependencies
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install Turbo in development mode with all dependencies
pip install -e ".[dev]"

# Verify installation
turbo --help
```

### 4. Set Up Pre-commit Hooks
```bash
# Install pre-commit hooks
pre-commit install

# Run hooks on all files (optional, to test setup)
pre-commit run --all-files
```

### 5. Verify Setup
```bash
# Run all quality checks
make check  # or manually run the commands below

# Format code
black .

# Lint code
ruff check .

# Type check
mypy turbo/

# Run tests
pytest
```

## Detailed Setup Instructions

### Python Environment Management

#### Using pyenv (Recommended)
```bash
# Install pyenv (if not already installed)
curl https://pyenv.run | bash

# Install Python 3.11
pyenv install 3.11.6
pyenv global 3.11.6

# Verify installation
python --version
```

#### Using conda
```bash
# Create conda environment
conda create -n turbo python=3.11
conda activate turbo

# Install pip in conda environment
conda install pip
```

### Development Dependencies Explained

#### Core Dependencies
```toml
# Framework dependencies
fastapi>=0.104.0          # Web framework
uvicorn[standard]>=0.24.0  # ASGI server
sqlalchemy>=2.0.0         # ORM
streamlit>=1.28.0         # Web UI
typer[all]>=0.9.0         # CLI framework
```

#### Development Tools
```toml
# Code quality
black>=23.9.0             # Code formatter
ruff>=0.1.0               # Linter and import sorter
mypy>=1.6.0               # Type checker
pre-commit>=3.5.0         # Git hooks

# Testing
pytest>=7.4.0             # Test framework
pytest-asyncio>=0.21.0    # Async testing
pytest-cov>=4.1.0         # Coverage reporting
```

### IDE Configuration

#### VS Code Setup
Create `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./.venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.linting.mypyEnabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length=88"],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true,
    ".mypy_cache": true,
    ".pytest_cache": true,
    ".coverage": true,
    "htmlcov": true
  }
}
```

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/.venv/bin/uvicorn",
      "args": [
        "turbo.main:app",
        "--reload",
        "--host", "127.0.0.1",
        "--port", "8000"
      ],
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "name": "Python: Streamlit",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/.venv/bin/streamlit",
      "args": [
        "run",
        "turbo/web/app/main.py",
        "--server.port", "8501"
      ],
      "console": "integratedTerminal"
    },
    {
      "name": "Python: CLI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/.venv/bin/turbo",
      "args": ["--help"],
      "console": "integratedTerminal"
    },
    {
      "name": "Python: Test",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/.venv/bin/pytest",
      "args": [
        "${workspaceFolder}/tests",
        "-v"
      ],
      "console": "integratedTerminal"
    }
  ]
}
```

#### PyCharm Setup
1. **Open Project**: File → Open → Select turbo directory
2. **Configure Interpreter**:
   - File → Settings → Project → Python Interpreter
   - Add Interpreter → Existing Environment
   - Select `.venv/bin/python`
3. **Enable Tools**:
   - Settings → Tools → External Tools → Add tools for Black, Ruff, MyPy
4. **Configure Code Style**:
   - Settings → Editor → Code Style → Python
   - Set line length to 88
   - Enable optimize imports on the fly

### Environment Variables

Create `.env` file in project root:
```env
# Development Environment Configuration
TURBO_ENV=development
TURBO_DEBUG=true
TURBO_LOG_LEVEL=DEBUG

# Database Configuration
DATABASE_URL=sqlite:///./turbo_dev.db
DATABASE_ECHO=true

# API Configuration
API_HOST=127.0.0.1
API_PORT=8000
API_RELOAD=true

# Web UI Configuration
WEB_HOST=127.0.0.1
WEB_PORT=8501

# Claude Integration (for testing)
CLAUDE_INTEGRATION_ENABLED=true
CLAUDE_CONTEXT_DIR=.turbo/context
CLAUDE_TEMPLATES_DIR=.turbo/templates
CLAUDE_RESPONSES_DIR=.turbo/responses

# Testing Configuration
TEST_DATABASE_URL=sqlite:///:memory:
```

### Database Setup

#### Initialize Development Database
```bash
# Create database and run migrations
turbo db init

# Create sample data (optional)
turbo db seed --sample-data

# Verify database setup
turbo db status
```

#### Database Development Commands
```bash
# Create new migration
turbo db migrate create "description_of_changes"

# Apply migrations
turbo db migrate up

# Rollback migration
turbo db migrate down

# Reset database (development only)
turbo db reset --confirm
```

### Code Quality Tools

#### Running Quality Checks Manually
```bash
# Format code with Black
black .
black --check .  # Check without formatting

# Lint with Ruff
ruff check .
ruff check --fix .  # Auto-fix issues

# Type check with MyPy
mypy turbo/
mypy --strict turbo/  # Strict mode

# Security check with Bandit
bandit -r turbo/

# Run all pre-commit hooks
pre-commit run --all-files
```

#### Makefile for Common Tasks
Create `Makefile`:
```makefile
.PHONY: help install dev-install test lint format type-check security-check clean

help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install production dependencies
	pip install -e .

dev-install:  ## Install development dependencies
	pip install -e ".[dev]"
	pre-commit install

test:  ## Run tests
	pytest tests/ -v --cov=turbo --cov-report=term-missing

test-unit:  ## Run unit tests only
	pytest tests/unit/ -v

test-integration:  ## Run integration tests only
	pytest tests/integration/ -v

test-e2e:  ## Run end-to-end tests only
	pytest tests/e2e/ -v

lint:  ## Run linting
	ruff check .

format:  ## Format code
	black .
	ruff check --fix .

type-check:  ## Run type checking
	mypy turbo/

security-check:  ## Run security checks
	bandit -r turbo/

check: format lint type-check security-check test  ## Run all quality checks

clean:  ## Clean cache files
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete
	rm -rf .mypy_cache .pytest_cache .coverage htmlcov dist build

dev-server:  ## Start development server
	uvicorn turbo.main:app --reload --host 127.0.0.1 --port 8000

web-server:  ## Start web UI
	streamlit run turbo/web/app/main.py --server.port 8501

db-reset:  ## Reset development database
	turbo db reset --confirm

db-migrate:  ## Run database migrations
	turbo db migrate

watch-tests:  ## Run tests in watch mode
	pytest-watch -- tests/ -v
```

### Testing Setup

#### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=turbo --cov-report=html

# Run specific test categories
pytest tests/unit/ -v          # Unit tests only
pytest tests/integration/ -v   # Integration tests only
pytest tests/e2e/ -v          # End-to-end tests only

# Run tests matching pattern
pytest -k "test_project" -v

# Run tests with markers
pytest -m "not slow" -v       # Skip slow tests
pytest -m "integration" -v    # Run integration tests only
```

#### Test Database Setup
```bash
# Create test database
export TEST_DATABASE_URL="sqlite:///:memory:"

# Run tests with test database
pytest --tb=short
```

### Claude Integration Setup

#### File Structure for Claude Communication
```bash
# Create Claude integration directories
mkdir -p .turbo/{context,templates,responses,exports}

# Set up template files
cp templates/technical_spec.md .turbo/templates/
cp templates/user_story.md .turbo/templates/
cp templates/marketing_copy.md .turbo/templates/
```

#### Testing Claude Integration
```bash
# Test Claude integration (requires Claude Code)
turbo claude test-connection

# Generate sample specification
turbo claude generate-spec --project-id <project-id> --type technical

# Analyze project health
turbo claude analyze --project-id <project-id>
```

### Debugging Setup

#### Python Debugger (pdb)
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use Python 3.7+ built-in
breakpoint()
```

#### Logging Configuration
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Or set environment variable
export TURBO_LOG_LEVEL=DEBUG
```

## Troubleshooting

### Common Issues

#### 1. Import Errors
```bash
# Reinstall in development mode
pip install -e ".[dev]"

# Clear Python cache
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +
```

#### 2. Pre-commit Hook Failures
```bash
# Update pre-commit hooks
pre-commit autoupdate

# Skip hooks temporarily (not recommended)
git commit --no-verify -m "commit message"
```

#### 3. Database Issues
```bash
# Reset database
rm turbo_dev.db
turbo db init

# Check database schema
turbo db status
```

#### 4. Port Conflicts
```bash
# Check what's using port 8000
lsof -i :8000

# Use different port
export API_PORT=8001
uvicorn turbo.main:app --port 8001
```

#### 5. Permission Issues
```bash
# Fix virtual environment permissions
chmod -R 755 .venv/

# Fix file permissions
chmod 644 pyproject.toml
chmod 755 scripts/*.py
```

### Getting Help

#### Documentation
- **Project Docs**: `docs/` directory
- **API Docs**: http://localhost:8000/docs (when server running)
- **Code Style Guide**: `docs/development/CODE_STYLE_GUIDE.md`

#### Debug Information
```bash
# System information
turbo system info

# Environment check
turbo doctor

# Configuration check
turbo config show
```

#### Logging and Monitoring
```bash
# View logs
tail -f turbo.log

# Enable verbose logging
export TURBO_LOG_LEVEL=DEBUG
turbo --verbose command
```

## Development Workflow

### 1. Daily Development
```bash
# Start development session
git pull origin main
source .venv/bin/activate
make dev-server  # Terminal 1
make web-server  # Terminal 2 (optional)

# Make changes
# ... edit code ...

# Check quality before commit
make check

# Commit changes
git add .
git commit -m "feat: add new feature"  # pre-commit hooks run automatically
git push origin feature-branch
```

### 2. Adding New Features
```bash
# Create feature branch
git checkout -b feature/new-feature

# Create tests first (TDD)
# ... write tests ...

# Implement feature
# ... write code ...

# Verify everything works
make check
pytest tests/ -v

# Commit and push
git commit -m "feat: implement new feature"
git push origin feature/new-feature
```

### 3. Code Review Process
1. Create pull request
2. Automated CI checks run
3. Manual code review
4. Address feedback
5. Merge to main

This development setup ensures a consistent, productive environment for all Turbo contributors while maintaining high code quality standards.