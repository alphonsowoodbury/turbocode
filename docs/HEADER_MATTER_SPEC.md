---
doc_type: specification
project_name: Turbo Code Platform
title: Document Header Matter Specification
version: "1.0"
---

# Document Header Matter Specification

## Overview

This document defines the header matter (frontmatter) system for Turbo documents. Header matter is YAML-formatted metadata placed at the beginning of document files that controls how they are uploaded and managed in Turbo.

## Format

Header matter must:
1. Be placed at the very beginning of the file
2. Start and end with `---` on separate lines
3. Contain valid YAML key-value pairs
4. Not be displayed in the UI (stripped when rendering)

### Example

```markdown
---
doc_type: user_guide
project_name: Turbo Code Platform
title: Neo4j Browser User Guide
version: "1.0"
author: alphonso@turbo.dev
tags: database, neo4j, guide
auto_upload: true
---

# Neo4j Browser User Guide

Your document content starts here...
```

## Fields

### Required Fields

#### `doc_type`
**Type**: String (enum)
**Required**: Yes
**Description**: Type of document

**Valid values**:
- `specification` - Technical specifications
- `user_guide` - User guides and tutorials
- `api_doc` - API documentation
- `readme` - README files
- `changelog` - Change logs
- `requirements` - Requirements documents
- `design` - Design documents
- `adr` - Architecture Decision Records
- `other` - Other document types

#### `project_name`
**Type**: String
**Required**: Yes
**Description**: Name of the project this document belongs to. If project doesn't exist, it will be created automatically.

#### `title`
**Type**: String
**Required**: No (auto-detected from filename or first H1)
**Description**: Document title. If not provided, will be extracted from filename or first heading.

### Optional Fields

#### `version`
**Type**: String
**Default**: "1.0"

#### `author`
**Type**: String (email)

#### `tags`
**Type**: String (comma-separated) or Array
**Description**: Tags to associate with this document

#### `auto_upload`
**Type**: Boolean
**Default**: true
**Description**: Whether this document should be automatically uploaded to Turbo when detected

#### `format`
**Type**: String (enum)
**Default**: Auto-detected from file extension
**Valid values**: `markdown`, `html`, `text`, `pdf`, `docx`

#### `update_mode`
**Type**: String (enum)
**Default**: "upsert"
**Description**: How to handle existing documents with same title
**Valid values**: `upsert`, `skip`, `create_new`

## Processing Rules

### Title Detection

Title is determined in this order:
1. `title` field in header matter (highest priority)
2. First H1 heading (`# Title`) in content
3. Filename (without extension)
4. `"Untitled Document"` (fallback)

### Project Association

Projects are resolved in this order:
1. Find existing project by exact name match
2. Create new project if it doesn't exist
3. Use default project if `project_name` not specified

## File Watcher Behavior

The automated file watcher will:

1. **Watch directories**: `docs/`, `docs/guides/`, `docs/adr/`, and subdirectories
2. **Detect changes**: New files created, existing files modified
3. **Process files**: Parse header matter, extract content, upload to Turbo
4. **Skip files**: Files with `auto_upload: false`, hidden files, `node_modules/`, `.git/`

---

**Last Updated**: October 19, 2025
**Version**: 1.0
