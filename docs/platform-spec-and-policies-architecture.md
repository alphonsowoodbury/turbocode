# Platform Specification & Policies Architecture

## Executive Summary

This document outlines the architectural approach for managing **system-wide design specifications** and **enforcement policies** in Turbo, clarifying the relationship between Blueprints, Initiatives, Policies, and Documents.

**Key Insight:** We don't need a separate "Blueprint" entity. The existing Initiative and Document models already handle feature planning. What we need is:

1. **Platform Specification** - System-wide design document (special document type)
2. **Policies** - Structured enforcement rules (new entity with queryable data)
3. **Better Initiative Workflow** - Improved UX for initiative → documents → milestones → issues

---

## Mental Model: Information Architecture Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION: Turbo                                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ PLATFORM SPECIFICATION (System-wide)                      │ │
│  │ doc_type: "platform_spec"                                 │ │
│  │                                                           │ │
│  │ - Architecture Overview                                   │ │
│  │ - Tech Stack Decisions                                    │ │
│  │ - Design System (Anthropic theme, etc)                    │ │
│  │ - Data Model                                              │ │
│  │ - Security Model                                          │ │
│  │ - References to all active Policies                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ POLICIES (Enforcement Rules - Structured Data)            │ │
│  │                                                           │ │
│  │ Policy: Security Policy                                   │ │
│  │   - no_secrets_in_code: true                              │ │
│  │   - password_hashing: "bcrypt"                            │ │
│  │   - session_storage: "httponly_cookies"                   │ │
│  │                                                           │ │
│  │ Policy: Code Standards                                    │ │
│  │   - no_emoji: true                                        │ │
│  │   - formatters: {"python": "black", "ts": "prettier"}     │ │
│  │   - max_line_length: 100                                  │ │
│  │                                                           │ │
│  │ Policy: Dependencies                                      │ │
│  │   - approved: ["react", "fastapi", "tailwind"]            │ │
│  │   - rejected: ["lodash", "moment"]                        │ │
│  │   - require_approval: true                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ INITIATIVES (Features to Build)                           │ │
│  │                                                           │ │
│  │ Initiative: "User Authentication"                         │ │
│  │   ├── Documents:                                          │ │
│  │   │   ├── ADR-001: "OAuth2 vs JWT" (doc_type: adr)        │ │
│  │   │   ├── "Auth Flow Diagrams" (doc_type: design)         │ │
│  │   │   └── "Auth L2 Architecture" (doc_type: design)       │ │
│  │   │                                                        │ │
│  │   ├── Milestones:                                         │ │
│  │   │   ├── M1: "Basic Auth MVP"                            │ │
│  │   │   │   └── Issues: [#1, #2, #3]                        │ │
│  │   │   └── M2: "2FA Support"                               │ │
│  │   │       └── Issues: [#4, #5]                            │ │
│  │   │                                                        │ │
│  │   └── All Issues tagged with initiative_id                │ │
│  │                                                           │ │
│  │ Initiative: "Real-time Collaboration"                     │ │
│  │   ├── Documents: [ADRs, design docs, L2 diagrams]         │ │
│  │   ├── Milestones: [phases]                                │ │
│  │   └── Issues: [implementation tasks]                      │ │
│  │                                                           │ │
│  │ Initiative: "Anthropic Theme"                             │ │
│  │   ├── Documents: ["Theme Implementation Guide"]           │ │
│  │   ├── Milestones: ["Phase 1", "Phase 2", ...]            │ │
│  │   └── Issues: [component updates, animations, etc]        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Terminology Clarification

### What We're NOT Building

❌ **"Blueprints" as a separate entity** - Too vague, overlaps with existing concepts

### What We ARE Building

✅ **Platform Specification** - System-wide design document (special doc type)
✅ **Policies** - Structured, queryable enforcement rules (new entity)
✅ **Better Initiative UX** - Improved workflow for feature planning
✅ **AI-assisted Issue Generation** - Break down initiatives into issues

---

## Component 1: Platform Specification

### Purpose
The **master design document** for the entire Turbo application. This is the "source of truth" that encompasses all system-wide decisions.

### Implementation
**NOT a new entity** - Just a special document type with elevated importance.

```python
# Platform Spec is just a Document with special type
platform_spec = Document(
    title="Turbo Platform Specification",
    doc_type="platform_spec",  # Special type
    content="""
# Turbo Platform Specification

## System Overview
Turbo is an AI-powered project management platform...

## Architecture
- Frontend: Next.js 14 with React Server Components
- Backend: FastAPI with async SQLAlchemy
- Database: PostgreSQL + Neo4j knowledge graph
- AI: Claude Sonnet 4 via Anthropic API

## Policies
See active policies for enforcement rules:
- Security Policy (ID: xxx)
- Code Standards Policy (ID: xxx)
- Dependencies Policy (ID: xxx)

## Design System
- Base: Tailwind CSS v4
- Theme: Anthropic-inspired (see /docs/anthropic-theme-implementation.md)
- Components: shadcn/ui
- Typography: Fira Code

## Data Model
[Complete ERD and schema documentation]

## Security Model
[Authentication, authorization, data protection]

## API Design
[REST API patterns, GraphQL schema if applicable]
    """,
    project_id=None,  # Application-wide, not project-specific
    version="1.0",
    is_pinned=True,  # Always visible in UI
    metadata={
        "is_platform_spec": True,
        "policy_refs": ["security-policy-id", "code-standards-id"],
        "last_reviewed": "2025-10-21"
    }
)
```

### UI Treatment

**Pinned at top of Documents page:**
```
┌─────────────────────────────────────────────────────┐
│ 📘 PLATFORM SPECIFICATION                           │
│                                                     │
│ Turbo Platform Specification v1.0                  │
│ Last updated: Oct 21, 2025                          │
│                                                     │
│ [View Spec] [Edit] [Version History]               │
│                                                     │
│ Quick Links:                                        │
│ • Architecture Overview                             │
│ • Active Policies (3)                               │
│ • Tech Stack                                        │
│ • Design System                                     │
└─────────────────────────────────────────────────────┘
```

### Document Type Enum Update

```python
# turbo/core/schemas/document.py

class DocumentType(str, Enum):
    """Document types."""
    PLATFORM_SPEC = "platform_spec"  # NEW: System-wide specification
    SPECIFICATION = "specification"
    USER_GUIDE = "user_guide"
    API_DOC = "api_doc"
    README = "readme"
    CHANGELOG = "changelog"
    REQUIREMENTS = "requirements"
    DESIGN = "design"
    ADR = "adr"  # Architecture Decision Record
    OTHER = "other"
```

---

## Component 2: Policies (Structured Enforcement Rules)

### Purpose
**Queryable, structured enforcement rules** that AI agents MUST follow. Not just freeform text, but structured data that can be:
- Automatically included in AI prompts
- Validated programmatically
- Versioned and tracked
- Inherited hierarchically (workspace → project → issue)

### Schema Design

```python
# turbo/core/models/policy.py

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from turbo.core.database.base import Base

class Policy(Base):
    """Enforcement policy for AI agents and code quality."""

    __tablename__ = "policies"

    # Identity
    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: str = Column(String(100), nullable=False, index=True)
    description: str = Column(String, nullable=False)

    # Scope (hierarchical inheritance)
    workspace: str | None = Column(String(50), nullable=True, index=True)
    project_id: UUID | None = Column(PG_UUID(as_uuid=True), nullable=True, index=True)

    # Policy Rules (Structured JSON)
    rules: dict = Column(JSON, nullable=False)
    # Example structure:
    # {
    #   "security": {
    #     "no_secrets_in_code": true,
    #     "no_eval": true,
    #     "password_hashing": "bcrypt",
    #     "session_storage": "httponly_cookies",
    #     "mfa_required": true
    #   },
    #   "code_standards": {
    #     "no_emoji": true,
    #     "formatters": {
    #       "python": "black",
    #       "typescript": "prettier",
    #       "rust": "rustfmt"
    #     },
    #     "linters": {
    #       "python": "ruff",
    #       "typescript": "eslint"
    #     },
    #     "max_line_length": 100,
    #     "require_type_hints": true
    #   },
    #   "dependencies": {
    #     "approved": ["react", "next", "fastapi", "sqlalchemy"],
    #     "rejected": ["lodash", "moment", "jquery"],
    #     "require_approval_for_new": true
    #   },
    #   "testing": {
    #     "min_coverage": 80,
    #     "require_unit_tests": true,
    #     "require_integration_tests": true
    #   },
    #   "accessibility": {
    #     "wcag_level": "AA",
    #     "require_aria_labels": true,
    #     "require_alt_text": true
    #   }
    # }

    # Enforcement Level
    enforcement_level: str = Column(
        String(20),
        nullable=False,
        default="strict"
    )  # "strict" | "warning" | "disabled"

    auto_reject_violations: bool = Column(Boolean, default=True)
    # If true, code violating this policy is auto-rejected

    # Metadata
    created_by: str = Column(String(255), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: datetime = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    version: str = Column(String(20), default="1.0")
    is_active: bool = Column(Boolean, default=True, index=True)

    # Audit trail
    change_log: list = Column(JSON, default=list)
    # [{
    #   "timestamp": "2025-10-21T10:30:00Z",
    #   "changed_by": "user@example.com",
    #   "changes": {"rules.security.mfa_required": {"old": false, "new": true}},
    #   "reason": "Security audit recommendation"
    # }]
```

### Pydantic Schemas

```python
# turbo/core/schemas/policy.py

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class SecurityRules(BaseModel):
    """Security policy rules."""
    no_secrets_in_code: bool = True
    no_eval: bool = True
    password_hashing: str = "bcrypt"
    session_storage: str = "httponly_cookies"
    mfa_required: bool = False

class CodeStandardsRules(BaseModel):
    """Code standards policy rules."""
    no_emoji: bool = True
    formatters: dict[str, str] = {"python": "black", "typescript": "prettier"}
    linters: dict[str, str] = {"python": "ruff", "typescript": "eslint"}
    max_line_length: int = 100
    require_type_hints: bool = True

class DependencyRules(BaseModel):
    """Dependency management rules."""
    approved: list[str] = []
    rejected: list[str] = []
    require_approval_for_new: bool = True

class PolicyRules(BaseModel):
    """Complete policy rules structure."""
    security: SecurityRules | None = None
    code_standards: CodeStandardsRules | None = None
    dependencies: DependencyRules | None = None
    testing: dict | None = None
    accessibility: dict | None = None

class PolicyCreate(BaseModel):
    """Schema for creating a policy."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    workspace: str | None = None
    project_id: UUID | None = None
    rules: PolicyRules
    enforcement_level: str = "strict"
    auto_reject_violations: bool = True

class PolicyUpdate(BaseModel):
    """Schema for updating a policy."""
    name: str | None = None
    description: str | None = None
    rules: PolicyRules | None = None
    enforcement_level: str | None = None
    auto_reject_violations: bool | None = None
    is_active: bool | None = None

class PolicyResponse(BaseModel):
    """Schema for policy API responses."""
    id: UUID
    name: str
    description: str
    workspace: str | None
    project_id: UUID | None
    rules: PolicyRules
    enforcement_level: str
    auto_reject_violations: bool
    created_by: str | None
    created_at: datetime
    updated_at: datetime
    version: str
    is_active: bool

    model_config = {"from_attributes": True}
```

### How Policies Are Used in AI Prompts

```python
# turbo/core/services/ai_prompt_builder.py

async def build_agent_prompt(
    issue: Issue,
    agent_type: str = "code_agent"
) -> str:
    """Build system prompt with policies included."""

    # Get all active policies for this issue's scope
    policies = await get_active_policies(
        workspace=issue.workspace,
        project_id=issue.project_id
    )

    # Format policies for prompt
    policy_section = format_policies_for_prompt(policies)

    prompt = f"""
You are a {agent_type} working on Issue #{issue.id}: "{issue.title}"

Project: {issue.project.name}
Description: {issue.description}

{policy_section}

ACCEPTANCE CRITERIA:
{format_acceptance_criteria(issue.acceptance_criteria)}

INSTRUCTIONS:
1. Read the issue description and acceptance criteria carefully
2. Follow ALL policies strictly - violations will result in rejection
3. If a policy conflicts with the task, ask the user for clarification
4. Implement the solution following best practices

Begin your work:
"""

    return prompt

def format_policies_for_prompt(policies: list[Policy]) -> str:
    """Format policies into prompt-friendly text."""
    if not policies:
        return ""

    sections = ["=" * 60, "ENFORCEMENT POLICIES (YOU MUST FOLLOW THESE)", "=" * 60, ""]

    for policy in policies:
        sections.append(f"## {policy.name}")
        sections.append(f"Enforcement: {policy.enforcement_level.upper()}")
        sections.append("")

        # Security rules
        if security := policy.rules.get("security"):
            sections.append("**Security:**")
            if security.get("no_secrets_in_code"):
                sections.append("- NEVER commit API keys, secrets, or credentials to code")
            if security.get("no_eval"):
                sections.append("- NEVER use eval() or exec() functions")
            if pwd_hash := security.get("password_hashing"):
                sections.append(f"- Use {pwd_hash} for password hashing (no MD5, SHA1, etc)")
            sections.append("")

        # Code standards
        if standards := policy.rules.get("code_standards"):
            sections.append("**Code Standards:**")
            if standards.get("no_emoji"):
                sections.append("- NO emoji in code, comments, or commit messages")
            if formatters := standards.get("formatters"):
                for lang, tool in formatters.items():
                    sections.append(f"- Format {lang} code with {tool}")
            if max_len := standards.get("max_line_length"):
                sections.append(f"- Maximum line length: {max_len} characters")
            sections.append("")

        # Dependencies
        if deps := policy.rules.get("dependencies"):
            sections.append("**Dependencies:**")
            if approved := deps.get("approved"):
                sections.append(f"- APPROVED packages: {', '.join(approved)}")
            if rejected := deps.get("rejected"):
                sections.append(f"- REJECTED packages: {', '.join(rejected)} (DO NOT USE)")
            if deps.get("require_approval_for_new"):
                sections.append("- For any package not in approved list: ASK USER FOR APPROVAL FIRST")
            sections.append("")

        sections.append("-" * 60)
        sections.append("")

    sections.append("VIOLATIONS OF THESE POLICIES WILL RESULT IN CODE REJECTION.")
    sections.append("=" * 60)
    sections.append("")

    return "\n".join(sections)
```

### Policy Inheritance

Policies inherit hierarchically:

```
Workspace Policy (applies to ALL projects in workspace)
    ↓ (inherited)
Project Policy (applies to all issues in project)
    ↓ (inherited)
Issue (follows all parent policies)
```

**Conflict Resolution:**
- More specific policies override general ones
- Project policy overrides workspace policy
- If both define the same rule, most specific wins

```python
async def get_active_policies(
    workspace: str | None = None,
    project_id: UUID | None = None
) -> list[Policy]:
    """Get all active policies for a scope (with inheritance)."""

    policies = []

    # 1. Workspace-level policies (most general)
    if workspace:
        workspace_policies = await db.execute(
            select(Policy).where(
                Policy.workspace == workspace,
                Policy.project_id.is_(None),
                Policy.is_active == True
            )
        )
        policies.extend(workspace_policies.scalars().all())

    # 2. Project-level policies (more specific)
    if project_id:
        project_policies = await db.execute(
            select(Policy).where(
                Policy.project_id == project_id,
                Policy.is_active == True
            )
        )
        policies.extend(project_policies.scalars().all())

    # 3. Merge and deduplicate (project policies override workspace)
    return merge_policies(policies)
```

---

## Component 3: Initiative → Document → Milestone → Issue Workflow

### Current State (Already Exists!)

Your existing schema already supports this:

```python
# Initiatives can have documents
class Document(Base):
    initiative_id: UUID | None  # ✅ Already exists!

# Initiatives can have milestones
class Milestone(Base):
    # Note: Currently milestones only link to projects
    # May need to add initiative_id

# Issues can link to initiatives
class Issue(Base):
    initiative_ids: list[UUID]  # ✅ Via initiative_issues table
```

### What Needs Improvement

**Better UX for the flow:**

```
1. Create Initiative
   ↓
2. Attach Documents (ADRs, design docs, L2 diagrams)
   ↓
3. Define Milestones
   ↓
4. Generate Issues (AI-assisted or manual)
   ↓
5. Prioritize in Work Queue
```

### UI Design: Initiative Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Initiative: User Authentication                                 │
│ Status: In Progress | Priority: High                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ## Description                                                  │
│ Implement secure user authentication with email/password       │
│ and 2FA support.                                                │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 Documents (3)                                            │ │
│ │                                                             │ │
│ │ [ADR-001] OAuth2 vs JWT Decision                            │ │
│ │ [Design] Auth Flow Diagrams                                 │ │
│ │ [L2] Auth System Architecture                               │ │
│ │                                                             │ │
│ │ [+ Attach Document] [+ Create New ADR] [+ Create Design Doc]│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Milestones (2)                                           │ │
│ │                                                             │ │
│ │ ✓ M1: Basic Auth MVP (Completed)                            │ │
│ │   Due: Nov 1, 2025 | Issues: 3/3 complete                   │ │
│ │                                                             │ │
│ │ ○ M2: 2FA Support (In Progress)                             │ │
│ │   Due: Nov 15, 2025 | Issues: 1/5 complete                  │ │
│ │                                                             │ │
│ │ [+ Create Milestone]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✅ Issues (8)                                               │ │
│ │                                                             │ │
│ │ [#101] Create user database schema (Completed)              │ │
│ │ [#102] Implement password hashing (Completed)               │ │
│ │ [#103] Build login endpoint (Completed)                     │ │
│ │ [#104] Add 2FA TOTP generation (In Progress)                │ │
│ │ [#105] Build 2FA verification (Open)                        │ │
│ │ ... 3 more                                                  │ │
│ │                                                             │ │
│ │ [+ Create Issue] [🤖 AI: Generate Issues from Documents]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ## Actions                                                      │
│ [Edit Initiative] [Archive] [Export Report]                    │
└─────────────────────────────────────────────────────────────────┘
```

### AI-Assisted Issue Generation

**Button:** "🤖 AI: Generate Issues from Documents"

**Flow:**
1. User clicks button
2. System gathers all documents attached to initiative
3. Sends to AI (Engineering Manager persona):
   ```
   You are the Engineering Manager. Analyze these documents for the
   "User Authentication" initiative and generate implementation issues.

   Documents:
   - ADR-001: OAuth2 vs JWT Decision
   - Design: Auth Flow Diagrams
   - L2: Auth System Architecture

   [Full document content...]

   Generate a list of implementation issues with:
   - Title
   - Description
   - Type (bug/feature/task)
   - Complexity estimate
   - Acceptance criteria
   - Dependencies (which issues must complete first)

   Return JSON array of issues.
   ```

4. AI returns structured issue data
5. System shows preview:
   ```
   ┌─────────────────────────────────────────────────────┐
   │ AI Generated Issues (Draft - Review Required)       │
   │                                                     │
   │ ✓ Issue: Create user database schema               │
   │   Type: task | Complexity: simple                   │
   │   [Edit] [Approve] [Delete]                         │
   │                                                     │
   │ ✓ Issue: Implement password hashing                │
   │   Type: task | Complexity: simple                   │
   │   Depends on: Create user database schema           │
   │   [Edit] [Approve] [Delete]                         │
   │                                                     │
   │ ... 6 more issues ...                               │
   │                                                     │
   │ [Approve All (8)] [Edit All] [Regenerate]           │
   └─────────────────────────────────────────────────────┘
   ```

6. User reviews/edits/approves
7. Issues created and linked to initiative

---

## Component 4: Policy Management Tools

### API Endpoints

```python
# turbo/api/v1/endpoints/policies.py

from fastapi import APIRouter, Depends
from turbo.core.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.post("/", response_model=PolicyResponse)
async def create_policy(
    policy: PolicyCreate,
    service: PolicyService = Depends()
):
    """Create a new policy."""
    return await service.create_policy(policy)

@router.get("/", response_model=list[PolicyResponse])
async def list_policies(
    workspace: str | None = None,
    project_id: UUID | None = None,
    is_active: bool = True,
    service: PolicyService = Depends()
):
    """List policies with optional filtering."""
    return await service.list_policies(
        workspace=workspace,
        project_id=project_id,
        is_active=is_active
    )

@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: UUID,
    service: PolicyService = Depends()
):
    """Get a specific policy."""
    return await service.get_policy(policy_id)

@router.put("/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: UUID,
    policy: PolicyUpdate,
    service: PolicyService = Depends()
):
    """Update a policy."""
    return await service.update_policy(policy_id, policy)

@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: UUID,
    service: PolicyService = Depends()
):
    """Delete a policy."""
    await service.delete_policy(policy_id)
    return {"status": "deleted"}

@router.get("/active", response_model=list[PolicyResponse])
async def get_active_policies_for_scope(
    workspace: str | None = None,
    project_id: UUID | None = None,
    service: PolicyService = Depends()
):
    """Get all active policies for a scope (with inheritance)."""
    return await service.get_active_policies(
        workspace=workspace,
        project_id=project_id
    )
```

### MCP Tools (for AI Staff)

```python
# Engineering Manager gets these tools
"policy_management": [
    "list_policies",
    "get_policy",
    "create_policy",
    "update_policy",
    "activate_policy",
    "deactivate_policy"
]
```

---

## Implementation Roadmap

### Phase 1: Policies (Week 1-2)
- [ ] Create `Policy` model and migrations
- [ ] Create Pydantic schemas
- [ ] Implement `PolicyService`
- [ ] Create API endpoints
- [ ] Add MCP tools for Engineering Manager
- [ ] Build policy management UI
- [ ] Test policy inheritance logic

### Phase 2: Platform Specification (Week 2)
- [ ] Add `platform_spec` to DocumentType enum
- [ ] Create initial platform spec document
- [ ] Add "pinned" feature to documents UI
- [ ] Create quick links in UI
- [ ] Link platform spec to active policies

### Phase 3: AI Prompt Integration (Week 2-3)
- [ ] Create `ai_prompt_builder.py` service
- [ ] Implement `format_policies_for_prompt()`
- [ ] Integrate policies into all AI agent prompts
- [ ] Test policy enforcement
- [ ] Add policy violation detection

### Phase 4: Initiative Workflow Improvements (Week 3-4)
- [ ] Improve initiative detail page UI
- [ ] Add "attach document" flow
- [ ] Add "create ADR" shortcut
- [ ] Add "create design doc" shortcut
- [ ] Implement AI issue generation
- [ ] Add issue preview/approval flow

### Phase 5: Testing & Documentation (Week 4)
- [ ] Write comprehensive tests
- [ ] Create user documentation
- [ ] Create Engineering Manager training
- [ ] Performance testing
- [ ] Security audit

---

## Database Migrations

### Migration 1: Create Policies Table

```sql
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    -- Scope
    workspace VARCHAR(50),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Policy rules (JSONB for queryability)
    rules JSONB NOT NULL,

    -- Enforcement
    enforcement_level VARCHAR(20) NOT NULL DEFAULT 'strict',
    auto_reject_violations BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit
    change_log JSONB DEFAULT '[]'::jsonb
);

-- Indexes
CREATE INDEX idx_policies_workspace ON policies(workspace);
CREATE INDEX idx_policies_project_id ON policies(project_id);
CREATE INDEX idx_policies_is_active ON policies(is_active);
CREATE INDEX idx_policies_rules ON policies USING GIN (rules);
```

### Migration 2: Add Platform Spec Support

```sql
-- Add platform_spec to document type enum
ALTER TYPE document_type ADD VALUE 'platform_spec';

-- Add is_pinned to documents
ALTER TABLE documents ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_documents_pinned ON documents(is_pinned) WHERE is_pinned = TRUE;
```

### Migration 3: Link Milestones to Initiatives (if needed)

```sql
-- Check if initiative_id exists on milestones
-- If not, add it:
ALTER TABLE milestones ADD COLUMN initiative_id UUID REFERENCES initiatives(id);
CREATE INDEX idx_milestones_initiative_id ON milestones(initiative_id);
```

---

## Example: Complete Workflow

### Step 1: Engineering Manager Creates Platform Spec

```markdown
# Turbo Platform Specification

## Architecture
- Microservices: API, Webhook, Docs Watcher
- Database: PostgreSQL + Neo4j
- AI: Claude Sonnet 4 via Anthropic API

## Policies
Active policies govern all development:
- Security Policy (enforces no secrets, bcrypt, etc)
- Code Standards (no emoji, Black formatting, etc)
- Dependencies (approved package list)

## Tech Stack
Frontend: Next.js 14, React, Tailwind v4, shadcn/ui
Backend: FastAPI, SQLAlchemy 2.0, Neo4j
AI: Anthropic Claude API

## Design System
Based on Anthropic visual language.
See: /docs/anthropic-theme-implementation.md
```

### Step 2: Engineering Manager Creates Policies

**Security Policy:**
```json
{
  "name": "Security Policy",
  "rules": {
    "security": {
      "no_secrets_in_code": true,
      "password_hashing": "bcrypt",
      "session_storage": "httponly_cookies"
    }
  },
  "enforcement_level": "strict",
  "auto_reject_violations": true
}
```

**Code Standards Policy:**
```json
{
  "name": "Code Standards Policy",
  "rules": {
    "code_standards": {
      "no_emoji": true,
      "formatters": {
        "python": "black",
        "typescript": "prettier"
      },
      "max_line_length": 100
    }
  },
  "enforcement_level": "strict"
}
```

### Step 3: Product Manager Creates Initiative

```
Initiative: User Authentication
Description: Secure user login with email/password and 2FA
Status: Planning
Priority: High
```

### Step 4: Engineering Manager Attaches Documents

1. Creates ADR-001: "OAuth2 vs JWT" (doc_type: adr)
2. Creates "Auth Flow Diagrams" (doc_type: design)
3. Creates "Auth L2 Architecture" (doc_type: design)

All linked to initiative.

### Step 5: Engineering Manager Generates Issues (AI-Assisted)

Clicks "🤖 Generate Issues from Documents"

AI analyzes the 3 documents and creates:
- Issue #1: Create user database schema
- Issue #2: Implement password hashing (depends on #1)
- Issue #3: Build login endpoint (depends on #2)
- Issue #4: Add 2FA TOTP generation (depends on #3)
- Issue #5: Build 2FA verification (depends on #4)

EM reviews, edits, approves.

### Step 6: AI Agent Picks Up Issue #2

System prompt includes:
```
ENFORCEMENT POLICIES (YOU MUST FOLLOW THESE):

## Security Policy
Enforcement: STRICT

**Security:**
- NEVER commit API keys, secrets, or credentials to code
- Use bcrypt for password hashing (no MD5, SHA1, etc)

## Code Standards Policy
Enforcement: STRICT

**Code Standards:**
- NO emoji in code, comments, or commit messages
- Format python code with black
- Maximum line length: 100 characters

VIOLATIONS OF THESE POLICIES WILL RESULT IN CODE REJECTION.
```

AI agent:
- ✅ Uses bcrypt (follows policy)
- ✅ Formats with Black (follows policy)
- ✅ No emoji (follows policy)
- ✅ Lines under 100 chars (follows policy)

Code is accepted!

---

## Benefits Summary

### 1. Clear Separation of Concerns
- **Platform Spec** = System design (what the app is)
- **Policies** = Enforcement rules (what AI must follow)
- **Initiatives** = Features to build (what we're working on)
- **Documents** = Supporting knowledge (ADRs, designs, diagrams)

### 2. Structured, Queryable Policies
- Not just freeform text
- Automatically included in AI prompts
- Versioned and auditable
- Hierarchical inheritance

### 3. Better Initiative Workflow
- All related docs in one place
- AI-assisted issue generation
- Clear milestone tracking
- Automatic linking

### 4. AI Safety & Reliability
- Policies prevent common mistakes
- Consistent code quality
- Security enforced automatically
- Standards applied universally

### 5. Institutional Knowledge
- Platform spec is the source of truth
- ADRs document decisions
- Design docs capture approach
- All searchable and linked

---

## Conclusion

By combining:
- **Platform Specification** (system-wide design document)
- **Policies** (structured enforcement rules)
- **Better Initiative UX** (improved feature planning workflow)

We create a comprehensive system where:
1. Engineering Manager sets the rules (policies)
2. Engineering Manager documents the system (platform spec)
3. Product/Engineering Manager plan features (initiatives + docs)
4. AI agents execute work safely (following policies automatically)
5. All knowledge is captured and searchable

**No "Blueprint" entity needed** - we already have all the pieces, just need to wire them together properly! 🎯
