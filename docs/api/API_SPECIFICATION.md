# Turbo: API Specification

**Version:** 1.0
**Date:** September 28, 2025
**Owner:** Engineering Team

---

## API Overview

Turbo provides a RESTful API built with FastAPI, featuring automatic OpenAPI documentation, request validation, and type-safe responses. The API follows REST conventions with clear resource-based URLs and standard HTTP methods.

**Base URL**: `http://localhost:8000/api/v1`
**Documentation**: `http://localhost:8000/docs` (Swagger UI)
**OpenAPI Schema**: `http://localhost:8000/openapi.json`

## Authentication & Authorization

### Phase 1 (MVP)
- **No Authentication**: Local-only access, no authentication required
- **CORS Policy**: Restricted to localhost origins

### Phase 2 (Future)
- **API Keys**: Simple key-based authentication
- **JWT Tokens**: Session-based authentication
- **Role-Based Access**: Project-level permissions

## API Design Principles

1. **RESTful Design**: Standard HTTP methods and status codes
2. **Resource-Based URLs**: Clear, hierarchical URL structure
3. **Consistent Responses**: Standardized response format
4. **Validation**: Comprehensive request validation with Pydantic
5. **Error Handling**: Detailed error messages and codes
6. **Pagination**: Consistent pagination for list endpoints
7. **Filtering**: Rich filtering and search capabilities

## Common Response Format

```json
{
  "data": {},           // Response payload
  "meta": {             // Metadata
    "timestamp": "2025-09-28T10:30:00Z",
    "request_id": "uuid",
    "version": "1.0"
  },
  "pagination": {       // For list responses
    "page": 1,
    "page_size": 20,
    "total_count": 150,
    "total_pages": 8
  }
}
```

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for request",
    "details": [
      {
        "field": "title",
        "message": "Field is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-09-28T10:30:00Z",
    "request_id": "uuid"
  }
}
```

---

## Projects API

### Base URL: `/api/v1/projects`

#### List Projects
```http
GET /api/v1/projects
```

**Query Parameters:**
- `page` (int, default=1): Page number
- `page_size` (int, default=20): Items per page
- `status` (string): Filter by project status
- `search` (string): Search in name and description
- `tags` (string[]): Filter by tag names

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Context",
      "description": "AI-powered context sharing app",
      "status": "active",
      "priority": "high",
      "created_at": "2025-09-28T10:00:00Z",
      "updated_at": "2025-09-28T15:30:00Z",
      "total_issues": 25,
      "completed_issues": 10,
      "completion_percentage": 40.0,
      "tags": ["mobile", "ai", "productivity"]
    }
  ]
}
```

#### Create Project
```http
POST /api/v1/projects
```

**Request Body:**
```json
{
  "name": "Context",
  "description": "AI-powered context sharing app",
  "priority": "high",
  "tags": ["mobile", "ai"],
  "repository_url": "https://github.com/user/context",
  "target_completion": "2025-12-31T00:00:00Z"
}
```

#### Get Project
```http
GET /api/v1/projects/{project_id}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Context",
    "description": "AI-powered context sharing app",
    "status": "active",
    "priority": "high",
    "created_at": "2025-09-28T10:00:00Z",
    "updated_at": "2025-09-28T15:30:00Z",
    "started_at": "2025-09-28T10:00:00Z",
    "target_completion": "2025-12-31T00:00:00Z",
    "repository_url": "https://github.com/user/context",
    "documentation_url": null,
    "context_summary": "AI-generated project summary...",
    "last_context_update": "2025-09-28T14:00:00Z",
    "total_issues": 25,
    "completed_issues": 10,
    "completion_percentage": 40.0,
    "tags": ["mobile", "ai", "productivity"]
  }
}
```

#### Update Project
```http
PUT /api/v1/projects/{project_id}
PATCH /api/v1/projects/{project_id}
```

#### Delete Project
```http
DELETE /api/v1/projects/{project_id}
```

---

## Issues API

### Base URL: `/api/v1/projects/{project_id}/issues`

#### List Issues
```http
GET /api/v1/projects/{project_id}/issues
```

**Query Parameters:**
- `page` (int): Pagination
- `page_size` (int): Items per page
- `status` (string): Filter by status
- `type` (string): Filter by issue type
- `priority` (string): Filter by priority
- `assignee` (string): Filter by assignee
- `tags` (string[]): Filter by tags
- `search` (string): Search in title and description
- `sort` (string): Sort field (created_at, updated_at, priority)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication system",
      "issue_type": "feature",
      "status": "in_progress",
      "priority": "high",
      "story_points": 8,
      "estimated_hours": 16.0,
      "actual_hours": 12.5,
      "assignee": "john.doe",
      "reporter": "jane.smith",
      "created_at": "2025-09-28T10:00:00Z",
      "updated_at": "2025-09-28T15:30:00Z",
      "started_at": "2025-09-28T11:00:00Z",
      "due_date": "2025-10-05T00:00:00Z",
      "blocked_by": [],
      "blocks": ["uuid2"],
      "parent_issue": null,
      "acceptance_criteria": "AI-generated criteria...",
      "technical_notes": "AI-generated notes...",
      "test_scenarios": "AI-generated test cases...",
      "tags": ["authentication", "security", "backend"],
      "comment_count": 3
    }
  ]
}
```

#### Create Issue
```http
POST /api/v1/projects/{project_id}/issues
```

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "issue_type": "feature",
  "priority": "high",
  "story_points": 8,
  "estimated_hours": 16.0,
  "assignee": "john.doe",
  "due_date": "2025-10-05T00:00:00Z",
  "tags": ["authentication", "security"],
  "generate_ai_content": true
}
```

#### Get Issue
```http
GET /api/v1/projects/{project_id}/issues/{issue_id}
```

#### Update Issue
```http
PUT /api/v1/projects/{project_id}/issues/{issue_id}
PATCH /api/v1/projects/{project_id}/issues/{issue_id}
```

#### Delete Issue
```http
DELETE /api/v1/projects/{project_id}/issues/{issue_id}
```

---

## Documents API

### Base URL: `/api/v1/projects/{project_id}/documents`

#### List Documents
```http
GET /api/v1/projects/{project_id}/documents
```

**Query Parameters:**
- `page` (int): Pagination
- `page_size` (int): Items per page
- `type` (string): Filter by document type
- `status` (string): Filter by status
- `category` (string): Filter by category
- `tags` (string[]): Filter by tags
- `search` (string): Full-text search

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Authentication System Technical Spec",
      "document_type": "technical_spec",
      "status": "approved",
      "category": "backend",
      "version": "1.2",
      "created_at": "2025-09-28T10:00:00Z",
      "updated_at": "2025-09-28T15:30:00Z",
      "published_at": "2025-09-28T16:00:00Z",
      "generated_by_ai": true,
      "human_edited": true,
      "word_count": 2500,
      "reading_time_minutes": 10,
      "completeness_score": 0.95,
      "tags": ["authentication", "security", "api"],
      "export_formats": ["pdf", "docx"]
    }
  ]
}
```

#### Create Document
```http
POST /api/v1/projects/{project_id}/documents
```

**Request Body:**
```json
{
  "title": "Authentication System Technical Spec",
  "content": "# Authentication System\n\n...",
  "document_type": "technical_spec",
  "category": "backend",
  "tags": ["authentication", "security"],
  "generate_with_ai": true,
  "ai_prompt": "Generate a technical specification for JWT authentication"
}
```

#### Get Document
```http
GET /api/v1/projects/{project_id}/documents/{document_id}
```

**Response includes full content:**
```json
{
  "data": {
    "id": "uuid",
    "content": "# Authentication System\n\nThis document outlines...",
    "generation_prompt": "Generate a technical specification...",
    "ai_model_used": "claude-3.5-sonnet",
    "revisions": [
      {
        "version": "1.0",
        "created_at": "2025-09-28T10:00:00Z",
        "change_summary": "Initial version"
      }
    ]
  }
}
```

#### Generate Document with AI
```http
POST /api/v1/projects/{project_id}/documents/generate
```

**Request Body:**
```json
{
  "document_type": "technical_spec",
  "title": "User Authentication System",
  "prompt": "Generate a comprehensive technical specification for implementing JWT-based authentication",
  "context": {
    "related_issues": ["uuid1", "uuid2"],
    "reference_documents": ["uuid3"],
    "include_project_context": true
  }
}
```

---

## Content Assets API

### Base URL: `/api/v1/projects/{project_id}/content`

#### List Content Assets
```http
GET /api/v1/projects/{project_id}/content
```

#### Create Content Asset
```http
POST /api/v1/projects/{project_id}/content
```

**Request Body:**
```json
{
  "title": "Context App Landing Page Copy",
  "asset_type": "landing_page_copy",
  "platform": "web",
  "audience": "productivity_users",
  "tone": "professional",
  "generate_with_ai": true,
  "prompt": "Create compelling landing page copy for Context app"
}
```

#### Generate Content with AI
```http
POST /api/v1/projects/{project_id}/content/generate
```

---

## Comments API

### Base URL: `/api/v1/projects/{project_id}/issues/{issue_id}/comments`

#### List Comments
```http
GET /api/v1/projects/{project_id}/issues/{issue_id}/comments
```

#### Add Comment
```http
POST /api/v1/projects/{project_id}/issues/{issue_id}/comments
```

**Request Body:**
```json
{
  "content": "Great progress on this issue! The authentication flow looks solid.",
  "comment_type": "comment"
}
```

---

## Tags API

### Base URL: `/api/v1/tags`

#### List All Tags
```http
GET /api/v1/tags
```

#### Create Tag
```http
POST /api/v1/tags
```

#### Auto-generate Tags
```http
POST /api/v1/projects/{project_id}/tags/generate
```

---

## Search API

### Base URL: `/api/v1/search`

#### Global Search
```http
GET /api/v1/search?q={query}&type={type}&project_id={project_id}
```

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string[]): Entity types to search (issues, documents, content)
- `project_id` (string): Limit search to specific project
- `limit` (int, default=20): Maximum results

**Response:**
```json
{
  "data": {
    "issues": [...],
    "documents": [...],
    "content_assets": [...],
    "total_results": 45
  }
}
```

---

## AI Integration API

### Base URL: `/api/v1/ai`

#### Generate Project Context
```http
POST /api/v1/ai/context/{project_id}
```

#### Generate Issue Details
```http
POST /api/v1/ai/issues/{issue_id}/enhance
```

#### Analyze Project Health
```http
GET /api/v1/ai/projects/{project_id}/analysis
```

---

## Export API

### Base URL: `/api/v1/export`

#### Export Project
```http
GET /api/v1/export/projects/{project_id}?format={format}
```

**Formats:** json, csv, pdf, markdown

#### Export Document
```http
GET /api/v1/export/documents/{document_id}?format={format}
```

**Formats:** pdf, docx, html, markdown

---

## Webhooks API (Future)

### Base URL: `/api/v1/webhooks`

#### Register Webhook
```http
POST /api/v1/webhooks
```

#### Webhook Events
- `project.created`
- `project.updated`
- `issue.created`
- `issue.status_changed`
- `document.published`
- `content.generated`

---

## Rate Limiting

### Current Limits (MVP)
- **No Rate Limiting**: Local-only access

### Future Limits
- **General API**: 1000 requests/hour
- **AI Endpoints**: 100 requests/hour
- **Search**: 500 requests/hour

## Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## API Versioning Strategy

- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Backward Compatibility**: v1 supported for 12 months after v2 release
- **Deprecation Warnings**: Headers indicate deprecated endpoints
- **Migration Guides**: Documentation for version upgrades