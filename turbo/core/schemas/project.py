"""Project Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectBase(BaseModel):
    """Base project schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    status: str = Field(
        default="active", pattern="^(active|on_hold|completed|archived)$"
    )
    completion_percentage: float | None = Field(default=0.0, ge=0.0, le=100.0)
    workspace: str = Field(default="personal", pattern="^(personal|freelance|work)$")
    work_company: str | None = Field(default=None, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate project name."""
        if not v.strip():
            raise ValueError("Name cannot be empty or whitespace")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        """Validate project description."""
        if not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip()


class ProjectCreate(ProjectBase):
    """Schema for creating new projects."""

    is_archived: bool | None = Field(default=False)


class ProjectUpdate(BaseModel):
    """Schema for updating projects (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, min_length=1)
    priority: str | None = Field(None, pattern="^(low|medium|high|critical)$")
    status: str | None = Field(None, pattern="^(active|on_hold|completed|archived)$")
    completion_percentage: float | None = Field(None, ge=0.0, le=100.0)
    is_archived: bool | None = None
    workspace: str | None = Field(None, pattern="^(personal|freelance|work)$")
    work_company: str | None = Field(None, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        """Validate project name."""
        if v is not None and not v.strip():
            raise ValueError("Name cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str | None) -> str | None:
        """Validate project description."""
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip() if v else v


class ProjectResponse(ProjectBase):
    """Schema for project API responses."""

    id: UUID
    is_archived: bool
    workspace: str
    work_company: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectWithStats(ProjectResponse):
    """Project response with additional statistics."""

    total_issues: int = 0
    open_issues: int = 0
    closed_issues: int = 0
    completion_rate: float = 0.0


class ProjectSummary(BaseModel):
    """Summary information about a project."""

    id: UUID
    name: str
    status: str
    priority: str
    completion_percentage: float
    total_issues: int

    model_config = ConfigDict(from_attributes=True)
