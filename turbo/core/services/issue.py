"""Issue service for business logic operations."""

from typing import List, Optional
from uuid import UUID

from turbo.core.repositories.issue import IssueRepository
from turbo.core.repositories.project import ProjectRepository
from turbo.core.schemas.issue import (
    IssueCreate,
    IssueUpdate,
    IssueResponse,
)
from turbo.utils.exceptions import IssueNotFoundError, ProjectNotFoundError


class IssueService:
    """Service for issue business logic."""

    def __init__(
        self,
        issue_repository: IssueRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self._issue_repository = issue_repository
        self._project_repository = project_repository

    async def create_issue(self, issue_data: IssueCreate) -> IssueResponse:
        """Create a new issue."""
        # Verify project exists
        project = await self._project_repository.get_by_id(issue_data.project_id)
        if not project:
            raise ProjectNotFoundError(issue_data.project_id)

        issue = await self._issue_repository.create(issue_data)
        return IssueResponse.model_validate(issue)

    async def get_issue_by_id(self, issue_id: UUID) -> IssueResponse:
        """Get issue by ID."""
        issue = await self._issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def get_all_issues(
        self,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[IssueResponse]:
        """Get all issues with optional pagination."""
        issues = await self._issue_repository.get_all(limit=limit, offset=offset)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def update_issue(
        self,
        issue_id: UUID,
        update_data: IssueUpdate
    ) -> IssueResponse:
        """Update an issue."""
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def delete_issue(self, issue_id: UUID) -> bool:
        """Delete an issue."""
        success = await self._issue_repository.delete(issue_id)
        if not success:
            raise IssueNotFoundError(issue_id)
        return success

    async def assign_issue(self, issue_id: UUID, assignee: str) -> IssueResponse:
        """Assign an issue to someone."""
        update_data = IssueUpdate(assignee=assignee)
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def unassign_issue(self, issue_id: UUID) -> IssueResponse:
        """Remove assignee from an issue."""
        update_data = IssueUpdate(assignee=None)
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def close_issue(self, issue_id: UUID) -> IssueResponse:
        """Close an issue."""
        update_data = IssueUpdate(status="closed")
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def reopen_issue(self, issue_id: UUID) -> IssueResponse:
        """Reopen a closed issue."""
        update_data = IssueUpdate(status="open")
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def start_work_on_issue(self, issue_id: UUID) -> IssueResponse:
        """Mark issue as in progress."""
        update_data = IssueUpdate(status="in_progress")
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return IssueResponse.model_validate(issue)

    async def get_issues_by_project(self, project_id: UUID) -> List[IssueResponse]:
        """Get all issues for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_by_project(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_issues_by_status(self, status: str) -> List[IssueResponse]:
        """Get issues by status."""
        issues = await self._issue_repository.get_by_status(status)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_issues_by_assignee(self, assignee: str) -> List[IssueResponse]:
        """Get issues assigned to a specific person."""
        issues = await self._issue_repository.get_by_assignee(assignee)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_open_issues(self) -> List[IssueResponse]:
        """Get all open issues."""
        issues = await self._issue_repository.get_open_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_closed_issues(self) -> List[IssueResponse]:
        """Get all closed issues."""
        issues = await self._issue_repository.get_closed_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_unassigned_issues(self) -> List[IssueResponse]:
        """Get issues without assignee."""
        issues = await self._issue_repository.get_unassigned_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_high_priority_issues(self) -> List[IssueResponse]:
        """Get high priority and critical issues."""
        issues = await self._issue_repository.get_high_priority_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def search_issues(self, title_pattern: str) -> List[IssueResponse]:
        """Search issues by title pattern."""
        issues = await self._issue_repository.search_by_title(title_pattern)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_project_open_issues(self, project_id: UUID) -> List[IssueResponse]:
        """Get open issues for a specific project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_project_open_issues(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_project_closed_issues(self, project_id: UUID) -> List[IssueResponse]:
        """Get closed issues for a specific project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_project_closed_issues(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]