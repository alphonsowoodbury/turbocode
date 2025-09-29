"""Project service for business logic operations."""

from typing import Dict, List, Optional, Any
from uuid import UUID

from turbo.core.repositories.project import ProjectRepository
from turbo.core.repositories.issue import IssueRepository
from turbo.core.repositories.document import DocumentRepository
from turbo.core.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithStats,
)
from turbo.utils.exceptions import ProjectNotFoundError


class ProjectService:
    """Service for project business logic."""

    def __init__(
        self,
        project_repository: ProjectRepository,
        issue_repository: IssueRepository,
        document_repository: DocumentRepository,
    ) -> None:
        self._project_repository = project_repository
        self._issue_repository = issue_repository
        self._document_repository = document_repository

    async def create_project(self, project_data: ProjectCreate) -> ProjectResponse:
        """Create a new project."""
        project = await self._project_repository.create(project_data)
        return ProjectResponse.model_validate(project)

    async def get_project_by_id(self, project_id: UUID) -> ProjectResponse:
        """Get project by ID."""
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)
        return ProjectResponse.model_validate(project)

    async def get_all_projects(
        self, limit: Optional[int] = None, offset: Optional[int] = None
    ) -> List[ProjectResponse]:
        """Get all projects with optional pagination."""
        projects = await self._project_repository.get_all(limit=limit, offset=offset)
        return [ProjectResponse.model_validate(project) for project in projects]

    async def update_project(
        self, project_id: UUID, update_data: ProjectUpdate
    ) -> ProjectResponse:
        """Update a project."""
        project = await self._project_repository.update(project_id, update_data)
        if not project:
            raise ProjectNotFoundError(project_id)
        return ProjectResponse.model_validate(project)

    async def delete_project(self, project_id: UUID) -> bool:
        """Delete a project."""
        success = await self._project_repository.delete(project_id)
        if not success:
            raise ProjectNotFoundError(project_id)
        return success

    async def archive_project(self, project_id: UUID) -> ProjectResponse:
        """Archive a project."""
        update_data = ProjectUpdate(is_archived=True)
        return await self.update_project(project_id, update_data)

    async def unarchive_project(self, project_id: UUID) -> ProjectResponse:
        """Unarchive a project."""
        update_data = ProjectUpdate(is_archived=False)
        return await self.update_project(project_id, update_data)

    async def get_project_statistics(self, project_id: UUID) -> Dict[str, Any]:
        """Get project statistics including issue counts and completion rates."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        # Get project issues
        issues = await self._issue_repository.get_by_project(project_id)

        # Calculate statistics
        total_issues = len(issues)
        open_issues = len([issue for issue in issues if issue.status == "open"])
        closed_issues = len([issue for issue in issues if issue.status == "closed"])
        in_progress_issues = len(
            [issue for issue in issues if issue.status == "in_progress"]
        )

        completion_rate = 0.0
        if total_issues > 0:
            completion_rate = (closed_issues / total_issues) * 100

        return {
            "project_id": project_id,
            "total_issues": total_issues,
            "open_issues": open_issues,
            "closed_issues": closed_issues,
            "in_progress_issues": in_progress_issues,
            "completion_rate": completion_rate,
        }

    async def get_project_with_stats(self, project_id: UUID) -> ProjectWithStats:
        """Get project with statistics included."""
        # Get basic project info
        project_response = await self.get_project_by_id(project_id)

        # Get statistics
        stats = await self.get_project_statistics(project_id)

        # Combine into ProjectWithStats
        return ProjectWithStats(
            **project_response.model_dump(),
            total_issues=stats["total_issues"],
            open_issues=stats["open_issues"],
            closed_issues=stats["closed_issues"],
            completion_rate=stats["completion_rate"],
        )

    async def get_projects_by_status(self, status: str) -> List[ProjectResponse]:
        """Get projects by status."""
        projects = await self._project_repository.get_by_status(status)
        return [ProjectResponse.model_validate(project) for project in projects]

    async def get_active_projects(
        self, limit: Optional[int] = None, offset: Optional[int] = None
    ) -> List[ProjectResponse]:
        """Get active (non-archived) projects."""
        projects = await self._project_repository.get_active(limit=limit, offset=offset)
        return [ProjectResponse.model_validate(project) for project in projects]

    async def get_archived_projects(
        self, limit: Optional[int] = None, offset: Optional[int] = None
    ) -> List[ProjectResponse]:
        """Get archived projects."""
        projects = await self._project_repository.get_archived(
            limit=limit, offset=offset
        )
        return [ProjectResponse.model_validate(project) for project in projects]

    async def search_projects(self, name_pattern: str) -> List[ProjectResponse]:
        """Search projects by name pattern."""
        projects = await self._project_repository.search_by_name(name_pattern)
        return [ProjectResponse.model_validate(project) for project in projects]

    async def get_high_priority_projects(self) -> List[ProjectResponse]:
        """Get high priority and critical projects."""
        projects = await self._project_repository.get_high_priority_projects()
        return [ProjectResponse.model_validate(project) for project in projects]

    async def update_project_completion(
        self, project_id: UUID, completion_percentage: float
    ) -> ProjectResponse:
        """Update project completion percentage."""
        update_data = ProjectUpdate(completion_percentage=completion_percentage)
        return await self.update_project(project_id, update_data)
