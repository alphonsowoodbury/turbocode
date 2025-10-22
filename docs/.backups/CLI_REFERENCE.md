# Turbo Code CLI Reference

This document provides a comprehensive reference for all Turbo Code CLI commands and options.

## Installation and Setup

```bash
# Install Turbo Code
pip install -e .

# Configure database (first time setup)
turbo config database
# Choose: sqlite (local) or postgres (Docker required)

# Initialize workspace
turbo init

# Check status
turbo status
```

## Global Options

All commands support these global options:

- `--help`: Show help for the command
- `--format`: Output format (table, json, csv) where applicable
- `--verbose`: Enable verbose output
- `--quiet`: Suppress non-essential output

## Configuration Commands

### `turbo config`

Manage Turbo Code configuration settings.

#### `turbo config show`

Show current configuration in table format.

```bash
turbo config show                    # Table format (default)
turbo config show --format json     # JSON format
```

#### `turbo config database`

Configure database connection (one-time setup).

```bash
turbo config database               # Interactive prompt
turbo config database --type sqlite # Use SQLite database
turbo config database --type postgres # Use PostgreSQL database
```

**SQLite Configuration:**
- Database file: `./turbo.db`
- Best for: Local development, single user
- Requirements: None

**PostgreSQL Configuration:**
- Connection: `localhost:5432/turbo`
- Best for: Production, multi-user, Docker deployment
- Requirements: Docker containers running (`docker-compose up -d`)

#### `turbo config get`

Get a specific configuration value.

```bash
turbo config get database.url       # Get database URL
turbo config get api.port          # Get API port
turbo config get environment        # Get environment setting
```

Supports nested keys with dot notation (e.g., `database.url`, `api.host`).

#### `turbo config set`

Set a configuration value (future implementation).

```bash
turbo config set debug true
turbo config set log_level DEBUG
```

#### `turbo config validate`

Validate current configuration and show status checks.

```bash
turbo config validate
```

Shows validation results for:
- Database URL connectivity
- Environment settings
- Required directories
- Configuration file integrity

#### `turbo config path`

Show configuration file search paths and their status.

```bash
turbo config path
```

Shows paths in order of preference:
1. `./turbo/config.toml` (project-specific)
2. `~/.turbo/config.toml` (user-specific)
3. `/etc/turbo/config.toml` (system-wide)

## Project Commands

### `turbo projects`

Manage projects in your workspace.

#### `turbo projects create`

Create a new project.

```bash
turbo projects create --name "My Project" --description "Project description"
turbo projects create --name "Website" --description "Company website" --status active --priority high
```

**Options:**
- `--name` (required): Project name
- `--description`: Project description
- `--status`: Project status (active, inactive, archived) - default: active
- `--priority`: Project priority (low, medium, high) - default: medium

#### `turbo projects list`

List all projects with filtering and pagination.

```bash
turbo projects list                           # All projects
turbo projects list --status active          # Filter by status
turbo projects list --priority high          # Filter by priority
turbo projects list --limit 10 --offset 20   # Pagination
turbo projects list --format json            # JSON output
```

**Options:**
- `--status`: Filter by status (active, inactive, archived)
- `--priority`: Filter by priority (low, medium, high)
- `--limit`: Number of results (default: 50)
- `--offset`: Skip number of results (default: 0)
- `--format`: Output format (table, json, csv)

#### `turbo projects get`

Get detailed information about a specific project.

```bash
turbo projects get <project-id>
turbo projects get --format json <project-id>
```

#### `turbo projects update`

Update an existing project.

```bash
turbo projects update <project-id> --name "New Name" --description "Updated description"
turbo projects update <project-id> --status archived --priority low
```

**Options:**
- `--name`: Update project name
- `--description`: Update description
- `--status`: Update status
- `--priority`: Update priority

#### `turbo projects delete`

Delete a project permanently.

```bash
turbo projects delete <project-id>
turbo projects delete --force <project-id>  # Skip confirmation
```

#### `turbo projects archive`

Archive a project (soft delete).

```bash
turbo projects archive <project-id>
turbo projects archive --reason "Project completed" <project-id>
```

#### `turbo projects search`

Search projects by name, description, or other fields.

```bash
turbo projects search "website"              # Search all fields
turbo projects search --name "web"           # Search names only
turbo projects search --description "react"  # Search descriptions only
```

#### `turbo projects stats`

Show project statistics and analytics.

```bash
turbo projects stats                # Overall statistics
turbo projects stats <project-id>  # Specific project stats
```

## Issue Commands

### `turbo issues`

Manage issues within projects.

#### `turbo issues create`

Create a new issue.

```bash
turbo issues create --title "Bug fix" --description "Fix login issue" --project-id <project-id>
turbo issues create --title "Feature" --description "Add search" --project-id <project-id> --priority high --issue-type feature
```

**Options:**
- `--title` (required): Issue title
- `--description`: Issue description
- `--project-id` (required): Associated project ID
- `--priority`: Priority (low, medium, high) - default: medium
- `--issue-type`: Issue type (bug, feature, task, enhancement) - default: task
- `--assignee`: Assigned user
- `--tags`: Comma-separated tag names

#### `turbo issues list`

List issues with filtering options.

```bash
turbo issues list                                    # All issues
turbo issues list --project-id <project-id>         # Project issues
turbo issues list --status open                     # Open issues only
turbo issues list --priority high                   # High priority issues
turbo issues list --assignee "john.doe"             # Assigned to user
turbo issues list --issue-type bug                  # Bug reports only
```

**Options:**
- `--project-id`: Filter by project
- `--status`: Filter by status (open, in_progress, resolved, closed)
- `--priority`: Filter by priority (low, medium, high)
- `--assignee`: Filter by assignee
- `--issue-type`: Filter by type (bug, feature, task, enhancement)
- `--limit/--offset`: Pagination
- `--format`: Output format

#### `turbo issues get`

Get detailed information about an issue.

```bash
turbo issues get <issue-id>
turbo issues get --format json <issue-id>
```

#### `turbo issues update`

Update an existing issue.

```bash
turbo issues update <issue-id> --title "Updated title" --description "New description"
turbo issues update <issue-id> --priority high --status in_progress
```

#### `turbo issues assign`

Assign an issue to a user.

```bash
turbo issues assign <issue-id> --assignee "john.doe"
turbo issues assign <issue-id> --assignee ""  # Unassign
```

#### `turbo issues close`

Close an issue with optional resolution.

```bash
turbo issues close <issue-id>
turbo issues close <issue-id> --resolution "Fixed in version 1.2"
```

#### `turbo issues reopen`

Reopen a closed issue.

```bash
turbo issues reopen <issue-id>
turbo issues reopen <issue-id> --reason "Issue still exists"
```

#### `turbo issues search`

Search issues across all projects.

```bash
turbo issues search "login bug"              # Search all fields
turbo issues search --title "authentication" # Search titles only
turbo issues search --assignee "john"        # Search by assignee
```

#### `turbo issues stats`

Show issue statistics and metrics.

```bash
turbo issues stats                  # Overall issue statistics
turbo issues stats <project-id>    # Project-specific stats
```

## Document Commands

### `turbo documents`

Manage documents and files in your workspace.

#### `turbo documents create`

Create a new document.

```bash
turbo documents create --title "API Documentation" --content "# API Docs..." --project-id <project-id>
turbo documents create --title "README" --content-file ./README.md --type markdown
```

**Options:**
- `--title` (required): Document title
- `--content`: Document content (inline)
- `--content-file`: Load content from file
- `--project-id`: Associate with project
- `--type`: Document type (markdown, text, code, documentation)
- `--path`: File path for code documents
- `--tags`: Comma-separated tag names

#### `turbo documents list`

List documents with filtering.

```bash
turbo documents list                        # All documents
turbo documents list --project-id <id>     # Project documents
turbo documents list --type markdown       # Markdown documents only
turbo documents list --search "api"        # Search content
```

**Options:**
- `--project-id`: Filter by project
- `--type`: Filter by document type
- `--search`: Search document content
- `--limit/--offset`: Pagination
- `--format`: Output format

#### `turbo documents get`

Get document details and content.

```bash
turbo documents get <document-id>
turbo documents get --raw <document-id>     # Raw content only
turbo documents get --format json <document-id>
```

#### `turbo documents update`

Update document content or metadata.

```bash
turbo documents update <document-id> --title "New Title" --content "Updated content"
turbo documents update <document-id> --content-file ./updated.md
```

#### `turbo documents delete`

Delete a document permanently.

```bash
turbo documents delete <document-id>
turbo documents delete --force <document-id>  # Skip confirmation
```

#### `turbo documents export`

Export document to various formats.

```bash
turbo documents export <document-id> --format pdf --output ./document.pdf
turbo documents export <document-id> --format docx --output ./document.docx
turbo documents export <document-id> --format html --output ./document.html
```

**Supported formats:** pdf, docx, html, markdown, text

#### `turbo documents template`

Create document from template.

```bash
turbo documents template --template api-spec --title "User API" --project-id <id>
turbo documents template --list  # Show available templates
```

#### `turbo documents edit`

Open document in external editor.

```bash
turbo documents edit <document-id>                    # Default editor
turbo documents edit <document-id> --editor vim       # Specific editor
turbo documents edit <document-id> --editor "code -w" # VS Code
```

#### `turbo documents search`

Search document content across all documents.

```bash
turbo documents search "API endpoint"
turbo documents search --type markdown "header"
turbo documents search --project-id <id> "todo"
```

## Tag Commands

### `turbo tags`

Manage tags for categorizing and organizing items.

#### `turbo tags create`

Create a new tag.

```bash
turbo tags create --name "frontend" --color blue --description "Frontend tasks"
turbo tags create --name "urgent" --color red --description "Urgent items"
```

**Options:**
- `--name` (required): Tag name (unique)
- `--color`: Tag color (red, blue, green, yellow, purple, cyan, magenta, white)
- `--description`: Tag description

#### `turbo tags list`

List all tags with usage statistics.

```bash
turbo tags list                    # All tags
turbo tags list --color blue       # Blue tags only
turbo tags list --usage-min 5      # Tags used 5+ times
turbo tags list --format json      # JSON output
```

#### `turbo tags get`

Get detailed tag information.

```bash
turbo tags get <tag-id>
turbo tags get --format json <tag-id>
```

#### `turbo tags update`

Update tag properties.

```bash
turbo tags update <tag-id> --name "new-name" --color green
turbo tags update <tag-id> --description "Updated description"
```

#### `turbo tags delete`

Delete a tag (removes from all associated items).

```bash
turbo tags delete <tag-id>
turbo tags delete --force <tag-id>  # Skip confirmation
```

#### `turbo tags search`

Search tags by name or description.

```bash
turbo tags search "front"           # Search names and descriptions
turbo tags search --name "api"      # Search names only
```

#### `turbo tags colors`

Show available tag colors with examples.

```bash
turbo tags colors
```

#### `turbo tags usage`

Show tag usage statistics.

```bash
turbo tags usage                 # All tag usage stats
turbo tags usage <tag-id>        # Specific tag usage
```

#### `turbo tags related`

Show items associated with a tag.

```bash
turbo tags related <tag-id>                    # All related items
turbo tags related <tag-id> --type projects    # Projects only
turbo tags related <tag-id> --type issues      # Issues only
```

## Global Commands

### `turbo init`

Initialize a new Turbo Code workspace in the current directory.

```bash
turbo init                           # Initialize with defaults
turbo init --name "My Workspace"     # Custom workspace name
turbo init --force                   # Override existing workspace
```

### `turbo status`

Show workspace status and statistics.

```bash
turbo status                # Overview of workspace
turbo status --detailed     # Detailed statistics
turbo status --format json  # JSON output
```

Shows:
- Database connection status
- Number of projects, issues, documents, tags
- Recent activity
- Configuration status

### `turbo search`

Global search across all entities (projects, issues, documents, tags).

```bash
turbo search "authentication"              # Search all entities
turbo search --type projects "website"     # Search projects only
turbo search --type issues "bug"           # Search issues only
turbo search --limit 20 "api"             # Limit results
```

**Options:**
- `--type`: Search specific entity type (projects, issues, documents, tags)
- `--limit`: Maximum number of results
- `--format`: Output format

### `turbo export`

Export workspace data to various formats.

```bash
turbo export --format json --output ./backup.json     # JSON export
turbo export --format csv --output ./data.csv         # CSV export
turbo export --type projects --output ./projects.json # Projects only
```

**Options:**
- `--format`: Export format (json, csv, yaml)
- `--output`: Output file path
- `--type`: Export specific entity type only
- `--include-content`: Include document content in export

### `turbo import`

Import data from external sources.

```bash
turbo import --format json --input ./backup.json     # JSON import
turbo import --format csv --input ./data.csv         # CSV import
turbo import --merge                                  # Merge with existing data
```

**Options:**
- `--format`: Import format (json, csv, yaml)
- `--input`: Input file path
- `--merge`: Merge with existing data (default: replace)
- `--validate`: Validate data before import

### `turbo completion`

Set up shell completion for Turbo Code commands.

```bash
turbo completion --shell bash    # Bash completion
turbo completion --shell zsh     # Zsh completion
turbo completion --shell fish    # Fish completion
```

Add the output to your shell's configuration file (e.g., `.bashrc`, `.zshrc`).

## Output Formats

Most commands support multiple output formats:

### Table Format (Default)

Human-readable tabular output with colors and formatting.

```bash
turbo projects list
```

### JSON Format

Machine-readable JSON output for scripting and automation.

```bash
turbo projects list --format json
```

### CSV Format

Comma-separated values for data analysis and spreadsheet import.

```bash
turbo projects list --format csv
```

## Environment Variables

Turbo Code respects these environment variables:

- `DATABASE_URL`: Database connection string
- `TURBO_ENVIRONMENT`: Environment (development, testing, production)
- `TURBO_DEBUG`: Enable debug mode (true/false)
- `TURBO_LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `API_HOST`: API server host (default: 127.0.0.1)
- `API_PORT`: API server port (default: 8000)

## Error Handling

Turbo Code provides clear error messages and exit codes:

- `0`: Success
- `1`: General error
- `2`: Invalid command or arguments
- `3`: Configuration error
- `4`: Database connection error
- `5`: Resource not found error

Use `--verbose` for detailed error information or `--quiet` to suppress non-essential output.

## Tips and Best Practices

### Database Management

1. Use SQLite for local development and testing
2. Use PostgreSQL for production and team environments
3. Regular backups: `turbo export --format json --output backup-$(date +%Y%m%d).json`

### Organization

1. Use meaningful project and issue names
2. Apply consistent tagging conventions
3. Keep documents organized by project
4. Use issue types appropriately (bug, feature, task, enhancement)

### Automation

1. Use JSON output format for scripting
2. Combine commands with shell scripts for complex workflows
3. Set up shell completion for faster command entry
4. Use environment variables for consistent configuration

### Performance

1. Use pagination (`--limit`, `--offset`) for large datasets
2. Filter results early to reduce output
3. Use specific search terms to narrow results
4. Consider indexing for frequently searched fields

For more information, see the main [README](../README.md) or run `turbo --help` for command-specific help.