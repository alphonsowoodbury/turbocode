# Business Ventures System - Complete Design Document

**Version:** 1.0
**Date:** 2025-10-30
**Purpose:** Entrepreneurial pipeline for capturing, evaluating, and launching business ideas (apps, SaaS products, data projects)

---

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Model](#data-model)
4. [Backend Implementation](#backend-implementation)
5. [AI Intelligence Layer](#ai-intelligence-layer)
6. [Frontend Implementation](#frontend-implementation)
7. [Implementation Phases](#implementation-phases)
8. [File-by-File Guide](#file-by-file-guide)
9. [API Specifications](#api-specifications)
10. [MCP Tools](#mcp-tools)
11. [Success Metrics](#success-metrics)

---

## Overview

### Vision
Create a comprehensive system for capturing entrepreneurial inspiration and managing business ideas through their full lifecycle: **Ideation → Validation → Development → Launch → Active**.

### Key Capabilities
- **Rapid Capture**: Capture ideas in seconds, not minutes
- **Market Intelligence**: AI-powered market research and competitor analysis
- **Validation Framework**: Structured experiment tracking and learning loops
- **Strategic Guidance**: Dedicated AI venture advisor for feedback
- **Full Lifecycle**: Seamless progression from concept to launched business
- **Portfolio Analytics**: Track your venture pipeline health

### User Requirements
Based on user input, the system must support:
1. **Comprehensive Field Capture**:
   - Basic: Title, description, tags
   - Market Analysis: TAM/SAM/SOM, competition, target customer
   - Business Model: Revenue model, costs, key metrics
   - Validation: Status, experiments, learnings

2. **Full Lifecycle Integration**:
   - Ideas can exist standalone initially
   - Validated ideas can "graduate" to Projects
   - Maintain linkage throughout execution

3. **AI-Powered Features**:
   - Idea evaluation (viability, market fit, challenges)
   - Market research automation (competitors, trends)
   - Strategic feedback from dedicated advisor
   - Inspiration feed (related ideas, suggestions)

---

## System Architecture

### Entity Hierarchy
```
BusinessVenture (standalone or project-linked)
├── Tags (categorization: market, tech, industry)
├── Documents (research, business plans, presentations)
├── Issues (implementation tasks when validated)
├── Experiments (validation tests)
├── Comments (feedback, notes, AI insights)
└── Project (optional link when idea becomes real)
```

### Lifecycle States

#### Status Field (operational state)
- `ideation` - Initial concept capture
- `validation` - Running experiments, testing hypotheses
- `development` - Building MVP/product
- `launch` - Pre-launch preparation
- `active` - Live and operating
- `paused` - On hold
- `cancelled` - Decided not to pursue

#### Stage Field (business maturity)
- `concept` - Pure idea stage
- `mvp` - Minimum viable product
- `beta` - Testing with users
- `launched` - Generally available

#### Validation Status (separate field)
- `hypothesis` - Assumption to test
- `testing` - Experiments in progress
- `validated` - Proven with data
- `invalidated` - Disproven, needs pivot

### Architecture Layers (Standard Turbo Pattern)
```
Frontend (Next.js/React)
    ↓
MCP Tools (Claude Integration)
    ↓
API Endpoints (FastAPI)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Models (SQLAlchemy ORM)
    ↓
Database (PostgreSQL)
```

---

## Data Model

### BusinessVenture Table Schema

```sql
CREATE TABLE business_ventures (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Entity Keys (for human-readable references)
    venture_key VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "VENTURE-1", "TURBO-V1"
    venture_number INTEGER NOT NULL,

    -- Basic Information
    name VARCHAR(200) NOT NULL,
    tagline VARCHAR(200),
    description TEXT NOT NULL,

    -- Lifecycle Management
    status VARCHAR(20) DEFAULT 'ideation' NOT NULL,
    stage VARCHAR(20) DEFAULT 'concept' NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' NOT NULL,

    -- Market Analysis
    target_customer TEXT,
    tam_sam_som JSONB,  -- {"tam": "$1B", "sam": "$100M", "som": "$10M"}
    competition_analysis TEXT,
    market_trends JSONB,  -- Array of trend objects

    -- Business Model
    revenue_model VARCHAR(50),  -- subscription, one-time, freemium, advertising, marketplace
    estimated_costs DECIMAL(15,2),
    key_metrics JSONB,  -- Flexible metrics storage: {"cac": 50, "ltv": 500, "churn": 0.05}
    unit_economics JSONB,  -- {"margin": 0.8, "payback_months": 12}

    -- Validation & Learning
    validation_status VARCHAR(20) DEFAULT 'hypothesis',
    experiments JSONB,  -- Array of experiment objects
    learnings TEXT,  -- Key insights and pivots
    pivot_history JSONB,  -- Track major direction changes

    -- Financial Projections
    financial_projections JSONB,  -- {"year1_revenue": 100000, "runway_months": 18}

    -- Dates
    ideation_date TIMESTAMP WITH TIME ZONE,
    validation_date TIMESTAMP WITH TIME ZONE,
    launch_date TIMESTAMP WITH TIME ZONE,
    target_date TIMESTAMP WITH TIME ZONE,

    -- Relationships
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,  -- Optional link

    -- Workspace & Assignment
    workspace VARCHAR(20) DEFAULT 'personal' NOT NULL,
    work_company VARCHAR(100),
    assigned_to_type VARCHAR(20),  -- 'user', 'staff', etc.
    assigned_to_id UUID,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Indexes
    INDEX idx_venture_status (status),
    INDEX idx_venture_stage (stage),
    INDEX idx_venture_workspace (workspace),
    INDEX idx_venture_key (venture_key),
    INDEX idx_venture_project (project_id)
);
```

### Association Tables

```sql
-- Venture-Tag Many-to-Many
CREATE TABLE venture_tags (
    venture_id UUID REFERENCES business_ventures(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (venture_id, tag_id)
);

-- Venture-Document Many-to-Many
CREATE TABLE venture_documents (
    venture_id UUID REFERENCES business_ventures(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (venture_id, document_id)
);

-- Venture-Issue Many-to-Many (for implementation tasks)
CREATE TABLE venture_issues (
    venture_id UUID REFERENCES business_ventures(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    PRIMARY KEY (venture_id, issue_id)
);
```

### Experiment Data Structure (JSONB)

```json
{
  "id": "exp-001",
  "name": "Landing page conversion test",
  "hypothesis": "Tech professionals will sign up for beta access if we show value prop clearly",
  "method": "Landing page with email capture",
  "success_criteria": "5% conversion rate, 100 signups",
  "status": "completed",
  "start_date": "2025-10-01",
  "end_date": "2025-10-15",
  "results": {
    "signups": 127,
    "visitors": 2000,
    "conversion_rate": 0.0635
  },
  "learnings": "Exceeded target. Main value prop resonates. Users want mobile app first.",
  "next_steps": "Build mobile MVP instead of web"
}
```

### Financial Projections Structure (JSONB)

```json
{
  "projections": [
    {
      "period": "year_1",
      "revenue": 120000,
      "costs": 80000,
      "customers": 100,
      "arpu": 100
    }
  ],
  "runway_months": 18,
  "breakeven_month": 14,
  "initial_capital": 150000
}
```

---

## Backend Implementation

### 1. Database Model (`turbo/core/models/business_venture.py`)

```python
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
import uuid
from datetime import datetime

from turbo.core.database.base import Base

class BusinessVenture(Base):
    __tablename__ = "business_ventures"

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Entity Keys
    venture_key: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    venture_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Basic Info
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tagline: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Lifecycle
    status: Mapped[str] = mapped_column(String(20), default="ideation", nullable=False)
    stage: Mapped[str] = mapped_column(String(20), default="concept", nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)

    # Market Analysis
    target_customer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tam_sam_som: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    competition_analysis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    market_trends: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Business Model
    revenue_model: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estimated_costs: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    key_metrics: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    unit_economics: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Validation
    validation_status: Mapped[str] = mapped_column(String(20), default="hypothesis", nullable=False)
    experiments: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    learnings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pivot_history: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Financial
    financial_projections: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Dates
    ideation_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    validation_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    launch_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    target_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    project = relationship("Project", back_populates="ventures")

    # Workspace
    workspace: Mapped[str] = mapped_column(String(20), default="personal", nullable=False)
    work_company: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    assigned_to_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    assigned_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # Many-to-Many Relationships
    tags = relationship("Tag", secondary="venture_tags", back_populates="ventures")
    documents = relationship("Document", secondary="venture_documents", back_populates="ventures")
    issues = relationship("Issue", secondary="venture_issues", back_populates="ventures")

    # Comments (polymorphic)
    comments = relationship(
        "Comment",
        foreign_keys="[Comment.entity_id]",
        primaryjoin="and_(BusinessVenture.id == Comment.entity_id, Comment.entity_type == 'venture')",
        back_populates="venture",
        cascade="all, delete-orphan"
    )
```

### 2. Repository Layer (`turbo/core/repositories/business_venture.py`)

```python
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from turbo.core.repositories.base import BaseRepository
from turbo.core.models.business_venture import BusinessVenture
from turbo.core.schemas.business_venture import BusinessVentureCreate, BusinessVentureUpdate

class BusinessVentureRepository(BaseRepository[BusinessVenture, BusinessVentureCreate, BusinessVentureUpdate]):
    """Repository for business venture operations."""

    def __init__(self, session):
        super().__init__(BusinessVenture, session)

    async def get_by_key(self, venture_key: str) -> Optional[BusinessVenture]:
        """Get venture by key (e.g., 'VENTURE-1')."""
        stmt = select(self._model).where(self._model.venture_key == venture_key)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_relations(self, id: UUID) -> Optional[BusinessVenture]:
        """Get venture with all relationships loaded."""
        stmt = (
            select(self._model)
            .options(
                selectinload(self._model.tags),
                selectinload(self._model.documents),
                selectinload(self._model.issues),
                selectinload(self._model.project)
            )
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_with_relations(
        self,
        status: Optional[str] = None,
        stage: Optional[str] = None,
        workspace: Optional[str] = None,
        work_company: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> list[BusinessVenture]:
        """Get all ventures with filters and relationships."""
        stmt = (
            select(self._model)
            .options(
                selectinload(self._model.tags),
                selectinload(self._model.documents),
                selectinload(self._model.issues),
                selectinload(self._model.project)
            )
        )

        if status:
            stmt = stmt.where(self._model.status == status)
        if stage:
            stmt = stmt.where(self._model.stage == stage)
        if workspace:
            stmt = stmt.where(self._model.workspace == workspace)
        if work_company:
            stmt = stmt.where(self._model.work_company == work_company)

        stmt = stmt.offset(offset)
        if limit:
            stmt = stmt.limit(limit)

        stmt = stmt.order_by(self._model.created_at.desc())

        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_project(self, project_id: UUID) -> list[BusinessVenture]:
        """Get all ventures linked to a project."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.tags))
            .where(self._model.project_id == project_id)
            .order_by(self._model.created_at.desc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
```

### 3. Pydantic Schemas (`turbo/core/schemas/business_venture.py`)

```python
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
import re

class BusinessVentureBase(BaseModel):
    """Base schema for business ventures."""
    name: str = Field(..., min_length=1, max_length=200)
    tagline: Optional[str] = Field(None, max_length=200)
    description: str = Field(..., min_length=1)
    status: str = Field("ideation", pattern="^(ideation|validation|development|launch|active|paused|cancelled)$")
    stage: str = Field("concept", pattern="^(concept|mvp|beta|launched)$")
    priority: str = Field("medium", pattern="^(low|medium|high|critical)$")

    # Market Analysis
    target_customer: Optional[str] = None
    tam_sam_som: Optional[dict] = None
    competition_analysis: Optional[str] = None
    market_trends: Optional[dict] = None

    # Business Model
    revenue_model: Optional[str] = Field(None, pattern="^(subscription|one_time|freemium|advertising|marketplace|other)$")
    estimated_costs: Optional[float] = Field(None, ge=0)
    key_metrics: Optional[dict] = None
    unit_economics: Optional[dict] = None

    # Validation
    validation_status: str = Field("hypothesis", pattern="^(hypothesis|testing|validated|invalidated)$")
    experiments: Optional[dict] = None
    learnings: Optional[str] = None
    pivot_history: Optional[dict] = None

    # Financial
    financial_projections: Optional[dict] = None

    # Dates
    ideation_date: Optional[datetime] = None
    validation_date: Optional[datetime] = None
    launch_date: Optional[datetime] = None
    target_date: Optional[datetime] = None

    # Relationships
    project_id: Optional[UUID] = None

    # Workspace
    workspace: str = Field("personal", pattern="^(personal|freelance|work)$")
    work_company: Optional[str] = Field(None, max_length=100)

class BusinessVentureCreate(BusinessVentureBase):
    """Schema for creating a business venture."""
    # Association IDs
    tag_ids: Optional[list[UUID]] = None
    document_ids: Optional[list[UUID]] = None
    issue_ids: Optional[list[UUID]] = None

    # Generated by system
    venture_key: Optional[str] = None
    venture_number: Optional[int] = None

class BusinessVentureUpdate(BaseModel):
    """Schema for updating a business venture (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    tagline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = Field(None, pattern="^(ideation|validation|development|launch|active|paused|cancelled)$")
    stage: Optional[str] = Field(None, pattern="^(concept|mvp|beta|launched)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    target_customer: Optional[str] = None
    tam_sam_som: Optional[dict] = None
    competition_analysis: Optional[str] = None
    market_trends: Optional[dict] = None
    revenue_model: Optional[str] = None
    estimated_costs: Optional[float] = Field(None, ge=0)
    key_metrics: Optional[dict] = None
    unit_economics: Optional[dict] = None
    validation_status: Optional[str] = None
    experiments: Optional[dict] = None
    learnings: Optional[str] = None
    pivot_history: Optional[dict] = None
    financial_projections: Optional[dict] = None
    ideation_date: Optional[datetime] = None
    validation_date: Optional[datetime] = None
    launch_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    project_id: Optional[UUID] = None
    workspace: Optional[str] = None
    work_company: Optional[str] = None

    # Association updates
    tag_ids: Optional[list[UUID]] = None
    document_ids: Optional[list[UUID]] = None
    issue_ids: Optional[list[UUID]] = None

class BusinessVentureResponse(BusinessVentureBase):
    """Schema for business venture responses."""
    id: UUID
    venture_key: str
    venture_number: int
    created_at: datetime
    updated_at: datetime

    # Counts
    tag_count: int = 0
    document_count: int = 0
    issue_count: int = 0

    model_config = {"from_attributes": True}
```

### 4. Service Layer (`turbo/core/services/business_venture.py`)

```python
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session

from turbo.core.repositories.business_venture import BusinessVentureRepository
from turbo.core.repositories.project import ProjectRepository
from turbo.core.repositories.tag import TagRepository
from turbo.core.repositories.document import DocumentRepository
from turbo.core.repositories.issue import IssueRepository
from turbo.core.services.key_generator import KeyGeneratorService
from turbo.core.schemas.business_venture import (
    BusinessVentureCreate,
    BusinessVentureUpdate,
    BusinessVentureResponse
)
from turbo.core.utils import strip_emojis
from turbo.utils.exceptions import NotFoundError, ValidationError
from sqlalchemy import inspect

class BusinessVentureService:
    """Service for business venture operations."""

    def __init__(
        self,
        venture_repo: BusinessVentureRepository,
        project_repo: ProjectRepository,
        tag_repo: TagRepository,
        document_repo: DocumentRepository,
        issue_repo: IssueRepository,
        key_generator: KeyGeneratorService
    ):
        self._venture_repo = venture_repo
        self._project_repo = project_repo
        self._tag_repo = tag_repo
        self._document_repo = document_repo
        self._issue_repo = issue_repo
        self._key_generator = key_generator

    async def create_venture(
        self, venture_data: BusinessVentureCreate
    ) -> BusinessVentureResponse:
        """Create a new business venture."""

        # Strip emojis from text fields
        venture_data.name = strip_emojis(venture_data.name)
        if venture_data.tagline:
            venture_data.tagline = strip_emojis(venture_data.tagline)
        venture_data.description = strip_emojis(venture_data.description)

        # Validate project exists if provided
        if venture_data.project_id:
            project = await self._project_repo.get_by_id(venture_data.project_id)
            if not project:
                raise NotFoundError(f"Project {venture_data.project_id} not found")

        # Generate venture key
        if venture_data.project_id:
            venture_key, venture_number = await self._key_generator.generate_entity_key(
                venture_data.project_id, "venture"
            )
        else:
            # Global counter for standalone ventures
            venture_number = await self._key_generator._get_next_counter("venture")
            venture_key = f"VENTURE-{venture_number}"

        venture_data.venture_key = venture_key
        venture_data.venture_number = venture_number

        # Extract associations
        tag_ids = venture_data.tag_ids
        document_ids = venture_data.document_ids
        issue_ids = venture_data.issue_ids
        venture_data.tag_ids = None
        venture_data.document_ids = None
        venture_data.issue_ids = None

        # Create venture
        venture = await self._venture_repo.create(venture_data)
        await self._venture_repo._session.commit()
        await self._venture_repo._session.refresh(venture)

        # Add associations
        if tag_ids:
            for tag_id in tag_ids:
                tag = await self._tag_repo.get_by_id(tag_id)
                if tag:
                    venture.tags.append(tag)

        if document_ids:
            for doc_id in document_ids:
                doc = await self._document_repo.get_by_id(doc_id)
                if doc:
                    venture.documents.append(doc)

        if issue_ids:
            for issue_id in issue_ids:
                issue = await self._issue_repo.get_by_id(issue_id)
                if issue:
                    venture.issues.append(issue)

        await self._venture_repo._session.commit()
        await self._venture_repo._session.refresh(venture)

        return self._to_response(venture)

    async def get_venture_by_id(self, venture_id: UUID) -> BusinessVentureResponse:
        """Get venture by ID."""
        venture = await self._venture_repo.get_with_relations(venture_id)
        if not venture:
            raise NotFoundError(f"Venture {venture_id} not found")
        return self._to_response(venture)

    async def get_venture_by_key(self, venture_key: str) -> BusinessVentureResponse:
        """Get venture by key."""
        venture = await self._venture_repo.get_by_key(venture_key)
        if not venture:
            raise NotFoundError(f"Venture {venture_key} not found")
        venture = await self._venture_repo.get_with_relations(venture.id)
        return self._to_response(venture)

    async def get_all_ventures(
        self,
        status: Optional[str] = None,
        stage: Optional[str] = None,
        workspace: Optional[str] = None,
        work_company: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> list[BusinessVentureResponse]:
        """Get all ventures with filters."""
        ventures = await self._venture_repo.get_all_with_relations(
            status=status,
            stage=stage,
            workspace=workspace,
            work_company=work_company,
            limit=limit,
            offset=offset
        )
        return [self._to_response(v) for v in ventures]

    async def update_venture(
        self, venture_id: UUID, update_data: BusinessVentureUpdate
    ) -> BusinessVentureResponse:
        """Update venture."""
        venture = await self._venture_repo.get_with_relations(venture_id)
        if not venture:
            raise NotFoundError(f"Venture {venture_id} not found")

        # Strip emojis
        if update_data.name:
            update_data.name = strip_emojis(update_data.name)
        if update_data.tagline:
            update_data.tagline = strip_emojis(update_data.tagline)
        if update_data.description:
            update_data.description = strip_emojis(update_data.description)

        # Handle associations
        tag_ids = update_data.tag_ids
        document_ids = update_data.document_ids
        issue_ids = update_data.issue_ids
        update_data.tag_ids = None
        update_data.document_ids = None
        update_data.issue_ids = None

        # Update venture
        updated_venture = await self._venture_repo.update(venture_id, update_data)
        await self._venture_repo._session.commit()

        # Update associations if provided
        if tag_ids is not None:
            updated_venture.tags.clear()
            for tag_id in tag_ids:
                tag = await self._tag_repo.get_by_id(tag_id)
                if tag:
                    updated_venture.tags.append(tag)

        if document_ids is not None:
            updated_venture.documents.clear()
            for doc_id in document_ids:
                doc = await self._document_repo.get_by_id(doc_id)
                if doc:
                    updated_venture.documents.append(doc)

        if issue_ids is not None:
            updated_venture.issues.clear()
            for issue_id in issue_ids:
                issue = await self._issue_repo.get_by_id(issue_id)
                if issue:
                    updated_venture.issues.append(issue)

        await self._venture_repo._session.commit()
        await self._venture_repo._session.refresh(updated_venture)

        return self._to_response(updated_venture)

    async def delete_venture(self, venture_id: UUID) -> None:
        """Delete venture."""
        venture = await self._venture_repo.get_by_id(venture_id)
        if not venture:
            raise NotFoundError(f"Venture {venture_id} not found")
        await self._venture_repo.delete(venture_id)
        await self._venture_repo._session.commit()

    def _to_response(self, venture) -> BusinessVentureResponse:
        """Convert venture to response schema."""
        response_data = {
            "id": venture.id,
            "venture_key": venture.venture_key,
            "venture_number": venture.venture_number,
            "name": venture.name,
            "tagline": venture.tagline,
            "description": venture.description,
            "status": venture.status,
            "stage": venture.stage,
            "priority": venture.priority,
            "target_customer": venture.target_customer,
            "tam_sam_som": venture.tam_sam_som,
            "competition_analysis": venture.competition_analysis,
            "market_trends": venture.market_trends,
            "revenue_model": venture.revenue_model,
            "estimated_costs": venture.estimated_costs,
            "key_metrics": venture.key_metrics,
            "unit_economics": venture.unit_economics,
            "validation_status": venture.validation_status,
            "experiments": venture.experiments,
            "learnings": venture.learnings,
            "pivot_history": venture.pivot_history,
            "financial_projections": venture.financial_projections,
            "ideation_date": venture.ideation_date,
            "validation_date": venture.validation_date,
            "launch_date": venture.launch_date,
            "target_date": venture.target_date,
            "project_id": venture.project_id,
            "workspace": venture.workspace,
            "work_company": venture.work_company,
            "created_at": venture.created_at,
            "updated_at": venture.updated_at,
            "tag_count": 0,
            "document_count": 0,
            "issue_count": 0
        }

        # Check if relationships are loaded
        insp = inspect(venture)
        if "tags" not in insp.unloaded:
            response_data["tag_count"] = len(venture.tags)
        if "documents" not in insp.unloaded:
            response_data["document_count"] = len(venture.documents)
        if "issues" not in insp.unloaded:
            response_data["issue_count"] = len(venture.issues)

        return BusinessVentureResponse(**response_data)
```

---

## AI Intelligence Layer

### 1. Venture Evaluation Service (`turbo/core/services/venture_evaluation.py`)

**Purpose:** AI-powered analysis of business venture viability

**Features:**
- Market opportunity assessment
- Technical feasibility analysis
- Competitive moat evaluation
- Risk identification
- Scoring system (0-100)

**Implementation:**
```python
class VentureEvaluationService:
    """AI-powered venture evaluation."""

    async def evaluate_venture(self, venture_id: UUID) -> dict:
        """
        Evaluate a business venture comprehensively.

        Returns:
        {
            "overall_score": 75,
            "market_opportunity": {"score": 80, "analysis": "...", "reasoning": "..."},
            "technical_feasibility": {"score": 70, "analysis": "...", "challenges": []},
            "competitive_moat": {"score": 60, "strengths": [], "weaknesses": []},
            "risks": [{"type": "market", "severity": "medium", "description": "..."}],
            "recommendation": "proceed|validate_further|pivot|kill",
            "next_steps": ["action 1", "action 2"]
        }
        """
        venture = await self._venture_service.get_venture_by_id(venture_id)

        # Build context for Claude
        prompt = f"""
        Evaluate this business venture:

        Name: {venture.name}
        Description: {venture.description}
        Target Customer: {venture.target_customer}
        Revenue Model: {venture.revenue_model}
        Market Size: {venture.tam_sam_som}
        Competition: {venture.competition_analysis}

        Provide comprehensive evaluation covering:
        1. Market Opportunity (score 0-100, TAM/SAM/SOM analysis, growth trends)
        2. Technical Feasibility (score 0-100, complexity, resources needed)
        3. Competitive Moat (score 0-100, defensibility, unique advantages)
        4. Key Risks (market, execution, financial, technical)
        5. Overall Score (0-100)
        6. Recommendation (proceed/validate_further/pivot/kill)
        7. Next Steps (3-5 specific actions)

        Format as JSON.
        """

        # Call Claude API
        evaluation = await self._call_claude(prompt)

        # Store evaluation as comment on venture
        await self._comment_service.add_comment(
            entity_type="venture",
            entity_id=venture_id,
            content=f"**AI Evaluation**\n\n{evaluation}",
            author_type="ai",
            author_name="Venture Evaluator"
        )

        return evaluation
```

### 2. Market Research Service (`turbo/core/services/market_research.py`)

**Purpose:** Automated competitive intelligence and market analysis

**Features:**
- Competitor discovery via WebSearch
- Market trend analysis
- Industry reports summarization
- TAM/SAM/SOM estimation

**Implementation:**
```python
class MarketResearchService:
    """Automated market research."""

    async def research_market(self, venture_id: UUID) -> dict:
        """
        Conduct market research for a venture.

        Returns:
        {
            "competitors": [
                {
                    "name": "Competitor A",
                    "description": "...",
                    "strengths": [],
                    "weaknesses": [],
                    "funding": "$10M Series A",
                    "url": "https://..."
                }
            ],
            "market_trends": ["trend 1", "trend 2"],
            "tam_sam_som_estimate": {"tam": "...", "reasoning": "..."},
            "customer_segments": [],
            "key_insights": []
        }
        """
        venture = await self._venture_service.get_venture_by_id(venture_id)

        # Search for competitors
        competitors_query = f"{venture.name} competitors alternatives"
        competitor_results = await self._web_search(competitors_query)

        # Search for market size
        market_size_query = f"{venture.target_customer} market size TAM SAM SOM"
        market_results = await self._web_search(market_size_query)

        # Ask Claude to analyze
        prompt = f"""
        Analyze this market research data for venture: {venture.name}

        Competitor Search Results:
        {competitor_results}

        Market Size Data:
        {market_results}

        Provide structured analysis as JSON with:
        - Top 5 competitors (name, description, strengths, weaknesses)
        - Market trends (5-7 key trends)
        - TAM/SAM/SOM estimates with reasoning
        - Customer segments
        - Key insights for positioning
        """

        research = await self._call_claude(prompt)

        # Update venture with research data
        await self._venture_service.update_venture(
            venture_id,
            BusinessVentureUpdate(
                competition_analysis=research["competitors"],
                tam_sam_som=research["tam_sam_som_estimate"],
                market_trends=research["market_trends"]
            )
        )

        return research
```

### 3. Venture Advisor (Staff Member)

**Purpose:** Dedicated AI advisor for strategic guidance

**Implementation:**
- Create staff member: "Venture Advisor" (handle: `@VentureAdvisor`)
- Persona: Seasoned entrepreneur, strategic thinker, pattern recognition
- Monitoring scope: All ventures
- Can be @ mentioned in venture comments for feedback

**Seed Data:**
```sql
INSERT INTO staff (id, handle, full_name, role, role_type, persona, monitoring_scope, is_active)
VALUES (
    uuid_generate_v4(),
    'VentureAdvisor',
    'Venture Advisor',
    'Strategic Advisor',
    'domain_expert',
    'You are a seasoned entrepreneur and venture advisor with 20+ years building and scaling startups. You excel at pattern recognition, identifying market opportunities, and providing honest, actionable feedback. You ask probing questions to uncover assumptions and help founders think through their strategy. You balance optimism with pragmatism.',
    '{"entity_types": ["venture"], "workspaces": ["personal", "work"]}',
    true
);
```

### 4. Inspiration Feed System

**Purpose:** AI-powered idea recommendations and connections

**Features:**
- Semantic search for related ventures
- "You might also like" suggestions
- Trend-based opportunities
- Skill-based recommendations

**Implementation:**
```python
class InspirationService:
    """AI-powered inspiration and recommendations."""

    async def get_related_ventures(self, venture_id: UUID, limit: int = 5) -> list:
        """Find semantically related ventures."""
        return await self._kg_service.get_related_entities(
            entity_type="venture",
            entity_id=venture_id,
            limit=limit
        )

    async def suggest_opportunities(self, user_skills: list[str]) -> list:
        """Suggest venture opportunities based on user skills/interests."""

        # Get current trends via WebSearch
        trends_query = "emerging technology trends 2025 startup opportunities"
        trends = await self._web_search(trends_query)

        prompt = f"""
        User Skills: {user_skills}

        Current Trends:
        {trends}

        Suggest 5 business venture opportunities that:
        1. Match user's skill set
        2. Align with emerging trends
        3. Have clear revenue potential
        4. Can be started with limited capital

        For each, provide: name, tagline, target customer, revenue model, why it's timely.
        """

        suggestions = await self._call_claude(prompt)
        return suggestions
```

---

## Frontend Implementation

### 1. API Client (`frontend/lib/api/business-ventures.ts`)

```typescript
import { apiClient } from './client';

export interface BusinessVenture {
  id: string;
  venture_key: string;
  venture_number: number;
  name: string;
  tagline?: string;
  description: string;
  status: 'ideation' | 'validation' | 'development' | 'launch' | 'active' | 'paused' | 'cancelled';
  stage: 'concept' | 'mvp' | 'beta' | 'launched';
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_customer?: string;
  tam_sam_som?: {
    tam?: string;
    sam?: string;
    som?: string;
  };
  competition_analysis?: string;
  market_trends?: any;
  revenue_model?: string;
  estimated_costs?: number;
  key_metrics?: any;
  unit_economics?: any;
  validation_status: string;
  experiments?: any;
  learnings?: string;
  pivot_history?: any;
  financial_projections?: any;
  ideation_date?: string;
  validation_date?: string;
  launch_date?: string;
  target_date?: string;
  project_id?: string;
  workspace: string;
  work_company?: string;
  created_at: string;
  updated_at: string;
  tag_count: number;
  document_count: number;
  issue_count: number;
}

export interface BusinessVentureCreate {
  name: string;
  tagline?: string;
  description: string;
  status?: string;
  stage?: string;
  priority?: string;
  target_customer?: string;
  tam_sam_som?: any;
  revenue_model?: string;
  estimated_costs?: number;
  project_id?: string;
  tag_ids?: string[];
  workspace?: string;
}

export const businessVenturesApi = {
  list: async (params?: {
    status?: string;
    stage?: string;
    workspace?: string;
    limit?: number;
  }): Promise<BusinessVenture[]> => {
    const response = await apiClient.get('/business-ventures', { params });
    return response.data;
  },

  get: async (id: string): Promise<BusinessVenture> => {
    const response = await apiClient.get(`/business-ventures/${id}`);
    return response.data;
  },

  create: async (data: BusinessVentureCreate): Promise<BusinessVenture> => {
    const response = await apiClient.post('/business-ventures', data);
    return response.data;
  },

  update: async (id: string, data: Partial<BusinessVentureCreate>): Promise<BusinessVenture> => {
    const response = await apiClient.put(`/business-ventures/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/business-ventures/${id}`);
  },

  evaluate: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/business-ventures/${id}/evaluate`);
    return response.data;
  },

  research: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/business-ventures/${id}/research`);
    return response.data;
  },
};
```

### 2. React Hook (`frontend/hooks/use-business-ventures.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessVenturesApi, BusinessVentureCreate } from '@/lib/api/business-ventures';
import { toast } from 'sonner';

export function useBusinessVentures(params?: { status?: string; stage?: string; workspace?: string }) {
  return useQuery({
    queryKey: ['business-ventures', params],
    queryFn: () => businessVenturesApi.list(params),
  });
}

export function useBusinessVenture(id: string) {
  return useQuery({
    queryKey: ['business-ventures', id],
    queryFn: () => businessVenturesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateBusinessVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BusinessVentureCreate) => businessVenturesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-ventures'] });
      toast.success('Business venture created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create venture');
    },
  });
}

export function useUpdateBusinessVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessVentureCreate> }) =>
      businessVenturesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-ventures'] });
      queryClient.invalidateQueries({ queryKey: ['business-ventures', variables.id] });
      toast.success('Business venture updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update venture');
    },
  });
}

export function useDeleteBusinessVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => businessVenturesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-ventures'] });
      toast.success('Business venture deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete venture');
    },
  });
}

export function useEvaluateVenture() {
  return useMutation({
    mutationFn: (id: string) => businessVenturesApi.evaluate(id),
    onSuccess: () => {
      toast.success('Venture evaluation complete');
    },
  });
}

export function useResearchVenture() {
  return useMutation({
    mutationFn: (id: string) => businessVenturesApi.research(id),
    onSuccess: () => {
      toast.success('Market research complete');
    },
  });
}
```

### 3. Ventures List Page (`frontend/app/ventures/page.tsx`)

**Features:**
- Filter by status, stage, workspace
- View modes: Table, Kanban board, Grid
- Quick capture button
- AI evaluation indicators
- Search and sorting

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Ventures                               [+ New Venture] │
├─────────────────────────────────────────────────────────┤
│  Filters: [All] [Ideation] [Validation] [Development]  │
│  View: [Table] [Board] [Grid]        🔍 Search...      │
├─────────────────────────────────────────────────────────┤
│  VENTURE-1  |  SaaS Dashboard Tool      | Validation   │
│  VENTURE-2  |  Data Pipeline Platform   | Ideation     │
│  VENTURE-3  |  Mobile Fitness App       | Development  │
└─────────────────────────────────────────────────────────┘
```

### 4. Venture Detail Page (`frontend/app/ventures/[id]/page.tsx`)

**Tabs:**
1. **Overview**
   - Basic info, tagline, description
   - Status indicators
   - Quick actions (Evaluate, Research, Graduate to Project)

2. **Market Analysis**
   - Target customer profile
   - TAM/SAM/SOM
   - Competition analysis
   - Market trends
   - [Run Market Research] button

3. **Business Model**
   - Revenue model
   - Unit economics
   - Key metrics
   - Cost structure
   - Financial projections

4. **Validation**
   - Experiments list (hypothesis, results, learnings)
   - Validation status
   - Pivot history
   - [Add Experiment] button

5. **Implementation**
   - Linked issues (if project-linked)
   - Development milestones
   - Launch checklist

6. **AI Insights**
   - Evaluation score and analysis
   - Risk assessment
   - Recommendations
   - Strategic feedback from advisor
   - [Get AI Feedback] button

### 5. Components

**`frontend/components/ventures/venture-card.tsx`**
- Card display for grid view
- Status badge, priority indicator
- Quick actions menu
- AI score indicator

**`frontend/components/ventures/venture-form.tsx`**
- Create/edit form with tabs
- Validation
- Auto-save drafts

**`frontend/components/ventures/lifecycle-board.tsx`**
- Kanban board by lifecycle stage
- Drag-and-drop to change status
- Columns: Ideation | Validation | Development | Launch | Active

**`frontend/components/ventures/evaluation-panel.tsx`**
- Display AI evaluation results
- Score visualization (radial chart)
- Risk matrix
- Recommendations list

**`frontend/components/ventures/experiment-tracker.tsx`**
- List experiments
- Add/edit experiment modal
- Status tracking (planned, running, completed)
- Results visualization

---

## Implementation Phases

### Phase 1: Core Backend (Priority: Critical)
**Time: 2-3 hours**

**Tasks:**
- [ ] Create migration SQL (`migrations/027_add_business_ventures.sql`)
- [ ] Define BusinessVenture model (`turbo/core/models/business_venture.py`)
- [ ] Update associations.py with venture tables
- [ ] Create BusinessVentureRepository
- [ ] Create Pydantic schemas (Base, Create, Update, Response)
- [ ] Create BusinessVentureService
- [ ] Create API endpoints (`turbo/api/v1/endpoints/business_ventures.py`)
- [ ] Add dependency injection functions
- [ ] Update KeyGeneratorService for "venture" entity type
- [ ] Register router in v1/__init__.py
- [ ] Export all new classes in __init__.py files
- [ ] Run migration

**Validation:**
```bash
# Test API
curl http://localhost:8000/api/v1/business-ventures
```

### Phase 2: MCP Integration (Priority: Critical)
**Time: 1 hour**

**Tasks:**
- [ ] Add MCP tools to `turbo/mcp_server.py`:
  - `list_business_ventures`
  - `get_business_venture`
  - `create_business_venture`
  - `update_business_venture`
  - `delete_business_venture`
  - `get_venture_by_key`
- [ ] Test MCP tools from Claude Code

**Validation:**
```python
# From Claude Code
mcp__turbo__create_business_venture(
    name="Test Venture",
    description="Test",
    revenue_model="subscription"
)
```

### Phase 3: AI Intelligence (Priority: High)
**Time: 2-3 hours**

**Tasks:**
- [ ] Create VentureEvaluationService
- [ ] Create MarketResearchService
- [ ] Add evaluation endpoint `/ventures/{id}/evaluate`
- [ ] Add research endpoint `/ventures/{id}/research`
- [ ] Create Venture Advisor staff member (seed data)
- [ ] Add MCP tools for evaluation/research
- [ ] Create InspirationService for recommendations

**Validation:**
- Evaluate a test venture
- Run market research
- @ mention VentureAdvisor in comment

### Phase 4: Validation & Experiments (Priority: Medium)
**Time: 1-2 hours**

**Tasks:**
- [ ] Design experiment tracking structure (JSONB vs separate table)
- [ ] Add experiment CRUD operations
- [ ] Create validation workflow helpers
- [ ] Add pivot tracking logic
- [ ] Create experiment API endpoints

### Phase 5: Frontend Foundation (Priority: High)
**Time: 2-3 hours**

**Tasks:**
- [ ] Create API client (`frontend/lib/api/business-ventures.ts`)
- [ ] Create React hooks (`frontend/hooks/use-business-ventures.ts`)
- [ ] Create ventures list page (`frontend/app/ventures/page.tsx`)
- [ ] Create venture detail page (`frontend/app/ventures/[id]/page.tsx`)
- [ ] Add "Ventures" to sidebar navigation
- [ ] Create VentureCard component
- [ ] Create VentureForm component

**Validation:**
- Can list ventures
- Can create venture via form
- Can view venture details

### Phase 6: Advanced Frontend (Priority: Medium)
**Time: 2-3 hours**

**Tasks:**
- [ ] Create lifecycle Kanban board
- [ ] Create evaluation panel component
- [ ] Create experiment tracker component
- [ ] Add AI insights panel
- [ ] Add market analysis tab
- [ ] Add business model tab
- [ ] Add quick capture modal
- [ ] Integrate with unified create modal

### Phase 7: Lifecycle & Promotion (Priority: Medium)
**Time: 1-2 hours**

**Tasks:**
- [ ] Create "Graduate to Project" workflow
- [ ] Auto-generate project from validated venture
- [ ] Create initial issues from venture experiments
- [ ] Add launch checklist generator
- [ ] Create portfolio analytics endpoint

### Phase 8: Polish & Optimization (Priority: Low)
**Time: 1-2 hours**

**Tasks:**
- [ ] Add venture templates (SaaS, Marketplace, etc.)
- [ ] Create onboarding flow for first venture
- [ ] Add keyboard shortcuts
- [ ] Optimize database queries
- [ ] Add loading states and animations
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Documentation updates

---

## File-by-File Implementation Guide

### Backend Files to Create

1. **`migrations/027_add_business_ventures.sql`** (~150 lines)
2. **`turbo/core/models/business_venture.py`** (~200 lines)
3. **`turbo/core/repositories/business_venture.py`** (~150 lines)
4. **`turbo/core/schemas/business_venture.py`** (~200 lines)
5. **`turbo/core/services/business_venture.py`** (~300 lines)
6. **`turbo/core/services/venture_evaluation.py`** (~200 lines)
7. **`turbo/core/services/market_research.py`** (~200 lines)
8. **`turbo/core/services/inspiration.py`** (~150 lines)
9. **`turbo/api/v1/endpoints/business_ventures.py`** (~250 lines)

### Backend Files to Modify

1. **`turbo/core/models/associations.py`** (add venture tables)
2. **`turbo/core/models/__init__.py`** (export BusinessVenture)
3. **`turbo/core/repositories/__init__.py`** (export repo)
4. **`turbo/core/schemas/__init__.py`** (export schemas)
5. **`turbo/core/services/__init__.py`** (export services)
6. **`turbo/api/dependencies.py`** (add DI functions)
7. **`turbo/api/v1/__init__.py`** (register router)
8. **`turbo/mcp_server.py`** (add MCP tools ~200 lines)
9. **`turbo/core/services/key_generator.py`** (add "venture" type)

### Frontend Files to Create

1. **`frontend/lib/api/business-ventures.ts`** (~150 lines)
2. **`frontend/hooks/use-business-ventures.ts`** (~100 lines)
3. **`frontend/app/ventures/page.tsx`** (~300 lines)
4. **`frontend/app/ventures/[id]/page.tsx`** (~400 lines)
5. **`frontend/components/ventures/venture-card.tsx`** (~150 lines)
6. **`frontend/components/ventures/venture-form.tsx`** (~300 lines)
7. **`frontend/components/ventures/lifecycle-board.tsx`** (~250 lines)
8. **`frontend/components/ventures/evaluation-panel.tsx`** (~200 lines)
9. **`frontend/components/ventures/experiment-tracker.tsx`** (~200 lines)
10. **`frontend/components/ventures/market-analysis-tab.tsx`** (~150 lines)
11. **`frontend/components/ventures/business-model-tab.tsx`** (~150 lines)

### Frontend Files to Modify

1. **`frontend/components/layout/sidebar.tsx`** (add Ventures nav item)
2. **`frontend/components/unified-create/unified-create-modal.tsx`** (add venture option)

---

## API Specifications

### Endpoints

```
GET    /api/v1/business-ventures
POST   /api/v1/business-ventures
GET    /api/v1/business-ventures/{id}
PUT    /api/v1/business-ventures/{id}
DELETE /api/v1/business-ventures/{id}
GET    /api/v1/business-ventures/key/{key}
POST   /api/v1/business-ventures/{id}/evaluate
POST   /api/v1/business-ventures/{id}/research
POST   /api/v1/business-ventures/{id}/graduate
GET    /api/v1/business-ventures/{id}/experiments
POST   /api/v1/business-ventures/{id}/experiments
GET    /api/v1/business-ventures/analytics/portfolio
```

### Example Requests

**Create Venture:**
```json
POST /api/v1/business-ventures
{
  "name": "SaaS Dashboard Platform",
  "tagline": "Analytics for modern teams",
  "description": "A real-time analytics dashboard...",
  "status": "ideation",
  "stage": "concept",
  "priority": "high",
  "target_customer": "B2B SaaS companies with 10-50 employees",
  "revenue_model": "subscription",
  "estimated_costs": 50000,
  "tam_sam_som": {
    "tam": "$50B global analytics market",
    "sam": "$5B mid-market segment",
    "som": "$500M addressable via PLG"
  },
  "workspace": "personal",
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Update Venture:**
```json
PUT /api/v1/business-ventures/{id}
{
  "status": "validation",
  "validation_status": "testing",
  "experiments": {
    "experiments": [
      {
        "id": "exp-001",
        "name": "Landing page test",
        "hypothesis": "5% conversion rate achievable",
        "status": "running",
        "start_date": "2025-10-30"
      }
    ]
  }
}
```

**Evaluate Venture:**
```json
POST /api/v1/business-ventures/{id}/evaluate

Response:
{
  "overall_score": 75,
  "market_opportunity": {
    "score": 80,
    "analysis": "Large addressable market...",
    "reasoning": "..."
  },
  "technical_feasibility": {
    "score": 70,
    "challenges": ["Real-time data processing", "Scalability"]
  },
  "competitive_moat": {
    "score": 60,
    "strengths": ["First-mover in niche", "Technical expertise"],
    "weaknesses": ["Low switching costs", "Easy to replicate"]
  },
  "risks": [
    {
      "type": "market",
      "severity": "medium",
      "description": "Crowded market with established players"
    }
  ],
  "recommendation": "validate_further",
  "next_steps": [
    "Build landing page and test demand",
    "Interview 20 target customers",
    "Analyze top 3 competitors' pricing"
  ]
}
```

---

## MCP Tools

### Core CRUD Tools

```python
# List ventures with filters
mcp__turbo__list_business_ventures(
    status="validation",
    stage="mvp",
    workspace="personal",
    limit=10
)

# Get venture by ID
mcp__turbo__get_business_venture(venture_id="uuid")

# Get venture by key
mcp__turbo__get_business_venture_by_key(venture_key="VENTURE-1")

# Create venture
mcp__turbo__create_business_venture(
    name="Mobile Fitness App",
    description="Personalized workout plans...",
    target_customer="Fitness enthusiasts 25-40",
    revenue_model="subscription",
    workspace="personal"
)

# Update venture
mcp__turbo__update_business_venture(
    venture_id="uuid",
    status="development",
    stage="mvp",
    key_metrics={"daily_active_users": 100}
)

# Delete venture
mcp__turbo__delete_business_venture(venture_id="uuid")
```

### AI-Powered Tools

```python
# Evaluate venture viability
mcp__turbo__evaluate_business_venture(venture_id="uuid")

# Run market research
mcp__turbo__research_business_venture(venture_id="uuid")

# Get inspiration/recommendations
mcp__turbo__get_venture_inspiration(
    user_skills=["Python", "ML", "Data Engineering"],
    limit=5
)

# Get related ventures
mcp__turbo__get_related_ventures(venture_id="uuid", limit=5)
```

### Lifecycle Tools

```python
# Graduate venture to project
mcp__turbo__graduate_venture_to_project(
    venture_id="uuid",
    create_issues=True  # Auto-create implementation issues
)

# Add experiment
mcp__turbo__add_venture_experiment(
    venture_id="uuid",
    name="Landing page test",
    hypothesis="5% conversion achievable",
    method="Create landing page with Mailchimp",
    success_criteria="100 signups in 2 weeks"
)

# Update experiment results
mcp__turbo__update_venture_experiment(
    venture_id="uuid",
    experiment_id="exp-001",
    status="completed",
    results={"signups": 127, "conversion_rate": 0.0635},
    learnings="Exceeded target. Mobile app preferred."
)

# Track pivot
mcp__turbo__add_venture_pivot(
    venture_id="uuid",
    reason="Customer feedback: mobile-first approach needed",
    changes="Changing from web to mobile app focus",
    date="2025-11-01"
)
```

---

## Success Metrics

### User Experience Metrics
- **Capture Speed:** < 30 seconds to create basic venture
- **AI Evaluation Time:** < 10 seconds for comprehensive analysis
- **Market Research Time:** < 30 seconds for competitor/trend data
- **Navigation:** < 2 clicks to any venture feature

### System Health Metrics
- **API Response Time:** < 200ms for list, < 100ms for get
- **Database Query Time:** < 50ms for complex queries with relations
- **AI Service Uptime:** > 99%
- **Search Relevance:** > 80% semantic search accuracy

### Business Metrics
- **Adoption:** % of users who create at least 1 venture
- **Engagement:** Average ventures per active user
- **Conversion:** % of ventures that graduate to projects
- **AI Utilization:** % of ventures that use evaluation/research
- **Portfolio Health:** Average time spent in each lifecycle stage

### Quality Metrics
- **Completion Rate:** % of ventures with all sections filled
- **Validation Rate:** % of ventures that reach validation stage
- **Launch Rate:** % of validated ventures that launch
- **Pivot Rate:** % of ventures that pivot based on learnings

---

## Future Enhancements

### Phase 9: Advanced Features (Future)

**Collaboration:**
- Share ventures with co-founders
- Real-time collaborative editing
- Permission levels (view, edit, admin)
- Activity feed

**Financial Modeling:**
- Advanced revenue projections (3-5 years)
- Scenario modeling (best/worst/likely)
- Break-even analysis
- Fundraising calculator
- Cap table tracker

**Integration:**
- Import from Notion/Airtable
- Export to pitch deck generator
- Connect to accounting tools (QuickBooks, Xero)
- CRM integration for customer development

**Templates & Frameworks:**
- Business Model Canvas templates
- Lean Canvas templates
- Validation playbooks by industry
- Launch checklists by venture type

**Analytics & Reporting:**
- Portfolio dashboard (all ventures overview)
- Funnel analytics (conversion rates between stages)
- Time-in-stage analysis
- Success pattern recognition

**Voice & Mobile:**
- Voice-to-text idea capture
- Mobile app for on-the-go capture
- Photo attachment (whiteboard sessions)
- Offline mode

---

## Conclusion

This Business Ventures system transforms Turbo into a comprehensive entrepreneurial platform for capturing the spark of inspiration and systematically validating, building, and launching business ideas.

**Key Differentiators:**
- **AI-First:** Evaluation, research, and strategic feedback at every step
- **Full Lifecycle:** Seamless journey from idea to launched business
- **Validation-Focused:** Structured experiment framework prevents waste
- **Portfolio View:** Track multiple ideas simultaneously
- **Project Integration:** Natural progression to execution

**Implementation Priority:**
1. Core backend + MCP (Phases 1-2) - Get data flowing
2. AI intelligence (Phase 3) - Unlock unique value
3. Frontend foundation (Phase 5) - Make it usable
4. Lifecycle & polish (Phases 6-8) - Complete the experience

**Estimated Total Effort:** 12-15 hours of focused development

This system will help you capture every entrepreneurial spark and systematically evaluate which ideas have billion-dollar potential.
