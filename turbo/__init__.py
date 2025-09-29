"""Turbo: AI-powered local project management and development platform.

Turbo is a local-first project management platform that integrates with Claude Code
to provide AI-assisted development workflows, automated documentation generation,
and intelligent project insights.
"""

__version__ = "1.0.0"
__author__ = "Turbo Development Team"
__email__ = "dev@turbo.local"

# Public API exports
from turbo.core.models import Project, Issue, Document
from turbo.core.schemas import (
    ProjectCreate,
    ProjectResponse,
    IssueCreate,
    IssueResponse,
)

__all__ = [
    "__version__",
    "Project",
    "Issue",
    "Document",
    "ProjectCreate",
    "ProjectResponse",
    "IssueCreate",
    "IssueResponse",
]
