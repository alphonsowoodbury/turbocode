"""Document Pydantic schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict


class DocumentBase(BaseModel):
    """Base document schema with common fields."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    type: str = Field(
        default="specification",
        pattern="^(specification|user_guide|api_doc|readme|changelog|requirements|design|other)$"
    )
    format: str = Field(
        default="markdown",
        pattern="^(markdown|html|text|pdf|docx)$"
    )
    version: Optional[str] = Field(None, max_length=20)
    author: Optional[EmailStr] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate document title."""
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip()

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        """Validate document content."""
        if not v.strip():
            raise ValueError("Content cannot be empty or whitespace")
        return v


class DocumentCreate(DocumentBase):
    """Schema for creating new documents."""

    project_id: UUID


class DocumentUpdate(BaseModel):
    """Schema for updating documents (all fields optional)."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    type: Optional[str] = Field(
        None,
        pattern="^(specification|user_guide|api_doc|readme|changelog|requirements|design|other)$"
    )
    format: Optional[str] = Field(
        None,
        pattern="^(markdown|html|text|pdf|docx)$"
    )
    version: Optional[str] = Field(None, max_length=20)
    author: Optional[EmailStr] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate document title."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: Optional[str]) -> Optional[str]:
        """Validate document content."""
        if v is not None and not v.strip():
            raise ValueError("Content cannot be empty or whitespace")
        return v if v else v


class DocumentResponse(DocumentBase):
    """Schema for document API responses."""

    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentSummary(BaseModel):
    """Summary information about a document."""

    id: UUID
    title: str
    type: str
    format: str
    version: Optional[str] = None
    author: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)