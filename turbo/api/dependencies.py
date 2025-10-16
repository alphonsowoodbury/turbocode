"""API dependency injection."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.database import get_db_session
from turbo.core.repositories import (
    DocumentRepository,
    InitiativeRepository,
    IssueDependencyRepository,
    IssueRepository,
    MilestoneRepository,
    ProjectRepository,
    TagRepository,
)
from turbo.core.repositories.mentor import MentorRepository
from turbo.core.repositories.mentor_conversation import MentorConversationRepository
from turbo.core.services import (
    DocumentService,
    InitiativeService,
    IssueService,
    MilestoneService,
    ProjectService,
    TagService,
)
from turbo.core.services.mentor import MentorService
from turbo.core.services.mentor_context import MentorContextService


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


def get_milestone_repository(
    session: AsyncSession = Depends(get_db_session),
) -> MilestoneRepository:
    """Get milestone repository."""
    return MilestoneRepository(session)


def get_initiative_repository(
    session: AsyncSession = Depends(get_db_session),
) -> InitiativeRepository:
    """Get initiative repository."""
    return InitiativeRepository(session)


def get_issue_dependency_repository(
    session: AsyncSession = Depends(get_db_session),
) -> IssueDependencyRepository:
    """Get issue dependency repository."""
    return IssueDependencyRepository(session)


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
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
    dependency_repo: IssueDependencyRepository = Depends(get_issue_dependency_repository),
) -> IssueService:
    """Get issue service."""
    return IssueService(issue_repo, project_repo, milestone_repo, dependency_repo)


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


def get_milestone_service(
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
    project_repo: ProjectRepository = Depends(get_project_repository),
    issue_repo: IssueRepository = Depends(get_issue_repository),
    tag_repo: TagRepository = Depends(get_tag_repository),
    document_repo: DocumentRepository = Depends(get_document_repository),
) -> MilestoneService:
    """Get milestone service."""
    return MilestoneService(
        milestone_repo, project_repo, issue_repo, tag_repo, document_repo
    )


def get_initiative_service(
    initiative_repo: InitiativeRepository = Depends(get_initiative_repository),
    project_repo: ProjectRepository = Depends(get_project_repository),
    issue_repo: IssueRepository = Depends(get_issue_repository),
    tag_repo: TagRepository = Depends(get_tag_repository),
    document_repo: DocumentRepository = Depends(get_document_repository),
) -> InitiativeService:
    """Get initiative service."""
    return InitiativeService(
        initiative_repo, project_repo, issue_repo, tag_repo, document_repo
    )


# Mentor repository dependencies
def get_mentor_repository(
    session: AsyncSession = Depends(get_db_session),
) -> MentorRepository:
    """Get mentor repository."""
    return MentorRepository(session)


def get_mentor_conversation_repository(
    session: AsyncSession = Depends(get_db_session),
) -> MentorConversationRepository:
    """Get mentor conversation repository."""
    return MentorConversationRepository(session)


# Mentor service dependencies
def get_mentor_context_service(
    project_repo: ProjectRepository = Depends(get_project_repository),
    issue_repo: IssueRepository = Depends(get_issue_repository),
    document_repo: DocumentRepository = Depends(get_document_repository),
) -> MentorContextService:
    """Get mentor context service."""
    return MentorContextService(project_repo, issue_repo, document_repo)


def get_mentor_service(
    mentor_repo: MentorRepository = Depends(get_mentor_repository),
    conversation_repo: MentorConversationRepository = Depends(get_mentor_conversation_repository),
    context_service: MentorContextService = Depends(get_mentor_context_service),
) -> MentorService:
    """Get mentor service."""
    return MentorService(mentor_repo, conversation_repo, context_service)
