"""Issue Pydantic schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict


class IssueBase(BaseModel):
    """Base issue schema with common fields."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    type: str = Field(
        default="task", pattern="^(feature|bug|task|enhancement|documentation)$"
    )
    status: str = Field(
        default="open", pattern="^(open|in_progress|review|testing|closed)$"
    )
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    assignee: Optional[EmailStr] = None

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

    project_id: UUID


class IssueUpdate(BaseModel):
    """Schema for updating issues (all fields optional)."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    type: Optional[str] = Field(
        None, pattern="^(feature|bug|task|enhancement|documentation)$"
    )
    status: Optional[str] = Field(
        None, pattern="^(open|in_progress|review|testing|closed)$"
    )
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    assignee: Optional[EmailStr] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate issue title."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate issue description."""
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip() if v else v


class IssueResponse(IssueBase):
    """Schema for issue API responses."""

    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IssueSummary(BaseModel):
    """Summary information about an issue."""

    id: UUID
    title: str
    type: str
    status: str
    priority: str
    assignee: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
