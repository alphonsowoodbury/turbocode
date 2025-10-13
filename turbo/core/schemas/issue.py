"""Issue Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class IssueBase(BaseModel):
    """Base issue schema with common fields."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    type: str = Field(
        default="task", pattern="^(feature|bug|task|enhancement|documentation|discovery)$"
    )
    status: str = Field(
        default="open", pattern="^(open|in_progress|review|testing|closed)$"
    )
    discovery_status: str | None = Field(
        default=None, pattern="^(proposed|researching|findings_ready|approved|parked|declined)$"
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    assignee: EmailStr | None = None
    due_date: datetime | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate issue title."""
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        """Validate issue description."""
        if not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip()


class IssueCreate(IssueBase):
    """Schema for creating new issues."""

    project_id: UUID | None = None  # Optional for discovery issues
    milestone_ids: list[UUID] | None = Field(default=None)


class IssueUpdate(BaseModel):
    """Schema for updating issues (all fields optional)."""

    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=1)
    type: str | None = Field(
        None, pattern="^(feature|bug|task|enhancement|documentation|discovery)$"
    )
    status: str | None = Field(
        None, pattern="^(open|in_progress|review|testing|closed)$"
    )
    discovery_status: str | None = Field(
        None, pattern="^(proposed|researching|findings_ready|approved|parked|declined)$"
    )
    priority: str | None = Field(None, pattern="^(low|medium|high|critical)$")
    assignee: EmailStr | None = None
    due_date: datetime | None = None
    milestone_ids: list[UUID] | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        """Validate issue title."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str | None) -> str | None:
        """Validate issue description."""
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip() if v else v


class IssueResponse(IssueBase):
    """Schema for issue API responses."""

    id: UUID
    project_id: UUID | None  # Optional for discovery issues
    created_at: datetime
    updated_at: datetime
    blocking: list[UUID] = []  # Issues that block this one
    blocked_by: list[UUID] = []  # Issues that this one blocks

    model_config = ConfigDict(from_attributes=True)

    @field_validator("discovery_status", mode="before")
    @classmethod
    def set_discovery_status_default(cls, v: str | None, info) -> str | None:
        """Set default discovery_status for discovery issues."""
        # If this is a discovery issue and discovery_status is None, default to "proposed"
        if info.data.get("type") == "discovery" and v is None:
            return "proposed"
        return v


class IssueSummary(BaseModel):
    """Summary information about an issue."""

    id: UUID
    title: str
    type: str
    status: str
    priority: str
    assignee: str | None = None

    model_config = ConfigDict(from_attributes=True)
