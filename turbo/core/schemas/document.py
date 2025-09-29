"""Document Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class DocumentBase(BaseModel):
    """Base document schema with common fields."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    type: str = Field(
        default="specification",
        pattern="^(specification|user_guide|api_doc|readme|changelog|requirements|design|other)$",
    )
    format: str = Field(default="markdown", pattern="^(markdown|html|text|pdf|docx)$")
    version: str | None = Field(None, max_length=20)
    author: EmailStr | None = None

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

    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = Field(None, min_length=1)
    type: str | None = Field(
        None,
        pattern="^(specification|user_guide|api_doc|readme|changelog|requirements|design|other)$",
    )
    format: str | None = Field(None, pattern="^(markdown|html|text|pdf|docx)$")
    version: str | None = Field(None, max_length=20)
    author: EmailStr | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        """Validate document title."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        """Validate document content."""
        if v is not None and not v.strip():
            raise ValueError("Content cannot be empty or whitespace")
        return v


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
    version: str | None = None
    author: str | None = None

    model_config = ConfigDict(from_attributes=True)
