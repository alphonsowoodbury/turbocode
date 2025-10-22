# Staff System Epic

**Epic ID**: STAFF-001
**Type**: Feature
**Priority**: Critical
**Status**: Not Started

---

## User Story

**As a** user
**I want** to have Staff (AI domain experts) that I can @ mention and assign work to
**So that** I have a team helping me monitor, refine, and execute on my projects

---

## Background & Context

### The Need

The existing Mentor system provides guidance and leadership for personal development and decision-making. However, there's a distinct need for **execution-focused AI agents** that:

- Monitor specific domains with AAA+++ precision and wisdom
- Direct subagents for specialized tasks
- Create content (articles, reports, research)
- Participate in solo and group discussions
- Have clear assignments and ownership
- Can be directly invoked via @ mentions in any context

### Mentors vs. Staff

| Feature | Mentors | Staff |
|---------|---------|-------|
| Purpose | Guidance & leadership | Execution & monitoring |
| Interaction | Solo conversations | Solo + group discussions |
| Scope | Personal development | Specific domains (security, architecture, etc.) |
| Capabilities | Advice, reflection | Analysis, refinement, content creation, subagent direction |
| Ownership | No entity ownership | Can own/be assigned issues, initiatives, milestones |
| @ Mentions | No | Yes - immediate webhook responses |

### Key Insight: Assignment = Ownership

After exploring complex shared ownership models, we settled on a simpler approach:
- **Assignment IS ownership**
- `assigned_to` determines who can edit the entity
- Leadership roles can edit anything (universal permissions)
- Domain roles can only edit what they're assigned
- Clear visibility of who owns what

---

## Core Features

### 1. Staff Model with Unique Handles

Each Staff member has:
- **Unique Handle**: Used for @ mentions (e.g., `@ChiefOfStaff`, `@SecurityLead`, `@ArchitectureLead`)
- **Name**: Human-readable display name
- **Description**: What they do
- **Persona**: Detailed AI persona for Claude API
- **Role Type**: `leadership` or `domain_expert`
- **Is Leadership Role**: Boolean flag for universal edit permissions
- **Monitoring Scope**: JSON defining what they monitor (e.g., `{"entity_types": ["issue"], "tags": ["security"]}`)
- **Capabilities**: JSON defining what they can do (e.g., `["analysis", "refinement", "content_creation"]`)

### 2. Assignment Model

**Polymorphic Assignment** on entities (Issue, Initiative, Milestone):
```python
assigned_to_type: str  # "user" or "staff"
assigned_to_id: UUID   # References User.id or Staff.id
```

**Permission Logic**:
```python
def can_edit_entity(user_or_staff, entity):
    # User always owns their entities
    if user_or_staff is User:
        return True

    # Assigned staff can edit
    if entity.assigned_to_id == user_or_staff.id:
        return True

    # Leadership roles can edit anything
    if user_or_staff.is_leadership_role:
        return True

    return False
```

**Benefits**:
- Simple, clear ownership model
- Ensures work is granular (one owner = focused scope)
- Leadership can coordinate across all work
- Domain experts stay focused on their assignments

### 3. @ Mention System

**Flow**:
1. User posts comment: `"@SecurityLead can you review the auth implementation?"`
2. `MentionDetector` service parses comment for `@\w+` patterns
3. Matches handle to Staff in database
4. Triggers webhook with:
   - Staff ID, handle, persona
   - Comment context
   - Entity context (project, issue, full details)
   - Monitoring scope for domain awareness
5. Webhook calls Claude API with Staff persona + full context
6. AI responds as that Staff member
7. Response posted as comment via MCP
8. Staff can optionally:
   - Claim assignment to the entity
   - Create action approvals for suggested changes
   - Create review requests for User feedback

**Technical Details**:
- **Detection**: Regex `@(\w+)` in comment content
- **Webhook Endpoint**: `POST /webhook/staff-mention`
- **Response Time**: Target < 30 seconds
- **Context Building**: Include project, related issues, documents, tags
- **Persona Injection**: System message with Staff persona + monitoring scope

### 4. User's Unified Queue ("My Queue")

A single interface showing all work requiring User attention:

**Components**:
1. **Action Approvals**: Staff-suggested actions requiring approval
   - From @ mention conversations
   - From automated monitoring/refinement
   - Grouped by risk level (medium, high, critical)

2. **Assigned Tasks**: Work directly assigned to User
   - Issues assigned for feedback
   - Initiatives assigned for ideation
   - Milestones assigned for review
   - Filtered by status (open, in_progress)

3. **Review Requests**: Formal requests from Staff
   - Scope validation requests (from Agility Lead)
   - Architecture review requests
   - Security review requests
   - Product feedback requests

**API Endpoint**: `GET /api/v1/my-queue`

**Response Structure**:
```json
{
  "action_approvals": [
    {
      "id": "uuid",
      "staff_id": "uuid",
      "staff_name": "Security Lead",
      "action_type": "add_tag",
      "entity_type": "issue",
      "entity_id": "uuid",
      "entity_title": "Implement OAuth",
      "description": "Add 'security-review' tag",
      "risk_level": "medium",
      "created_at": "2025-10-19T10:30:00Z"
    }
  ],
  "assigned_tasks": {
    "issues": [...],
    "initiatives": [...],
    "milestones": [...]
  },
  "review_requests": [
    {
      "id": "uuid",
      "staff_id": "uuid",
      "staff_name": "Agility Lead",
      "request_type": "scope_validation",
      "entity_type": "issue",
      "entity_id": "uuid",
      "description": "This issue seems too broad - should it be split?",
      "status": "pending",
      "created_at": "2025-10-19T09:15:00Z"
    }
  ]
}
```

### 5. Scope Validation

**Agility Lead Monitoring**:
- Continuously monitors all assignments
- Checks for issues/initiatives/milestones that are too broad
- Uses heuristics:
  - Description length
  - Number of distinct concerns
  - Time estimates
  - Dependency count
  - Tag diversity

**Automated Validation**:
- Runs on entity create/update
- Runs on assignment changes
- Runs daily for all active work

**Review Request Creation**:
- When scope issue detected, creates ReviewRequest
- Appears in User's My Queue
- User can:
  - Acknowledge and split the work
  - Dismiss (work is intentionally broad)
  - Discuss with Agility Lead via @ mention

**Example Flow**:
1. User creates issue: "Build authentication system"
2. Agility Lead analyzes (background job)
3. Detects: broad scope (OAuth, session mgmt, password reset, 2FA all mentioned)
4. Creates ReviewRequest: "This issue covers 4+ distinct features. Consider splitting?"
5. Appears in My Queue
6. User: `"@AgilityLead good catch, can you help me split this?"`
7. Agility Lead responds with suggested breakdown
8. Creates action approvals for creating sub-issues

### 6. Extended Refinement System

**Existing**: Issue refinement works well (analyze → review → execute)

**Extend to**:
- **Initiative Refinement**: Same pattern for initiatives
  - Stale status detection
  - Missing description/goals
  - Orphaned initiatives (no issues)
  - Progress vs completion mismatch

- **Milestone Refinement**: Same pattern for milestones
  - Due date validation
  - Issue count vs capacity
  - Blocker identification
  - Completion percentage accuracy

**Staff Integration**:
- Staff automatically run refinement for their monitoring scope
- Chief of Staff runs cross-cutting refinement
- Results appear as action approvals in My Queue

---

## Seeded Leadership Staff (Phase 1)

### 1. Chief of Staff (@ChiefOfStaff)

**Role**: Meta-coordinator and team builder

**Responsibilities**:
- Coordinate between staff members
- Help decide which new staff to add
- Monitor overall project health
- Facilitate group discussions
- Resolve staff conflicts
- Ensure no gaps in coverage

**Monitoring Scope**:
```json
{
  "entity_types": ["project", "initiative", "milestone", "issue"],
  "focus": "cross_cutting",
  "metrics": ["team_velocity", "blocker_count", "coverage_gaps"]
}
```

**Capabilities**:
- Team coordination
- Resource allocation
- Priority alignment
- Staff recruitment recommendations
- Cross-functional analysis

**Persona Highlights**:
- Strategic thinker
- Excellent communicator
- Sees the big picture
- Balances competing priorities
- Builds high-performing teams

### 2. Product Manager (@ProductManager)

**Role**: Product vision and roadmap

**Responsibilities**:
- Product vision and strategy
- Feature prioritization
- Market analysis and research
- Stakeholder alignment
- Roadmap planning
- Success metrics definition

**Monitoring Scope**:
```json
{
  "entity_types": ["initiative", "project"],
  "focus": "product_value",
  "metrics": ["feature_completeness", "user_impact", "market_fit"]
}
```

**Capabilities**:
- Product strategy
- Competitive analysis
- User research synthesis
- Prioritization frameworks
- Roadmap planning
- Metrics definition

**Persona Highlights**:
- User-centric thinking
- Data-driven decisions
- Market awareness
- Strategic planning
- Clear communication

### 3. Agility Lead (@AgilityLead)

**Role**: Process facilitation and scope validation

**Responsibilities**:
- Process facilitation
- **Scope validation** (core responsibility)
- Blocker identification and removal
- Team velocity optimization
- Sprint planning assistance
- Retrospective insights

**Monitoring Scope**:
```json
{
  "entity_types": ["issue", "milestone", "initiative"],
  "focus": "scope_and_process",
  "metrics": ["scope_granularity", "blocker_count", "cycle_time", "wip_limits"]
}
```

**Capabilities**:
- Scope analysis (primary)
- Blocker identification
- Process improvement
- Velocity tracking
- Workflow optimization
- Team health monitoring

**Persona Highlights**:
- Process expert
- Pragmatic problem solver
- Blocker hunter
- **Scope guardian** (ensures work is appropriately granular)
- Team enabler

### 4. Engineering Manager (@EngineeringManager)

**Role**: Technical leadership and capacity planning

**Responsibilities**:
- Team capacity planning
- Technical priorities
- Architecture oversight
- Code quality standards
- Technical debt management
- Engineering excellence

**Monitoring Scope**:
```json
{
  "entity_types": ["issue", "project"],
  "focus": "technical_execution",
  "metrics": ["technical_debt", "code_quality", "architecture_health", "team_capacity"]
}
```

**Capabilities**:
- Capacity planning
- Technical prioritization
- Architecture review
- Code quality oversight
- Technical mentorship
- Engineering standards

**Persona Highlights**:
- Technical excellence
- Team development
- Quality advocate
- Pragmatic architecture
- Sustainable pace

---

## Technical Architecture

### Data Models

#### Staff (`turbo/core/models/staff.py`)

```python
from sqlalchemy import Boolean, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4
from datetime import datetime

class Staff(Base):
    __tablename__ = "staff"

    # Primary
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    handle: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(1000))
    persona: Mapped[str] = mapped_column(String(5000))  # Detailed AI persona

    # Role & Permissions
    role_type: Mapped[str] = mapped_column(String(50))  # leadership | domain_expert
    is_leadership_role: Mapped[bool] = mapped_column(Boolean, default=False)

    # Configuration
    monitoring_scope: Mapped[dict] = mapped_column(JSON)  # What they monitor
    capabilities: Mapped[dict] = mapped_column(JSON)  # What they can do

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversations = relationship("StaffConversation", back_populates="staff", cascade="all, delete-orphan")
    review_requests = relationship("ReviewRequest", back_populates="staff", cascade="all, delete-orphan")
```

#### StaffConversation (`turbo/core/models/staff_conversation.py`)

```python
class StaffConversation(Base):
    __tablename__ = "staff_conversations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    staff_id: Mapped[UUID] = mapped_column(ForeignKey("staff.id", ondelete="CASCADE"))

    # Message
    message_type: Mapped[str] = mapped_column(String(20))  # user | assistant
    content: Mapped[str] = mapped_column(Text)

    # Group Discussion Support
    is_group_discussion: Mapped[bool] = mapped_column(Boolean, default=False)
    group_discussion_id: Mapped[Optional[UUID]] = mapped_column(nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    # Relationships
    staff = relationship("Staff", back_populates="conversations")
```

#### ReviewRequest (`turbo/core/models/review_request.py`)

```python
class ReviewRequest(Base):
    __tablename__ = "review_requests"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    staff_id: Mapped[UUID] = mapped_column(ForeignKey("staff.id", ondelete="CASCADE"))

    # Entity
    entity_type: Mapped[str] = mapped_column(String(50))  # issue | initiative | milestone | project
    entity_id: Mapped[UUID]

    # Request
    request_type: Mapped[str] = mapped_column(String(50))  # scope_validation | feedback | approval
    description: Mapped[str] = mapped_column(Text)

    # Status
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | reviewed | dismissed

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    # Relationships
    staff = relationship("Staff", back_populates="review_requests")
```

#### Entity Assignment Fields

Add to `Issue`, `Initiative`, `Milestone` models:

```python
# Polymorphic assignment
assigned_to_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # user | staff
assigned_to_id: Mapped[Optional[UUID]] = mapped_column(nullable=True)

# Helper property
@property
def assigned_to(self):
    if not self.assigned_to_type or not self.assigned_to_id:
        return None
    if self.assigned_to_type == "user":
        return db.query(User).get(self.assigned_to_id)
    elif self.assigned_to_type == "staff":
        return db.query(Staff).get(self.assigned_to_id)
    return None
```

### Repositories

#### StaffRepository (`turbo/core/repositories/staff.py`)

```python
class StaffRepository(BaseRepository[Staff, StaffCreate, StaffUpdate]):
    def __init__(self, session: AsyncSession):
        super().__init__(Staff, session)

    async def get_by_handle(self, handle: str) -> Optional[Staff]:
        """Get staff by unique handle."""
        result = await self._session.execute(
            select(Staff).where(Staff.handle == handle)
        )
        return result.scalar_one_or_none()

    async def get_leadership_staff(self) -> List[Staff]:
        """Get all leadership roles."""
        result = await self._session.execute(
            select(Staff).where(Staff.is_leadership_role == True, Staff.is_active == True)
        )
        return list(result.scalars().all())

    async def get_by_monitoring_scope(self, entity_type: str, tags: List[str] = None) -> List[Staff]:
        """Get staff that monitor a specific entity type/tags."""
        # JSON query logic here
        pass
```

#### ReviewRequestRepository (`turbo/core/repositories/review_request.py`)

```python
class ReviewRequestRepository(BaseRepository[ReviewRequest, ReviewRequestCreate, ReviewRequestUpdate]):
    def __init__(self, session: AsyncSession):
        super().__init__(ReviewRequest, session)

    async def get_pending_for_user(self) -> List[ReviewRequest]:
        """Get all pending review requests (for My Queue)."""
        result = await self._session.execute(
            select(ReviewRequest).where(ReviewRequest.status == "pending")
            .order_by(ReviewRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_entity(self, entity_type: str, entity_id: UUID) -> List[ReviewRequest]:
        """Get all review requests for an entity."""
        result = await self._session.execute(
            select(ReviewRequest)
            .where(ReviewRequest.entity_type == entity_type, ReviewRequest.entity_id == entity_id)
        )
        return list(result.scalars().all())
```

### Services

#### StaffService (`turbo/core/services/staff_service.py`)

Business logic for Staff operations:
- CRUD operations
- Conversation management
- Permission checks
- Assignment logic

#### MentionDetectorService (`turbo/core/services/mention_detector.py`)

```python
class MentionDetectorService:
    """Detect @ mentions in comments and trigger Staff webhooks."""

    MENTION_PATTERN = r'@(\w+)'

    async def detect_and_process(self, comment: Comment, session: AsyncSession):
        """Detect mentions in comment and trigger webhooks."""
        mentions = re.findall(self.MENTION_PATTERN, comment.content)

        staff_repo = StaffRepository(session)
        for handle in mentions:
            staff = await staff_repo.get_by_handle(handle)
            if staff and staff.is_active:
                await self.trigger_webhook(staff, comment)

    async def trigger_webhook(self, staff: Staff, comment: Comment):
        """Trigger webhook for Staff mention."""
        context = await self.build_context(staff, comment)

        async with httpx.AsyncClient() as client:
            await client.post(
                "http://webhook:9002/staff-mention",
                json={
                    "staff_id": str(staff.id),
                    "staff_handle": staff.handle,
                    "persona": staff.persona,
                    "monitoring_scope": staff.monitoring_scope,
                    "comment_id": str(comment.id),
                    "context": context
                }
            )
```

#### ScopeValidationService (`turbo/core/services/scope_validation.py`)

```python
class ScopeValidationService:
    """Agility Lead's scope validation system."""

    async def validate_issue_scope(self, issue: Issue) -> Optional[str]:
        """Check if issue scope is appropriate. Returns concern if too broad."""
        concerns = []

        # Check description length
        if len(issue.description) > 2000:
            concerns.append("Very long description suggests multiple features")

        # Check for multiple action verbs
        action_verbs = ["implement", "create", "build", "add", "update", "fix", "refactor"]
        verb_count = sum(1 for verb in action_verbs if verb in issue.description.lower())
        if verb_count > 3:
            concerns.append(f"{verb_count} action verbs found - may need splitting")

        # Check dependency count
        blockers = await issue_repo.get_blocking_issues(issue.id)
        if len(blockers) > 5:
            concerns.append(f"{len(blockers)} dependencies - complex scope")

        if concerns:
            return " | ".join(concerns)
        return None

    async def create_review_request_if_needed(self, entity_type: str, entity_id: UUID, agility_lead: Staff):
        """Create review request if scope issues detected."""
        # Implementation
        pass
```

#### InitiativeRefinementService (`turbo/core/services/initiative_refinement.py`)

Extends the pattern from `IssueRefinementService`:
- Analyze initiatives for improvements
- Detect stale initiatives
- Find missing goals/descriptions
- Suggest initiative-level tags

#### MilestoneRefinementService (`turbo/core/services/milestone_refinement.py`)

Extends the pattern from `IssueRefinementService`:
- Analyze milestones for improvements
- Validate due dates
- Check issue assignment to milestones
- Detect completion percentage mismatches

### API Endpoints

#### Staff Endpoints (`turbo/api/v1/endpoints/staff.py`)

```python
@router.post("/", response_model=StaffResponse, status_code=201)
async def create_staff(staff_in: StaffCreate, session: AsyncSession = Depends(get_db_session)):
    """Create new staff member."""
    pass

@router.get("/", response_model=List[StaffResponse])
async def list_staff(
    role_type: Optional[str] = None,
    is_active: bool = True,
    session: AsyncSession = Depends(get_db_session)
):
    """List all staff with optional filters."""
    pass

@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(staff_id: UUID, session: AsyncSession = Depends(get_db_session)):
    """Get staff details."""
    pass

@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(staff_id: UUID, staff_in: StaffUpdate, session: AsyncSession = Depends(get_db_session)):
    """Update staff details."""
    pass

@router.post("/{staff_id}/messages", response_model=MessageResponse)
async def send_message_to_staff(staff_id: UUID, message_in: MessageCreate, session: AsyncSession = Depends(get_db_session)):
    """Send message to staff (1-on-1 chat)."""
    pass

@router.get("/{staff_id}/messages", response_model=List[MessageResponse])
async def get_staff_messages(staff_id: UUID, limit: int = 50, session: AsyncSession = Depends(get_db_session)):
    """Get conversation history with staff."""
    pass
```

#### My Queue Endpoint (`turbo/api/v1/endpoints/my_queue.py`)

```python
@router.get("/", response_model=MyQueueResponse)
async def get_my_queue(session: AsyncSession = Depends(get_db_session)):
    """Get user's unified work queue."""

    # Get action approvals
    approval_repo = ActionApprovalRepository(session)
    approvals = await approval_repo.get_pending()

    # Get assigned tasks
    issue_repo = IssueRepository(session)
    assigned_issues = await issue_repo.get_assigned_to_user()

    initiative_repo = InitiativeRepository(session)
    assigned_initiatives = await initiative_repo.get_assigned_to_user()

    milestone_repo = MilestoneRepository(session)
    assigned_milestones = await milestone_repo.get_assigned_to_user()

    # Get review requests
    review_repo = ReviewRequestRepository(session)
    review_requests = await review_repo.get_pending_for_user()

    return MyQueueResponse(
        action_approvals=approvals,
        assigned_tasks={
            "issues": assigned_issues,
            "initiatives": assigned_initiatives,
            "milestones": assigned_milestones
        },
        review_requests=review_requests
    )
```

### MCP Tools

Add to `turbo/mcp_server.py`:

```python
# Staff management
@mcp.tool()
async def create_staff(name: str, handle: str, description: str, persona: str, role_type: str, is_leadership_role: bool, monitoring_scope: dict, capabilities: dict) -> dict:
    """Create a new staff member."""
    pass

@mcp.tool()
async def list_staff(role_type: str = None, is_active: bool = True) -> list:
    """List all staff members."""
    pass

@mcp.tool()
async def get_staff(staff_id: str) -> dict:
    """Get staff details."""
    pass

@mcp.tool()
async def update_staff(staff_id: str, **updates) -> dict:
    """Update staff details."""
    pass

@mcp.tool()
async def send_staff_message(staff_id: str, content: str) -> dict:
    """Send message to staff (1-on-1 chat)."""
    pass

@mcp.tool()
async def get_staff_messages(staff_id: str, limit: int = 50) -> list:
    """Get conversation history with staff."""
    pass

# Assignment
@mcp.tool()
async def assign_entity(entity_type: str, entity_id: str, assigned_to_type: str, assigned_to_id: str) -> dict:
    """Assign entity to User or Staff."""
    pass

# My Queue
@mcp.tool()
async def get_my_queue() -> dict:
    """Get user's unified work queue (approvals, tasks, reviews)."""
    pass

# Review Requests
@mcp.tool()
async def create_review_request(staff_id: str, entity_type: str, entity_id: str, request_type: str, description: str) -> dict:
    """Create a review request."""
    pass

@mcp.tool()
async def review_review_request(review_request_id: str, status: str) -> dict:
    """Mark review request as reviewed or dismissed."""
    pass
```

### Webhook Integration

Modify `scripts/claude_webhook_server.py`:

```python
@app.post("/staff-mention")
async def handle_staff_mention(request: Request):
    """Handle @ mention of Staff in comments."""
    data = await request.json()

    staff_id = data["staff_id"]
    staff_handle = data["staff_handle"]
    persona = data["persona"]
    monitoring_scope = data["monitoring_scope"]
    comment_id = data["comment_id"]
    context = data["context"]

    # Build system message with persona
    system_message = f"""You are {staff_handle}, a Staff member in the Turbo platform.

{persona}

Your monitoring scope: {json.dumps(monitoring_scope, indent=2)}

You have been @ mentioned in a comment. Respond as this Staff member with deep expertise in your domain.

You can:
- Provide analysis and recommendations
- Suggest actions (which will create action approvals for user)
- Request assignment to entities you want to own
- Create review requests if you need user feedback
- Reference related entities from the context provided

Context:
{json.dumps(context, indent=2)}
"""

    # Call Claude API
    response = await call_claude_api(system_message, data["comment"]["content"])

    # Post response as comment
    await post_comment_via_mcp(
        entity_type=context["entity_type"],
        entity_id=context["entity_id"],
        content=response,
        author_type="ai",
        author_name=staff_handle
    )

    # Parse for action suggestions
    actions = parse_action_suggestions(response)
    for action in actions:
        await create_action_approval_via_mcp(
            staff_id=staff_id,
            action_type=action["type"],
            entity_type=context["entity_type"],
            entity_id=context["entity_id"],
            action_params=action["params"],
            ai_reasoning=action["reasoning"]
        )

    return {"success": True}
```

### Frontend Components

#### My Queue Page (`frontend/app/my-queue/page.tsx`)

```typescript
export default function MyQueuePage() {
  const { data: queue } = useMyQueue();

  return (
    <div>
      <h1>My Queue</h1>

      <Section title="Action Approvals" count={queue?.action_approvals.length}>
        {queue?.action_approvals.map(approval => (
          <ActionApprovalCard key={approval.id} approval={approval} />
        ))}
      </Section>

      <Section title="Assigned Tasks" count={getTotalAssigned(queue)}>
        <Tabs>
          <Tab label="Issues" count={queue?.assigned_tasks.issues.length}>
            {queue?.assigned_tasks.issues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </Tab>
          <Tab label="Initiatives" count={queue?.assigned_tasks.initiatives.length}>
            {/* ... */}
          </Tab>
          <Tab label="Milestones" count={queue?.assigned_tasks.milestones.length}>
            {/* ... */}
          </Tab>
        </Tabs>
      </Section>

      <Section title="Review Requests" count={queue?.review_requests.length}>
        {queue?.review_requests.map(request => (
          <ReviewRequestCard key={request.id} request={request} />
        ))}
      </Section>
    </div>
  );
}
```

#### Staff List Page (`frontend/app/staff/page.tsx`)

```typescript
export default function StaffListPage() {
  const { data: staff } = useStaff();

  return (
    <div>
      <h1>Staff</h1>

      <Section title="Leadership">
        {staff?.filter(s => s.is_leadership_role).map(s => (
          <StaffCard key={s.id} staff={s} />
        ))}
      </Section>

      <Section title="Domain Experts">
        {staff?.filter(s => !s.is_leadership_role).map(s => (
          <StaffCard key={s.id} staff={s} />
        ))}
      </Section>
    </div>
  );
}
```

#### Staff Detail/Chat Page (`frontend/app/staff/[id]/page.tsx`)

```typescript
export default function StaffDetailPage({ params }: { params: { id: string } }) {
  const { data: staff } = useStaff(params.id);
  const { data: messages } = useStaffMessages(params.id);
  const sendMessage = useSendStaffMessage(params.id);

  return (
    <div>
      <StaffHeader staff={staff} />

      <ChatInterface
        messages={messages}
        onSend={sendMessage}
        placeholder={`Chat with ${staff?.name}...`}
      />

      <StaffDetails
        monitoringScope={staff?.monitoring_scope}
        capabilities={staff?.capabilities}
        assignments={staff?.assignments}
      />
    </div>
  );
}
```

---

## Implementation Plan - Phase 1

### Database & Models ✓
- [ ] Create `Staff` table with handle, role_type, is_leadership_role, monitoring_scope, capabilities
- [ ] Create `StaffConversation` table with message_type, is_group_discussion, group_discussion_id
- [ ] Create `ReviewRequest` table with staff_id, entity_type, entity_id, request_type, status
- [ ] Add `assigned_to_type` and `assigned_to_id` to Issue, Initiative, Milestone models
- [ ] Create Alembic migration script
- [ ] Seed 4 leadership staff (Chief of Staff, Product Manager, Agility Lead, Engineering Manager)

### Repositories ✓
- [ ] Create `StaffRepository` with get_by_handle, get_leadership_staff, get_by_monitoring_scope
- [ ] Create `ReviewRequestRepository` with get_pending_for_user, get_by_entity
- [ ] Update `IssueRepository`, `InitiativeRepository`, `MilestoneRepository` with assignment queries
- [ ] Add permission check methods to all repositories

### Schemas ✓
- [ ] Create `StaffCreate`, `StaffUpdate`, `StaffResponse` schemas
- [ ] Create `StaffConversationCreate`, `StaffConversationResponse` schemas
- [ ] Create `ReviewRequestCreate`, `ReviewRequestUpdate`, `ReviewRequestResponse` schemas
- [ ] Create `MyQueueResponse` schema (aggregates approvals, tasks, reviews)
- [ ] Update Issue/Initiative/Milestone schemas with assignment fields

### Services ✓
- [ ] Create `StaffService` (CRUD, conversation management)
- [ ] Create `AssignmentService` (permission checks, assignment logic)
- [ ] Create `MentionDetectorService` (regex parsing, webhook triggers)
- [ ] Create `ScopeValidationService` (Agility Lead monitoring, heuristics, review request creation)
- [ ] Create `InitiativeRefinementService` (extend issue refinement pattern)
- [ ] Create `MilestoneRefinementService` (extend issue refinement pattern)

### API Endpoints ✓
- [ ] `POST /api/v1/staff` - Create staff
- [ ] `GET /api/v1/staff` - List staff (filter by role_type, is_active)
- [ ] `GET /api/v1/staff/{id}` - Get staff details
- [ ] `PUT /api/v1/staff/{id}` - Update staff
- [ ] `POST /api/v1/staff/{id}/messages` - Send message
- [ ] `GET /api/v1/staff/{id}/messages` - Get conversation
- [ ] `GET /api/v1/my-queue` - Get unified queue
- [ ] `POST /api/v1/review-requests/{id}/review` - Mark reviewed/dismissed

### MCP Tools ✓
- [ ] `mcp__turbo__create_staff`
- [ ] `mcp__turbo__list_staff`
- [ ] `mcp__turbo__get_staff`
- [ ] `mcp__turbo__update_staff`
- [ ] `mcp__turbo__send_staff_message`
- [ ] `mcp__turbo__get_staff_messages`
- [ ] `mcp__turbo__assign_entity`
- [ ] `mcp__turbo__get_my_queue`
- [ ] `mcp__turbo__create_review_request`
- [ ] `mcp__turbo__review_review_request`

### Webhook Integration ✓
- [ ] Add `POST /staff-mention` endpoint to claude_webhook_server.py
- [ ] Implement @ mention detection in comment processing
- [ ] Build Staff context (monitoring scope, entity details, related entities)
- [ ] Inject Staff persona in system message
- [ ] Parse AI response for action suggestions
- [ ] Create action approvals via MCP
- [ ] Post AI response as comment via MCP

### Frontend ✓
- [ ] Create `/app/my-queue/page.tsx` (unified queue UI)
- [ ] Create `/app/staff/page.tsx` (list all staff)
- [ ] Create `/app/staff/[id]/page.tsx` (staff detail + chat)
- [ ] Add @ mention autocomplete to comment text areas
- [ ] Add assignment dropdown to Issue/Initiative/Milestone forms
- [ ] Add "Assigned to" column/filter to list views
- [ ] Create `useMyQueue()` hook
- [ ] Create `useStaff()`, `useStaffMessages()`, `useSendStaffMessage()` hooks

### Testing ✓
- [ ] Unit tests for MentionDetectorService regex
- [ ] Unit tests for permission logic (can_edit_entity)
- [ ] Unit tests for ScopeValidationService heuristics
- [ ] Integration test: @ mention → webhook → response flow
- [ ] Integration test: Assignment → permission check → edit flow
- [ ] Integration test: My Queue aggregation
- [ ] E2E test: User mentions @SecurityLead, receives response, approves suggested action

---

## Acceptance Criteria

### Core Functionality ✓
- [x] User can create Staff with unique handles
- [x] User can @ mention Staff in comments (any entity type)
- [x] @ mentions trigger immediate webhook response (< 30s)
- [x] Staff responds in comment thread with appropriate persona
- [x] User can assign issues/initiatives/milestones to Staff or User
- [x] Assignment determines edit permissions (assigned_to can edit)
- [x] Leadership roles (4 staff) can edit any entity
- [x] Domain roles can only edit what they're assigned

### My Queue ✓
- [x] User can view all action approvals in queue
- [x] User can view all assigned tasks (issues/initiatives/milestones)
- [x] User can view all review requests
- [x] Single unified interface for all User work
- [x] Each section shows count badges
- [x] Items sorted by priority/date

### Scope Validation ✓
- [x] Agility Lead monitors assignment granularity
- [x] Creates review requests when work too broad
- [x] User receives review requests in My Queue
- [x] User can acknowledge, dismiss, or discuss via @ mention

### Refinement ✓
- [x] Issue refinement continues to work (existing)
- [x] Initiative refinement available
- [x] Milestone refinement available
- [x] Staff automatically run relevant refinement for their monitoring scope

### Permission Model ✓
- [x] User always owns their entities (can edit anything)
- [x] Staff assigned to entity can edit it
- [x] Leadership staff can edit any entity
- [x] Domain staff cannot edit unassigned entities
- [x] API returns 403 for permission violations

---

## Testing Strategy

### Unit Tests
- **MentionDetectorService**:
  - Regex matches `@Handle` patterns
  - Ignores email addresses
  - Handles multiple mentions in one comment
  - Case sensitivity

- **Permission Logic**:
  - User can edit all entities
  - Assigned staff can edit entity
  - Leadership can edit any entity
  - Domain staff cannot edit unassigned entities

- **ScopeValidationService**:
  - Long description triggers concern
  - Multiple action verbs trigger concern
  - Many dependencies trigger concern
  - Creates review request when concerns detected

### Integration Tests
- **@ Mention Flow**:
  1. Create comment with `@ChiefOfStaff`
  2. Verify webhook triggered
  3. Verify AI response posted as comment
  4. Verify author is Staff handle

- **Assignment & Permissions**:
  1. Assign issue to Staff member
  2. Verify Staff can update issue
  3. Verify other domain staff cannot update
  4. Verify leadership can update

- **My Queue**:
  1. Create action approval
  2. Assign issue to User
  3. Create review request
  4. Fetch My Queue
  5. Verify all 3 items present

- **Refinement**:
  1. Run initiative refinement
  2. Verify suggestions returned
  3. Execute safe changes
  4. Verify changes applied

### E2E Tests
**Scenario: Security Review via @ Mention**
1. User creates issue: "Implement OAuth authentication"
2. User comments: `"@SecurityLead can you review this?"`
3. SecurityLead AI responds with security considerations
4. SecurityLead suggests adding "security-review" tag (creates action approval)
5. Action approval appears in User's My Queue
6. User approves
7. Tag added to issue

**Scenario: Scope Validation**
1. User creates issue: "Build entire authentication system"
2. Agility Lead background job analyzes
3. Detects broad scope (OAuth, sessions, passwords, 2FA mentioned)
4. Creates review request
5. Review request appears in User's My Queue
6. User: `"@AgilityLead yes please help me split this"`
7. Agility Lead responds with breakdown suggestions
8. Creates action approvals for 4 sub-issues

---

## Future Phases (Not Phase 1)

### Phase 2: Group Discussions
- Multi-participant AI conversations
- Group discussion table/model
- Staff-to-Staff collaboration
- Facilitated problem solving
- Meeting summaries

### Phase 3: Content Creation
- Staff write articles for documentation
- Staff present research findings
- Staff create architecture diagrams
- Staff maintain living documentation
- Knowledge base integration

### Phase 4: Additional Domain Staff
Based on Chief of Staff recommendations:
- **SecurityLead** (@SecurityLead) - Security reviews, threat modeling
- **ArchitectureLead** (@ArchitectureLead) - System design, patterns
- **DataModeler** (@DataModeler) - Schema design, migrations
- **QALead** (@QALead) - Test strategy, quality gates
- **DevOpsLead** (@DevOpsLead) - Infrastructure, deployment
- **UIUXLead** (@UIUXLead) - Interface design, accessibility
- **DocumentationLead** (@DocumentationLead) - Docs, guides
- **PerformanceLead** (@PerformanceLead) - Optimization, profiling

### Phase 5: Subagent Direction
- Staff direct specialized subagents for tasks
- Task decomposition and delegation
- Parallel execution with subagents
- Result aggregation and synthesis
- Subagent coordination

### Phase 6: Autonomous Monitoring
- Background jobs run continuously
- Staff proactively identify issues
- Automated refinement runs
- Smart notifications (only important items)
- Predictive analytics

---

## Dependencies

**Existing Systems (Required)**:
- ✅ Action approval system (working)
- ✅ Issue refinement service (working)
- ✅ Webhook server (working)
- ✅ MCP integration (working)
- ✅ Comment system (supports entity_type/entity_id)

**New Dependencies**:
- None - all built on existing stack

---

## Success Metrics

**Adoption**:
- User can @ mention all 4 leadership staff ✓
- 100% of @ mentions receive response within 30s ✓
- My Queue shows all 3 work types (approvals, tasks, reviews) ✓

**Quality**:
- 90%+ of assignments have appropriate scope ✓
- Zero permission bypass incidents ✓
- < 5% false positive scope validations ✓

**Productivity**:
- 50% reduction in manual triage time
- 80%+ of Staff suggestions accepted
- 3+ Staff conversations per day

**Coverage**:
- All critical domains have assigned Staff
- < 10% of entities unassigned
- All blockers have Staff owner

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| @ mention spam | High - too many webhooks | Rate limiting per Staff, user settings for @ mention frequency |
| Scope validation false positives | Medium - noise in queue | Tune heuristics based on feedback, allow user to dismiss/calibrate |
| Permission model too restrictive | Medium - Staff can't help | Leadership roles have universal edit, User can reassign |
| Webhook latency | Low - slow responses | Async processing, queue system, user sees "typing..." indicator |
| AI hallucinations in Staff responses | Medium - bad advice | Include disclaimer, require approval for actions, user can override |

---

## Notes & Decisions

### Key Design Decisions

1. **Assignment = Ownership**: Simpler than shared ownership, clearer responsibility
2. **Leadership Universal Access**: Enables coordination without bottlenecks
3. **@ Mention = Immediate Webhook**: Real-time feel, better than polling
4. **My Queue Unification**: Single interface reduces context switching
5. **Agility Lead Scope Validation**: Automated quality control for work granularity

### Deferred to Future Phases

- Group discussions (complex conversation management)
- Content creation (needs content storage/versioning)
- Additional domain staff (validate pattern first)
- Subagent direction (needs subagent infrastructure)
- Autonomous monitoring (needs job scheduler)

### Open Questions

- [ ] Should Staff be able to @ mention other Staff?
- [ ] How to handle conflicting Staff suggestions?
- [ ] Should there be a Staff approval workflow before activation?
- [ ] What happens when User and Staff are both assigned (co-ownership)?
- [ ] How to visualize Staff activity/workload?

---

## Related Documentation

- [Issue Refinement Guide](./ISSUE_REFINEMENT_GUIDE.md)
- [Action Approval System](./ACTION_APPROVAL_SYSTEM.md)
- [Webhook Integration](../scripts/claude_webhook_server.py)
- [MCP Server](../turbo/mcp_server.py)

---

**Created**: 2025-10-19
**Last Updated**: 2025-10-19
**Status**: Ready for Implementation
**Owner**: User + Chief of Staff (@ChiefOfStaff)
