"""Pydantic schemas for Blueprint operations."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BlueprintBase(BaseModel):
    """Base schema for blueprint data."""

    name: str = Field(..., min_length=1, max_length=200, description="Blueprint name")
    description: str = Field(..., min_length=1, description="Blueprint description")
    category: str = Field(
        ...,
        description="Blueprint category: architecture, testing, styling, database, api, deployment, custom",
    )
    content: dict[str, Any] = Field(
        default_factory=dict,
        description="Blueprint content (patterns, standards, rules, templates)",
    )
    version: str = Field(..., min_length=1, max_length=50, description="Blueprint version")
    is_active: bool = Field(True, description="Whether blueprint is active")


class BlueprintCreate(BlueprintBase):
    """Schema for creating new blueprints."""

    pass


class BlueprintUpdate(BaseModel):
    """Schema for updating blueprints."""

    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=1)
    category: str | None = None
    content: dict[str, Any] | None = None
    version: str | None = Field(None, max_length=50)
    is_active: bool | None = None


class BlueprintResponse(BlueprintBase):
    """Schema for blueprint API responses."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class BlueprintSummary(BaseModel):
    """Lightweight schema for blueprint lists."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    category: str
    version: str
    is_active: bool
