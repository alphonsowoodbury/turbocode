---
doc_type: user_guide
project_name: Turbo Code Platform
title: Automated Document Upload Guide
version: "1.0"
tags: documentation, automation, file-watching
---

# Automated Document Upload Guide

## Overview

Turbo includes an automated document upload system that watches the `docs/` directory and automatically uploads new or modified files to the Turbo database. This allows staff members to simply drop files into the `docs/` folder and have them automatically appear in Turbo.

## How It Works

```
Staff saves file → File Watcher detects change → API processes file → Document appears in Turbo
```

### Components

1. **Header Matter Specification** (`docs/HEADER_MATTER_SPEC.md`)
   - Defines YAML frontmatter format for document metadata
   - Controls document type, project association, tags, etc.

2. **File Watcher Service** (`docs-watcher` Docker container)
   - Monitors `docs/` directory for changes
   - Automatically triggers upload on file creation/modification
   - Runs in background as Docker service

3. **Upload API Endpoint** (`POST /api/v1/documents/upload-file`)
   - Parses frontmatter metadata
   - Auto-creates projects and tags if they don't exist
   - Handles file content extraction and storage

## Usage

### For Staff: Uploading Documents

**Simply save files to the `docs/` directory - that's it!**

```bash
# Example: Save a new guide
cp my-new-guide.md ~/Documents/Code/PycharmProjects/turboCode/docs/guides/

# File will be automatically uploaded within seconds
```

### Adding Frontmatter (Optional but Recommended)

Add YAML frontmatter to control how documents are uploaded:

```markdown
---
doc_type: user_guide
project_name: Turbo Code Platform
title: My Custom Title
version: "1.0"
tags: guide, tutorial, getting-started
---

# My Custom Title

Your document content starts here...
```

### Frontmatter Fields

**Required:**
- `doc_type` - Type of document (user_guide, specification, api_doc, adr, etc.)
- `project_name` - Project to associate document with

**Optional:**
- `title` - Custom title (auto-detected from filename or H1 heading if omitted)
- `version` - Document version (default: "1.0")
- `tags` - Comma-separated tags
- `author` - Author email
- `auto_upload` - Set to `false` to prevent automatic upload
- `update_mode` - How to handle existing documents (`upsert`, `skip`, `create_new`)

### Auto-Detection

If you don't include frontmatter, Turbo will auto-detect:

- **Title**: From first `# Heading` or filename
- **Doc Type**: From file path (e.g., `docs/guides/` → `user_guide`)
- **Project**: Defaults to "Turbo Code Platform"
- **Format**: From file extension (.md → markdown, .txt → text)

## Supported File Types

- **Markdown** (.md)
- **Text** (.txt)
- More formats coming soon (PDF, DOCX, HTML)

## File Organization

Recommended directory structure:

```
docs/
├── guides/          # User guides (auto-detected as user_guide)
├── adr/             # Architecture Decision Records (auto-detected as adr)
├── api/             # API documentation (auto-detected as api_doc)
├── specifications/  # Technical specs (auto-detected as specification)
├── architecture/    # Architecture docs (auto-detected as design)
└── deployment/      # Deployment docs (auto-detected as other)
```

## Examples

### Example 1: Simple Guide (No Frontmatter)

```markdown
# Getting Started with Turbo

This guide will help you get started...
```

**Result:**
- Title: "Getting Started with Turbo"
- Doc Type: "user_guide" (from `/guides/` directory)
- Project: "Turbo Code Platform"

### Example 2: Full Frontmatter

```markdown
---
doc_type: specification
project_name: Turbo Code Platform
title: REST API Specification v2
version: "2.0"
author: alphonso@turbo.dev
tags: api, rest, specification, v2
update_mode: upsert
---

# REST API Specification v2

## Overview
...
```

**Result:**
- Title: "REST API Specification v2"
- Doc Type: "specification"
- Project: "Turbo Code Platform"
- Tags: api, rest, specification, v2
- Updates existing document if one with same title exists

### Example 3: Disable Auto-Upload

```markdown
---
doc_type: other
project_name: Turbo Code Platform
auto_upload: false
---

# Draft Document

This is a work in progress...
```

**Result:** File will NOT be uploaded automatically

## Monitoring

### Check Upload Status

```bash
# View docs-watcher logs
docker-compose logs docs-watcher --tail=50

# Follow logs in real-time
docker-compose logs docs-watcher -f
```

### Successful Upload Example

```
turbo-docs-watcher  | 2025-10-19 22:38:10,092 - __main__ - INFO - Processing document: /docs/guides/pgadmin-guide.md
turbo-docs-watcher  | 2025-10-19 22:38:10,111 - httpx - INFO - HTTP Request: POST http://api:8000/api/v1/documents/upload-file "HTTP/1.1 201 Created"
turbo-docs-watcher  | 2025-10-19 22:38:10,112 - __main__ - INFO - Successfully uploaded document: pgAdmin User Guide (ID: 77ec4890-f7cb-4a89-b002-8351e7994786)
```

## Manual Upload (Alternative Method)

If you need to upload a file manually without using the watcher:

```bash
curl -F "file=@docs/guides/my-guide.md" http://localhost:8001/api/v1/documents/upload-file
```

## Troubleshooting

### Document Not Uploading

1. **Check file watcher is running:**
   ```bash
   docker-compose ps docs-watcher
   ```

2. **Check logs for errors:**
   ```bash
   docker-compose logs docs-watcher --tail=100
   ```

3. **Verify frontmatter YAML is valid:**
   - Ensure `---` delimiters are on separate lines
   - Check for YAML syntax errors

### Duplicate Documents

If you're getting duplicate documents:

1. **Set `update_mode: upsert`** in frontmatter to update existing documents
2. **Or set `update_mode: skip`** to prevent re-uploading

### File Not Detected

The watcher only monitors:
- `.md` and `.txt` files
- Files outside `.git`, `node_modules`, `__pycache__`, etc.
- Files without `auto_upload: false` in frontmatter

## System Architecture

```
┌─────────────┐
│  docs/      │  Staff saves file here
└──────┬──────┘
       │
       │ (File system watch)
       ▼
┌─────────────────────┐
│  docs-watcher       │  Detects changes
│  Docker Service     │
└──────┬──────────────┘
       │
       │ POST /documents/upload-file
       ▼
┌─────────────────────┐
│  Turbo API          │  Processes frontmatter
│  (FastAPI)          │  Auto-creates projects/tags
└──────┬──────────────┘
       │
       │ SQL INSERT/UPDATE
       ▼
┌─────────────────────┐
│  PostgreSQL         │  Documents stored
│  Database           │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Frontend UI        │  Documents visible
│  (Next.js)          │
└─────────────────────┘
```

## Advanced Configuration

### Environment Variables

Configure docs-watcher via environment variables in `docker-compose.yml`:

```yaml
docs-watcher:
  environment:
    - TURBO_API_URL=http://api:8000/api/v1
    - DOCS_WATCH_DIR=/docs
```

### Restart Watcher

```bash
docker-compose restart docs-watcher
```

### Rebuild Watcher

```bash
docker-compose build docs-watcher
docker-compose up -d docs-watcher
```

## Best Practices

1. **Always add frontmatter** to new documents for proper organization
2. **Use descriptive titles** that will be meaningful in Turbo
3. **Tag documents** appropriately for easy searching
4. **Organize by directory** (`guides/`, `adr/`, etc.) for auto-detection
5. **Set `update_mode: upsert`** for documents that you'll edit frequently
6. **Use versioning** for specifications and formal documents

## Summary

The automated document upload system makes it effortless for staff to contribute documentation:

- ✅ **Zero manual steps** - just save files to `docs/`
- ✅ **Intelligent auto-detection** - title, type, project
- ✅ **Flexible metadata** - optional YAML frontmatter
- ✅ **Real-time monitoring** - instant upload on file changes
- ✅ **Tag support** - auto-create and associate tags
- ✅ **Project association** - auto-create projects if needed

---

**Last Updated**: October 19, 2025
**Version**: 1.0
