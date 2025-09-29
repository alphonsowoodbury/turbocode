"""Project Pydantic schemas."""

import re
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, ConfigDict


class ProjectBase(BaseModel):
    """Base project schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    status: str = Field(default="active", pattern="^(active|on_hold|completed|archived)$")
    completion_percentage: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)

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

    is_archived: Optional[bool] = Field(default=False)


class ProjectUpdate(BaseModel):
    """Schema for updating projects (all fields optional)."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    status: Optional[str] = Field(None, pattern="^(active|on_hold|completed|archived)$")
    completion_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    is_archived: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate project name."""
        if v is not None and not v.strip():
            raise ValueError("Name cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate project description."""
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty or whitespace")
        return v.strip() if v else v


class ProjectResponse(ProjectBase):
    """Schema for project API responses."""

    id: UUID
    is_archived: bool
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