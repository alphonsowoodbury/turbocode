---
doc_type: specification
project_name: Turbo Code Platform
title: 'Turbo: Data Models and Database Schema'
version: '1.0'
---

# Turbo: Data Models and Database Schema

**Version:** 1.0
**Date:** September 28, 2025
**Owner:** Engineering Team

---

## Database Schema Overview

Turbo uses SQLite as the primary database with a carefully designed schema that supports project management, content generation, and AI integration workflows.

```sql
-- Core entity relationships
Projects 1:N Issues
Projects 1:N Documents
Projects 1:N ContentAssets
Projects N:M Tags (via ProjectTags)
Issues N:M Tags (via IssueTags)
Documents N:M Tags (via DocumentTags)
Issues 1:N Comments
Documents 1:N Revisions
```

## Core Domain Models

### 1. Project Model

**Purpose**: Central entity representing a product/app idea
**Relationships**: Has many Issues, Documents, ContentAssets, Tags

```python
class Project:
    id: UUID                    # Primary key
    name: str                   # Project name (e.g., "Context")
    description: Optional[str]  # Brief project description
    status: ProjectStatus       # PLANNING, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
    priority: Priority          # LOW, MEDIUM, HIGH, CRITICAL

    # Metadata
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    target_completion: Optional[datetime]

    # Organization
    tags: List[Tag]            # Flexible categorization
    repository_url: Optional[str]  # Git repository link
    documentation_url: Optional[str]

    # AI Context
    context_summary: Optional[str]  # AI-generated project summary
    last_context_update: Optional[datetime]

    # Metrics
    total_issues: int = 0      # Computed field
    completed_issues: int = 0  # Computed field
    completion_percentage: float = 0.0  # Computed field

enum ProjectStatus:
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    ARCHIVED = "archived"
```

### 2. Issue Model

**Purpose**: Tasks, bugs, features, and user stories
**Relationships**: Belongs to Project, has many Comments, has many Tags

```python
class Issue:
    id: UUID                    # Primary key
    project_id: UUID           # Foreign key to Project

    # Core Information
    title: str                 # Issue title
    description: Optional[str] # Detailed description
    issue_type: IssueType     # TASK, BUG, FEATURE, EPIC, USER_STORY
    status: IssueStatus       # BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED
    priority: Priority        # LOW, MEDIUM, HIGH, CRITICAL

    # Work Estimation
    story_points: Optional[int]    # Effort estimation
    estimated_hours: Optional[float]
    actual_hours: Optional[float]

    # Assignment and Tracking
    assignee: Optional[str]    # Who's working on it
    reporter: Optional[str]    # Who created it

    # Dates
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    due_date: Optional[datetime]

    # Dependencies
    blocked_by: List[UUID]     # Other issue IDs that block this
    blocks: List[UUID]         # Issue IDs that this blocks
    parent_issue: Optional[UUID]  # For sub-tasks

    # AI-Generated Content
    acceptance_criteria: Optional[str]  # AI-generated criteria
    technical_notes: Optional[str]      # AI-generated implementation notes
    test_scenarios: Optional[str]       # AI-generated test cases

    # Relationships
    tags: List[Tag]
    comments: List[Comment]

enum IssueType:
    TASK = "task"
    BUG = "bug"
    FEATURE = "feature"
    EPIC = "epic"
    USER_STORY = "user_story"
    RESEARCH = "research"
    DOCUMENTATION = "documentation"

enum IssueStatus:
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    TESTING = "testing"
    DONE = "done"
    CANCELLED = "cancelled"
```

### 3. Document Model

**Purpose**: Technical specs, marketing copy, presentations, notes
**Relationships**: Belongs to Project, has many Revisions, has many Tags

```python
class Document:
    id: UUID                    # Primary key
    project_id: UUID           # Foreign key to Project

    # Core Information
    title: str                 # Document title
    content: str              # Main document content (Markdown)
    document_type: DocumentType  # SPEC, MARKETING, PRESENTATION, NOTE, API_DOC
    status: DocumentStatus    # DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED

    # Metadata
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    # Organization
    category: Optional[str]    # User-defined category
    tags: List[Tag]           # Flexible tagging

    # AI Generation Context
    generated_by_ai: bool = False
    generation_prompt: Optional[str]  # Original AI prompt
    ai_model_used: Optional[str]      # Model version info
    human_edited: bool = False        # Whether human-modified after AI

    # Version Control
    version: str = "1.0"      # Semantic versioning
    revisions: List[DocumentRevision]

    # Output Formats
    export_formats: List[str] = []  # pdf, docx, html, slides
    last_export: Optional[datetime]

    # Quality Metrics
    word_count: int = 0       # Computed field
    reading_time_minutes: int = 0  # Computed field
    completeness_score: float = 0.0  # AI-assessed completeness

enum DocumentType:
    TECHNICAL_SPEC = "technical_spec"
    PRODUCT_SPEC = "product_spec"
    USER_STORY = "user_story"
    MARKETING_COPY = "marketing_copy"
    PRESENTATION = "presentation"
    API_DOCUMENTATION = "api_documentation"
    USER_GUIDE = "user_guide"
    MEETING_NOTES = "meeting_notes"
    RESEARCH = "research"
    GENERAL_NOTE = "general_note"

enum DocumentStatus:
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"
```

### 4. ContentAsset Model

**Purpose**: Generated marketing copy, slide content, social media posts
**Relationships**: Belongs to Project, has many Tags

```python
class ContentAsset:
    id: UUID                    # Primary key
    project_id: UUID           # Foreign key to Project

    # Core Information
    title: str                 # Asset title
    content: str              # Main content
    asset_type: ContentAssetType
    format: ContentFormat     # TEXT, MARKDOWN, HTML, JSON

    # Target Platform/Use
    platform: Optional[str]   # "landing_page", "social_media", "email"
    audience: Optional[str]   # "developers", "end_users", "investors"
    tone: Optional[str]       # "professional", "casual", "technical"

    # Metadata
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

    # AI Generation
    generated_by_ai: bool = False
    generation_prompt: Optional[str]
    ai_model_used: Optional[str]
    generation_context: Optional[str]  # Project context used

    # Performance Tracking
    usage_count: int = 0      # How many times used/referenced
    effectiveness_score: Optional[float]  # User-rated effectiveness

    # Relationships
    tags: List[Tag]

    # Export and Sharing
    export_formats: List[str] = []
    shareable_url: Optional[str]

enum ContentAssetType:
    LANDING_PAGE_COPY = "landing_page_copy"
    PRODUCT_DESCRIPTION = "product_description"
    FEATURE_ANNOUNCEMENT = "feature_announcement"
    SOCIAL_MEDIA_POST = "social_media_post"
    EMAIL_CAMPAIGN = "email_campaign"
    PRESS_RELEASE = "press_release"
    SLIDE_CONTENT = "slide_content"
    BLOG_POST = "blog_post"
    AD_COPY = "ad_copy"
    FAQ_CONTENT = "faq_content"

enum ContentFormat:
    PLAIN_TEXT = "plain_text"
    MARKDOWN = "markdown"
    HTML = "html"
    JSON = "json"
    YAML = "yaml"
```

### 5. Tag Model

**Purpose**: Flexible categorization and organization
**Relationships**: Many-to-many with Projects, Issues, Documents, ContentAssets

```python
class Tag:
    id: UUID                    # Primary key
    name: str                  # Tag name (unique)
    description: Optional[str] # Tag description
    color: Optional[str]       # Hex color for UI
    tag_type: TagType         # CATEGORY, PRIORITY, SKILL, PLATFORM, STATUS

    # Metadata
    created_at: datetime
    usage_count: int = 0      # How many entities use this tag

    # Auto-generated tags
    auto_generated: bool = False  # Created by AI
    confidence_score: Optional[float]  # AI confidence in tag relevance

enum TagType:
    CATEGORY = "category"       # General categorization
    TECHNOLOGY = "technology"   # Tech stack, languages, frameworks
    PLATFORM = "platform"      # iOS, Android, Web, API
    SKILL = "skill"            # Required skills/expertise
    PRIORITY = "priority"       # Business priority
    STATUS = "status"          # Custom status tracking
    CUSTOM = "custom"          # User-defined
```

### 6. Comment Model

**Purpose**: Issue discussions, feedback, progress updates
**Relationships**: Belongs to Issue

```python
class Comment:
    id: UUID                    # Primary key
    issue_id: UUID             # Foreign key to Issue

    # Content
    content: str              # Comment text (Markdown supported)
    comment_type: CommentType # COMMENT, STATUS_CHANGE, ASSIGNMENT, SYSTEM

    # Metadata
    author: Optional[str]     # Comment author
    created_at: datetime
    updated_at: Optional[datetime]

    # System Comments
    system_generated: bool = False
    change_summary: Optional[str]  # For system comments

    # AI-generated
    generated_by_ai: bool = False
    ai_context: Optional[str]     # Context used for AI generation

enum CommentType:
    COMMENT = "comment"
    STATUS_CHANGE = "status_change"
    ASSIGNMENT = "assignment"
    SYSTEM = "system"
    AI_SUGGESTION = "ai_suggestion"
```

### 7. DocumentRevision Model

**Purpose**: Version history for documents
**Relationships**: Belongs to Document

```python
class DocumentRevision:
    id: UUID                    # Primary key
    document_id: UUID          # Foreign key to Document

    # Version Information
    version: str              # Semantic version
    content: str             # Document content at this version
    change_summary: Optional[str]  # What changed

    # Metadata
    created_at: datetime
    created_by: Optional[str] # Author

    # AI Information
    ai_generated: bool = False
    generation_differences: Optional[str]  # What AI changed
```

## Database Indexes and Performance

### Primary Indexes
```sql
-- Performance-critical indexes
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_assignee_status ON issues(assignee, status);
CREATE INDEX idx_documents_project_type ON documents(project_id, document_type);
CREATE INDEX idx_content_assets_project_type ON content_assets(project_id, asset_type);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_comments_issue_created ON comments(issue_id, created_at);

-- Full-text search indexes
CREATE VIRTUAL TABLE issues_fts USING fts5(title, description, content=issues);
CREATE VIRTUAL TABLE documents_fts USING fts5(title, content, content=documents);
CREATE VIRTUAL TABLE content_assets_fts USING fts5(title, content, content=content_assets);
```

### Join Tables
```sql
-- Many-to-many relationship tables
CREATE TABLE project_tags (
    project_id UUID REFERENCES projects(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE issue_tags (
    issue_id UUID REFERENCES issues(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (issue_id, tag_id)
);

CREATE TABLE document_tags (
    document_id UUID REFERENCES documents(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE content_asset_tags (
    content_asset_id UUID REFERENCES content_assets(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (content_asset_id, tag_id)
);

-- Issue dependencies
CREATE TABLE issue_dependencies (
    blocking_issue_id UUID REFERENCES issues(id),
    blocked_issue_id UUID REFERENCES issues(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocking_issue_id, blocked_issue_id)
);
```

## Data Validation Rules

### Business Rules
1. **Projects**: Name must be unique, status transitions must be valid
2. **Issues**: Cannot be completed if blocked by open issues
3. **Documents**: Version numbers must follow semantic versioning
4. **Tags**: Names must be unique within tag_type
5. **Comments**: Cannot be empty, must reference valid issue

### Constraints
```sql
-- Status transition constraints
CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived'))
CHECK (priority IN ('low', 'medium', 'high', 'critical'))
CHECK (story_points >= 0 AND story_points <= 100)
CHECK (estimated_hours >= 0)
CHECK (completion_percentage >= 0.0 AND completion_percentage <= 100.0)
```

## Migration Strategy

### Schema Versioning
- **Alembic**: Handle database migrations
- **Semantic Versioning**: Track schema changes
- **Backward Compatibility**: Support data migration
- **Rollback Support**: Safe schema rollbacks

### Data Migration Patterns
```python
# Example migration for adding new fields
def upgrade():
    op.add_column('issues', sa.Column('ai_generated_criteria', sa.Text(), nullable=True))
    op.add_column('issues', sa.Column('last_ai_update', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('issues', 'last_ai_update')
    op.drop_column('issues', 'ai_generated_criteria')
```

---

## Integration Considerations

### Claude Integration
- **Context Compilation**: Efficiently query related data for AI prompts
- **Batch Updates**: Handle AI-generated content efficiently
- **Change Tracking**: Track AI modifications for user review

### File System Integration
- **Export Formats**: Support multiple output formats
- **Import Capabilities**: Bulk import from existing tools
- **Backup Strategy**: Regular automated backups

### Performance Optimization
- **Query Optimization**: Efficient data retrieval patterns
- **Caching Strategy**: Cache frequently accessed data
- **Lazy Loading**: Load related data on demand
- **Bulk Operations**: Efficient batch processing