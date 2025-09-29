"""API dependency injection."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.database import get_db_session
from turbo.core.repositories import (
    ProjectRepository,
    IssueRepository,
    DocumentRepository,
    TagRepository,
)
from turbo.core.services import (
    ProjectService,
    IssueService,
    DocumentService,
    TagService,
)


# Repository dependencies
def get_project_repository(
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRepository:
    """Get project repository."""
    return ProjectRepository(session)


def get_issue_repository(
    session: AsyncSession = Depends(get_db_session),
) -> IssueRepository:
    """Get issue repository."""
    return IssueRepository(session)


def get_document_repository(
    session: AsyncSession = Depends(get_db_session),
) -> DocumentRepository:
    """Get document repository."""
    return DocumentRepository(session)


def get_tag_repository(
    session: AsyncSession = Depends(get_db_session),
) -> TagRepository:
    """Get tag repository."""
    return TagRepository(session)


# Service dependencies
def get_project_service(
    project_repo: ProjectRepository = Depends(get_project_repository),
    issue_repo: IssueRepository = Depends(get_issue_repository),
    document_repo: DocumentRepository = Depends(get_document_repository),
) -> ProjectService:
    """Get project service."""
    return ProjectService(project_repo, issue_repo, document_repo)


def get_issue_service(
    issue_repo: IssueRepository = Depends(get_issue_repository),
    project_repo: ProjectRepository = Depends(get_project_repository),
) -> IssueService:
    """Get issue service."""
    return IssueService(issue_repo, project_repo)


def get_document_service(
    document_repo: DocumentRepository = Depends(get_document_repository),
    project_repo: ProjectRepository = Depends(get_project_repository),
) -> DocumentService:
    """Get document service."""
    return DocumentService(document_repo, project_repo)


def get_tag_service(
    tag_repo: TagRepository = Depends(get_tag_repository),
) -> TagService:
    """Get tag service."""
    return TagService(tag_repo)
