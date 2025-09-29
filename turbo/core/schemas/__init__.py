"""Pydantic schemas for API request/response validation."""

from turbo.core.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithStats,
)
from turbo.core.schemas.issue import (
    IssueCreate,
    IssueUpdate,
    IssueResponse,
)
from turbo.core.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
)
from turbo.core.schemas.tag import (
    TagCreate,
    TagUpdate,
    TagResponse,
)

__all__ = [
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectWithStats",
    "IssueCreate",
    "IssueUpdate",
    "IssueResponse",
    "DocumentCreate",
    "DocumentUpdate",
    "DocumentResponse",
    "TagCreate",
    "TagUpdate",
    "TagResponse",
]