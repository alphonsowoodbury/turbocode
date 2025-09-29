"""Pydantic schemas for API request/response validation."""

from turbo.core.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
)
from turbo.core.schemas.issue import (
    IssueCreate,
    IssueResponse,
    IssueUpdate,
)
from turbo.core.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectWithStats,
)
from turbo.core.schemas.tag import (
    TagCreate,
    TagResponse,
    TagUpdate,
)

__all__ = [
    "DocumentCreate",
    "DocumentResponse",
    "DocumentUpdate",
    "IssueCreate",
    "IssueResponse",
    "IssueUpdate",
    "ProjectCreate",
    "ProjectResponse",
    "ProjectUpdate",
    "ProjectWithStats",
    "TagCreate",
    "TagResponse",
    "TagUpdate",
]
