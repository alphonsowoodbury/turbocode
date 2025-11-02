# Comprehensive Issue Creation System for AI-Driven Development

<!--
@staff[1a091af9-3fc8-49a6-83b5-7c55087e45a0] Engineering Manager - please review this comprehensive issue creation proposal.
This document outlines an enhanced system for creating highly detailed issues optimized for AI agent execution.
-->

## Executive Summary

This document outlines a JIRA-style comprehensive issue tracking system optimized for AI agent-driven development. The system enables Engineering Managers to provide detailed requirements, planning context, and execution guidance so AI agents can work autonomously while maintaining visibility and control.

## Core Philosophy

Since AI agents will be writing most of the code, the Engineering Manager needs to provide:

1. **Clear requirements & acceptance criteria** - So AI knows what "done" means
2. **Component/area tagging** - So AI knows where to work
3. **Impact assessment** - So AI understands urgency/importance
4. **Sprint/milestone alignment** - For delivery planning
5. **Dependencies & blockers** - For work sequencing
6. **AI execution hints** - Frameworks, files, security guidance

---

## Proposed Database Schema Additions

### 1. Sprint Model

Time-boxed iterations (typically 2 weeks) for tracking velocity and planning releases.

```python
class Sprint(Base):
    """Sprint model for time-boxed development iterations."""

    __tablename__ = "sprints"

    # Core fields
    name: str  # "Sprint 23", "Oct 21 - Nov 3"
    description: str
    status: str  # planning|active|completed|cancelled
    start_date: datetime
    end_date: datetime
    goal: str  # Sprint goal/theme

    # Optional project association (can be cross-project)
    project_id: UUID | None

    # Metrics
    planned_points: int | None  # If using story points
    completed_points: int | None
    velocity: float | None  # Auto-calculated from completed work

    # Relationships
    project: relationship("Project")
    issues: relationship("Issue", back_populates="sprint")
```

### 2. Component Model

Codebase areas/modules with ownership assignment to AI agents.

```python
class Component(Base):
    """Component model for codebase areas (frontend, backend, API, etc)."""

    __tablename__ = "components"

    # Core fields
    name: str  # "Frontend", "Backend API", "Database Layer", "Auth Service"
    description: str
    color: str  # Hex color for UI visualization

    # Project association
    project_id: UUID

    # AI Agent ownership
    owner_staff_id: UUID | None  # Which AI staff member owns this component

    # Relationships
    project: relationship("Project", back_populates="components")
    issues: relationship("Issue", secondary=issue_components)
    owner: relationship("Staff")
```

### 3. Enhanced Issue Model

Extensive additions to support comprehensive planning and AI execution.

```python
class Issue(Base):
    """Enhanced Issue model for AI-driven development."""

    # === EXISTING FIELDS (unchanged) ===
    title: str
    description: str
    type: str  # bug|feature|task|enhancement|documentation|discovery
    status: str  # open|in_progress|review|testing|closed
    priority: str  # low|medium|high|critical
    assignee: str | None
    due_date: datetime | None
    project_id: UUID | None
    work_rank: int | None

    # === NEW: Estimation & Complexity ===
    complexity: str | None  # trivial|simple|moderate|complex|very_complex
    estimated_hours: float | None  # Time budget for AI agent
    time_spent: float | None  # Actual time tracked by AI
    original_estimate: float | None  # Baseline for learning/improvement
    ai_confidence: float | None  # 0.0-1.0: How confident AI is it can solve this

    # === NEW: Acceptance Criteria (Structured) ===
    # JSON array of criteria with completion tracking
    # [{"text": "User can login", "completed": false, "verified_at": null}]
    acceptance_criteria: list[dict] | None

    # === NEW: Impact & Classification ===
    impact_level: str  # customer_facing|internal_tooling|team_productivity|technical_debt
    is_technical_debt: bool  # Flag for tech debt vs feature work
    customer_value: int  # 0-10 score for customer-facing impact

    # === NEW: Sprint Tracking ===
    sprint_id: UUID | None

    # === NEW: Component Associations ===
    component_ids: list[UUID]  # Many-to-many via issue_components table

    # === NEW: Enhanced Dependencies ===
    related_to: list[UUID]  # General issue relationships (beyond blockers)
    duplicates: UUID | None  # If this issue duplicates another

    # === NEW: Documentation Links ===
    requirements_doc_id: UUID | None  # Link to requirements document
    design_doc_id: UUID | None  # Link to design/RFC document

    # === NEW: AI Agent Context ===
    ai_hints: dict | None  # {
    #   "frameworks": ["react", "fastapi"],
    #   "files_to_check": ["frontend/components/..."],
    #   "test_requirements": "Load test with k6",
    #   "security_concerns": ["validate inputs", "rate limiting"]
    # }
    automation_level: str  # fully_automated|human_review|pair_programming|manual

    # === NEW: Relationships ===
    sprint: relationship("Sprint", back_populates="issues")
    components: relationship("Component", secondary=issue_components)
```

---

## Enhanced create_issue Tool

### Full Tool Signature

```python
async def create_issue_tool(
    # ==================== REQUIRED CORE ====================
    project_id: str,
    title: str,
    description: str,
    type: str = "feature",  # bug|feature|task|enhancement|documentation|discovery
    priority: str = "medium",  # low|medium|high|critical

    # ==================== OPTIONAL: Assignment & Status ====================
    status: str = "open",
    assignee: str | None = None,  # Email or staff ID
    assigned_to_staff_id: str | None = None,  # Specific AI agent assignment

    # ==================== OPTIONAL: Time Management ====================
    due_date: str | None = None,  # ISO format datetime
    milestone_ids: list[str] | None = None,  # Link to product milestones
    initiative_ids: list[str] | None = None,  # Link to strategic initiatives
    sprint_id: str | None = None,  # Assign to specific sprint

    # ==================== OPTIONAL: Estimation ====================
    complexity: str | None = None,  # trivial|simple|moderate|complex|very_complex
    estimated_hours: float | None = None,  # Time budget for AI agent

    # ==================== OPTIONAL: Classification ====================
    impact_level: str = "internal_tooling",  # customer_facing|internal_tooling|team_productivity|technical_debt
    is_technical_debt: bool = False,
    customer_value: int = 5,  # 0-10 scale

    # ==================== OPTIONAL: Components ====================
    component_ids: list[str] | None = None,  # Which codebase areas are affected

    # ==================== OPTIONAL: Acceptance Criteria ====================
    acceptance_criteria: list[str] | None = None,  # List of done conditions

    # ==================== OPTIONAL: Dependencies ====================
    blocked_by_ids: list[str] | None = None,  # Issues that block this one
    related_to_ids: list[str] | None = None,  # Related issues

    # ==================== OPTIONAL: Documentation ====================
    requirements_doc_id: str | None = None,  # Link to requirements doc
    design_doc_id: str | None = None,  # Link to design/RFC doc

    # ==================== OPTIONAL: Tags ====================
    tag_ids: list[str] | None = None,  # Flexible labeling

    # ==================== OPTIONAL: AI Configuration ====================
    automation_level: str = "fully_automated",  # fully_automated|human_review|pair_programming|manual
    ai_hints: dict | None = None,  # Structured guidance for AI agents
) -> dict:
    """
    Comprehensive issue creation for AI-driven development.

    The Engineering Manager provides detailed context so AI agents can:
    1. Understand what needs to be built (acceptance criteria)
    2. Know where to work (components)
    3. Understand importance (impact, customer value)
    4. Plan work (sprint, milestones, estimation)
    5. Execute autonomously (automation level, AI hints)
    """
```

---

## Example: Comprehensive Issue Creation

### Scenario: Real-time Collaboration Feature

The Engineering Manager creates a complex customer-facing feature with full context:

```python
create_issue_tool(
    # ===== CORE DETAILS =====
    project_id="abc-123-def",
    title="Add real-time collaboration to code editor",
    description="""
    Users should be able to see other users editing the same file in real-time,
    similar to Google Docs collaboration. This includes:
    - Cursor positions with name labels
    - Live text updates (< 200ms latency)
    - Selection highlighting
    - Presence indicators

    Technical approach:
    - Use WebSockets for real-time sync
    - Operational Transform (OT) or CRDT for conflict resolution
    - Store session state in Redis with 30s grace period
    - Must work in both VS Code extension and web editor
    """,
    type="feature",
    priority="high",

    # ===== TIME MANAGEMENT =====
    sprint_id="sprint-23-uuid",
    milestone_ids=["v2.0-launch-uuid"],
    initiative_ids=["collaboration-features-uuid"],
    due_date="2025-11-15T00:00:00Z",

    # ===== ESTIMATION =====
    complexity="complex",
    estimated_hours=40.0,  # AI agent time budget

    # ===== CLASSIFICATION =====
    impact_level="customer_facing",
    customer_value=9,  # High customer value (0-10 scale)
    is_technical_debt=False,

    # ===== COMPONENTS =====
    component_ids=[
        "frontend-editor-uuid",
        "backend-websocket-uuid",
        "redis-cache-uuid"
    ],

    # ===== ACCEPTANCE CRITERIA =====
    acceptance_criteria=[
        "Multiple users can edit the same file simultaneously",
        "Users see each other's cursors with name labels",
        "Changes sync in < 200ms on local network",
        "Conflicts are automatically resolved using OT algorithm",
        "User can see who else is editing (presence list)",
        "Session state persists through disconnections (30s grace period)",
        "Works in VS Code extension and web editor",
        "Unit tests cover OT algorithm edge cases",
        "Load tested with 50 concurrent users per file"
    ],

    # ===== DEPENDENCIES =====
    blocked_by_ids=["websocket-infrastructure-setup-uuid"],
    related_to_ids=[
        "user-presence-system-uuid",
        "session-management-uuid"
    ],

    # ===== DOCUMENTATION =====
    design_doc_id="collab-design-rfc-042-uuid",

    # ===== TAGS =====
    tag_ids=[
        "collaboration-tag-uuid",
        "real-time-tag-uuid",
        "v2.0-tag-uuid"
    ],

    # ===== AI AGENT CONFIGURATION =====
    automation_level="human_review",  # AI builds, human reviews before merge
    ai_hints={
        "frameworks": ["socket.io", "yjs", "redis"],
        "files_to_check": [
            "frontend/components/editor/CodeEditor.tsx",
            "backend/websocket/collaboration.py",
            "backend/redis/session_manager.py"
        ],
        "test_requirements": "Load test with websocket-bench",
        "security_concerns": [
            "Validate all user inputs before broadcasting",
            "Rate limit WebSocket connections per user",
            "Sanitize cursor position data"
        ]
    }
)
```

---

## Why This Works for AI-Driven Development

### 1. **Acceptance Criteria → AI knows "done"**
- Structured checklist of requirements
- AI can verify each criterion before marking complete
- Clear definition of done prevents scope creep

### 2. **Components → AI knows where to work**
- Tagged to specific codebase areas
- AI can scope file changes upfront
- Component ownership routes to specialized agents

### 3. **AI Hints → Upfront guidance**
- Framework suggestions save exploration time
- File paths provide starting points
- Security concerns prevent common mistakes

### 4. **Automation Level → Human-in-loop control**
- `fully_automated`: AI implements and merges autonomously
- `human_review`: AI implements, human reviews before merge
- `pair_programming`: AI and human collaborate in real-time
- `manual`: Issue tracked but human implements

### 5. **Estimated Hours → Budget management**
- AI agents can self-limit compute time
- Tracks actual vs estimated for learning
- Identifies issues where AI struggles (low confidence)

### 6. **Complexity → Task decomposition**
- `very_complex` issues trigger automatic subtask creation
- AI can request EM approval before breaking down
- Prevents AI from getting stuck on mega-tasks

### 7. **Impact Level → Prioritization**
- `customer_facing`: High priority, extra testing required
- `technical_debt`: Can be deferred, track accumulation
- `team_productivity`: Internal tooling improvements

### 8. **Dependencies → Work sequencing**
- AI respects blockers before starting work
- Auto-queues issues when blockers complete
- Prevents wasted effort on premature work

### 9. **Sprint Tracking → Velocity measurement**
- Measure AI agent performance over time
- Identify which agents excel at which work types
- Adjust estimates based on historical velocity

---

## Additional Tools Required

### Sprint Management

```python
# Create a new sprint
create_sprint(
    name="Sprint 24",
    description="Focus on performance optimizations",
    start_date="2025-11-04",
    end_date="2025-11-17",
    goal="Reduce p95 latency by 30%",
    project_id="abc-123"
)

# List sprints
list_sprints(status="active", project_id="abc-123")

# Get sprint metrics
get_sprint_velocity(sprint_id="sprint-23")
get_sprint_burndown(sprint_id="sprint-23")

# Move issue to different sprint
update_issue(issue_id="issue-123", sprint_id="sprint-24")
```

### Component Management

```python
# Create component
create_component(
    name="Frontend - React Components",
    description="All React UI components and pages",
    color="#3b82f6",
    project_id="abc-123",
    owner_staff_id="frontend-agent-uuid"
)

# List components
list_components(project_id="abc-123")

# Assign component owner
assign_component_owner(
    component_id="frontend-component-uuid",
    staff_id="specialized-frontend-agent-uuid"
)

# Get component health metrics
get_component_health(component_id="frontend-component-uuid")
# Returns: {
#   "open_issues": 12,
#   "technical_debt_issues": 3,
#   "avg_completion_time": 18.5,
#   "owner": "Frontend AI Agent"
# }
```

### Enhanced Issue Management

```python
# Update acceptance criteria (mark individual criterion as done)
update_acceptance_criteria(
    issue_id="issue-123",
    criterion_index=0,
    completed=True,
    verified_at="2025-10-21T14:30:00Z"
)

# Log time spent by AI agent
log_time_spent(
    issue_id="issue-123",
    hours=4.5,
    notes="Implemented OT algorithm, struggling with edge cases"
)

# AI reports confidence level
assess_ai_confidence(
    issue_id="issue-123",
    confidence=0.6,
    blockers=["Need example of production OT implementation"]
)

# Get AI agent performance
get_ai_agent_performance(staff_id="backend-agent-uuid")
# Returns: {
#   "completed_issues": 45,
#   "avg_time_per_issue": 6.2,
#   "accuracy_rate": 0.89,
#   "specializations": ["API", "Database", "Backend"]
# }
```

---

## Metrics & Reporting

### Sprint Reports

```python
get_sprint_report(sprint_id="sprint-23")
# Returns:
# {
#   "name": "Sprint 23",
#   "status": "completed",
#   "velocity": 42,  # Points completed
#   "completion_rate": 0.87,  # 87% of planned work done
#   "avg_cycle_time": 3.2,  # Days from start to done
#   "issues_completed": 15,
#   "issues_carried_over": 2,
#   "technical_debt_ratio": 0.18  # 18% of sprint was tech debt
# }
```

### Component Health Dashboard

```python
get_component_health_dashboard(project_id="abc-123")
# Returns health metrics for all components:
# [
#   {
#     "component": "Frontend",
#     "open_issues": 8,
#     "technical_debt_percentage": 25,
#     "avg_resolution_time": 5.2,
#     "owner": "Frontend AI Agent",
#     "health_score": 0.78
#   },
#   ...
# ]
```

### AI Agent Performance

```python
get_ai_agent_leaderboard()
# Returns:
# [
#   {
#     "agent": "Backend Specialist",
#     "issues_completed": 67,
#     "avg_completion_time": 4.1,
#     "success_rate": 0.94,
#     "specialties": ["API", "Database"],
#     "velocity_trend": "improving"
#   },
#   ...
# ]
```

---

## Implementation Phases

### Phase 1: Core Schema (Week 1-2)
1. Add Sprint model and migrations
2. Add Component model and migrations
3. Enhance Issue model with new fields
4. Create association tables (issue_components, etc)

### Phase 2: API & Services (Week 2-3)
1. Implement Sprint CRUD endpoints
2. Implement Component CRUD endpoints
3. Update Issue service with new fields
4. Add validation for new enums/constraints

### Phase 3: Tool Integration (Week 3-4)
1. Update `create_issue_tool` with all new parameters
2. Add sprint management tools
3. Add component management tools
4. Add acceptance criteria tracking tools

### Phase 4: Metrics & Reporting (Week 4-5)
1. Implement sprint velocity calculation
2. Implement component health scoring
3. Add AI agent performance tracking
4. Build dashboard queries

### Phase 5: UI Updates (Week 5-6)
1. Update frontend issue creation form
2. Add sprint planning board
3. Add component health visualizations
4. Add AI agent performance dashboard

---

## Database Migration Script

```sql
-- Add Sprint table
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'planning',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    goal TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    planned_points INTEGER,
    completed_points INTEGER,
    velocity FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Component table
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    owner_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add issue_components association table
CREATE TABLE issue_components (
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, component_id)
);

-- Enhance Issue table with new columns
ALTER TABLE issues
    ADD COLUMN complexity VARCHAR(20),
    ADD COLUMN estimated_hours FLOAT,
    ADD COLUMN time_spent FLOAT,
    ADD COLUMN original_estimate FLOAT,
    ADD COLUMN ai_confidence FLOAT,
    ADD COLUMN acceptance_criteria JSONB,
    ADD COLUMN impact_level VARCHAR(30) DEFAULT 'internal_tooling',
    ADD COLUMN is_technical_debt BOOLEAN DEFAULT FALSE,
    ADD COLUMN customer_value INTEGER DEFAULT 5,
    ADD COLUMN sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    ADD COLUMN related_to UUID[],
    ADD COLUMN duplicates UUID REFERENCES issues(id) ON DELETE SET NULL,
    ADD COLUMN requirements_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    ADD COLUMN design_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    ADD COLUMN ai_hints JSONB,
    ADD COLUMN automation_level VARCHAR(20) DEFAULT 'fully_automated';

-- Add indexes for new columns
CREATE INDEX idx_issues_sprint_id ON issues(sprint_id);
CREATE INDEX idx_issues_complexity ON issues(complexity);
CREATE INDEX idx_issues_impact_level ON issues(impact_level);
CREATE INDEX idx_issues_is_technical_debt ON issues(is_technical_debt);
CREATE INDEX idx_components_project_id ON components(project_id);
CREATE INDEX idx_components_owner_staff_id ON components(owner_staff_id);
```

---

## Questions for Engineering Manager

1. **Automation Defaults**: Should new issues default to `fully_automated` or `human_review`?

2. **Component Granularity**: How granular should components be? (e.g., "Frontend" vs "Frontend > React Components > Forms")

3. **Sprint Duration**: Standard 2-week sprints, or flexible duration?

4. **Estimation Required**: Should `estimated_hours` be required for all non-trivial issues?

5. **Acceptance Criteria Enforcement**: Should issues be blocked from `in_progress` status without acceptance criteria?

6. **AI Confidence Threshold**: At what confidence level should AI request human help? (e.g., < 0.7 = escalate)

7. **Technical Debt Quotas**: Should sprints have max % of technical debt issues? (e.g., 20% max)

8. **Component Ownership**: Should components always have an owner, or allow unowned components?

---

## Benefits Summary

✅ **For Engineering Managers**
- Comprehensive planning and tracking
- Clear visibility into AI agent progress
- Velocity and performance metrics
- Granular control over automation levels

✅ **For AI Agents**
- Clear requirements via acceptance criteria
- Context-aware execution via components and hints
- Self-service issue assignment via work queue
- Performance feedback via time tracking

✅ **For the Team**
- Transparent work status and dependencies
- Reduced ambiguity in requirements
- Better sprint planning and forecasting
- Data-driven process improvements

---

## Next Steps

1. **Review this document** and provide feedback on scope/approach
2. **Answer questions** in previous section
3. **Prioritize features** - Which Phase should we start with?
4. **Design review** - Schedule sync to finalize schema design
5. **Begin implementation** - Start with Phase 1 (Core Schema)
