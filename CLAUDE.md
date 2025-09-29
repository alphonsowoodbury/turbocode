# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a new Python project created with PyCharm. The repository currently contains:
- `.venv/`: Python virtual environment
- `.idea/`: PyCharm IDE configuration
- `.claude/`: Claude Code settings

## Development Setup

### Python Environment
- The project uses a virtual environment located in `.venv/`
- To activate the virtual environment: `source .venv/bin/activate` (macOS/Linux) or `.venv\Scripts\activate` (Windows)

### Common Commands
Since this is a new project without established build tools, standard Python commands apply:

**Running Python files:**
```bash
python filename.py
```

**Installing dependencies (when requirements.txt exists):**
```bash
pip install -r requirements.txt
```

**Clean up emoji from documentation:**
```bash
# Clean all documentation files
python scripts/cleanup_emoji.py

# Dry run to see what would be cleaned
python scripts/cleanup_emoji.py --dry-run

# Clean specific files
python scripts/cleanup_emoji.py docs/ README.md
```

**Common development commands:**
```bash
# Install package in development mode (when setup.py exists)
pip install -e .

# Run tests (when using pytest)
pytest

# Run tests (when using unittest)
python -m unittest

# Check code style (when using flake8)
flake8

# Format code (when using black)
black .

# Type checking (when using mypy)
mypy .
```

## Project Structure

This is a fresh Python project setup. As the project grows, consider establishing:
- `src/` or package directories for source code
- `tests/` for test files
- `requirements.txt` or `pyproject.toml` for dependencies
- Configuration files for linting, formatting, and testing tools

## IDE Configuration

The project is configured for PyCharm (`.idea/` directory present). The virtual environment should be automatically detected by PyCharm.