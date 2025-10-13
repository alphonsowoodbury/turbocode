"""Issue service for business logic operations."""

import logging
from uuid import UUID

from turbo.core.repositories.issue import IssueRepository
from turbo.core.repositories.issue_dependency import IssueDependencyRepository
from turbo.core.repositories.milestone import MilestoneRepository
from turbo.core.repositories.project import ProjectRepository
from turbo.core.schemas.issue import (
    IssueCreate,
    IssueResponse,
    IssueUpdate,
)
from turbo.core.schemas.graph import GraphNodeCreate
from turbo.core.services.graph import GraphService
from turbo.utils.config import get_settings
from turbo.utils.exceptions import IssueNotFoundError, ProjectNotFoundError

logger = logging.getLogger(__name__)


class IssueService:
    """Service for issue business logic."""

    def __init__(
        self,
        issue_repository: IssueRepository,
        project_repository: ProjectRepository,
        milestone_repository: MilestoneRepository,
        dependency_repository: IssueDependencyRepository,
    ) -> None:
        self._issue_repository = issue_repository
        self._project_repository = project_repository
        self._milestone_repository = milestone_repository
        self._dependency_repository = dependency_repository
        self._settings = get_settings()

    async def _index_issue_in_graph(self, issue) -> None:
        """
        Index an issue in the knowledge graph for semantic search.

        This is called automatically when issues are created or updated.
        Failures are logged but don't affect the main operation.

        Args:
            issue: The issue model instance to index
        """
        # Only index if graph is enabled
        if not self._settings.graph.enabled:
            return

        try:
            # Build content string from issue data
            content_parts = [
                f"Title: {issue.title}",
                f"\nDescription:\n{issue.description}",
                f"\nType: {issue.type}",
                f"Status: {issue.status}",
                f"Priority: {issue.priority}",
            ]

            if issue.assignee:
                content_parts.append(f"Assignee: {issue.assignee}")

            if issue.discovery_status:
                content_parts.append(f"Discovery Status: {issue.discovery_status}")

            content = "\n".join(content_parts)

            # Create node data for graph
            node_data = GraphNodeCreate(
                entity_id=issue.id,
                entity_type="issue",
                content=content,
                metadata={
                    "title": issue.title,
                    "type": issue.type,
                    "status": issue.status,
                    "priority": issue.priority,
                    "project_id": str(issue.project_id) if issue.project_id else None,
                },
            )

            # Index in graph
            graph_service = GraphService()
            try:
                await graph_service.add_episode(node_data)
                logger.debug(f"Indexed issue {issue.id} in knowledge graph")
            finally:
                await graph_service.close()

        except Exception as e:
            # Log error but don't fail the main operation
            logger.warning(f"Failed to index issue {issue.id} in knowledge graph: {e}")

    async def _enrich_issue_with_dependencies(self, issue) -> IssueResponse:
        """Helper to enrich an issue with dependency information."""
        issue_response = IssueResponse.model_validate(issue)
        deps = await self._dependency_repository.get_all_dependencies(issue.id)
        issue_response.blocking = deps["blocking"]
        issue_response.blocked_by = deps["blocked_by"]
        return issue_response

    async def create_issue(self, issue_data: IssueCreate) -> IssueResponse:
        """Create a new issue."""
        # Validate project_id requirements
        if issue_data.type == "discovery":
            # Discovery issues can exist without a project
            if issue_data.project_id:
                # If project_id provided, verify it exists
                project = await self._project_repository.get_by_id(issue_data.project_id)
                if not project:
                    raise ProjectNotFoundError(issue_data.project_id)
        else:
            # Non-discovery issues require a project
            if not issue_data.project_id:
                raise ValueError("Non-discovery issues must be associated with a project")
            project = await self._project_repository.get_by_id(issue_data.project_id)
            if not project:
                raise ProjectNotFoundError(issue_data.project_id)

        # Validate discovery status
        if issue_data.type == "discovery" and not issue_data.discovery_status:
            # Set default discovery_status for discovery issues
            issue_data.discovery_status = "proposed"
        elif issue_data.type != "discovery" and issue_data.discovery_status:
            # Clear discovery_status for non-discovery issues
            issue_data.discovery_status = None

        # Extract milestone IDs before creating the issue
        milestone_ids = issue_data.milestone_ids

        # Create issue without milestone_ids field
        issue_dict = issue_data.model_dump(exclude={"milestone_ids"})
        issue = await self._issue_repository.create(IssueCreate(**issue_dict))

        # Commit the issue first
        await self._issue_repository._session.commit()
        await self._issue_repository._session.refresh(issue)

        # Handle milestone associations after commit
        if milestone_ids:
            # Reload issue to get the relationships collection
            await self._issue_repository._session.refresh(issue, ["milestones"])
            for milestone_id in milestone_ids:
                milestone = await self._milestone_repository.get_by_id(milestone_id)
                if milestone:
                    issue.milestones.append(milestone)
            await self._issue_repository._session.commit()
            await self._issue_repository._session.refresh(issue)

        # Index in knowledge graph for semantic search
        await self._index_issue_in_graph(issue)

        return IssueResponse.model_validate(issue)

    async def get_issue_by_id(self, issue_id: UUID) -> IssueResponse:
        """Get issue by ID with dependencies."""
        issue = await self._issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError(issue_id)
        return await self._enrich_issue_with_dependencies(issue)

    async def get_all_issues(
        self, limit: int | None = None, offset: int | None = None
    ) -> list[IssueResponse]:
        """Get all issues with optional pagination."""
        issues = await self._issue_repository.get_all(limit=limit, offset=offset)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def update_issue(
        self, issue_id: UUID, update_data: IssueUpdate
    ) -> IssueResponse:
        """Update an issue."""
        issue = await self._issue_repository.get_by_id(issue_id)
        if not issue:
            raise IssueNotFoundError(issue_id)

        # Update basic fields
        issue = await self._issue_repository.update(issue_id, update_data)
        if not issue:
            raise IssueNotFoundError(issue_id)

        # Handle milestone associations
        if update_data.milestone_ids is not None:
            issue.milestones.clear()
            for milestone_id in update_data.milestone_ids:
                milestone = await self._milestone_repository.get_by_id(milestone_id)
                if milestone:
                    issue.milestones.append(milestone)
            await self._issue_repository._session.commit()
            await self._issue_repository._session.refresh(issue)

        # Re-index in knowledge graph to update search
        await self._index_issue_in_graph(issue)

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

    async def get_issues_by_project(self, project_id: UUID) -> list[IssueResponse]:
        """Get all issues for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_by_project(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_issues_by_status(self, status: str) -> list[IssueResponse]:
        """Get issues by status."""
        issues = await self._issue_repository.get_by_status(status)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_issues_by_assignee(self, assignee: str) -> list[IssueResponse]:
        """Get issues assigned to a specific person."""
        issues = await self._issue_repository.get_by_assignee(assignee)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_open_issues(self) -> list[IssueResponse]:
        """Get all open issues."""
        issues = await self._issue_repository.get_open_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_closed_issues(self) -> list[IssueResponse]:
        """Get all closed issues."""
        issues = await self._issue_repository.get_closed_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_unassigned_issues(self) -> list[IssueResponse]:
        """Get issues without assignee."""
        issues = await self._issue_repository.get_unassigned_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_high_priority_issues(self) -> list[IssueResponse]:
        """Get high priority and critical issues."""
        issues = await self._issue_repository.get_high_priority_issues()
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def search_issues(self, title_pattern: str) -> list[IssueResponse]:
        """Search issues by title pattern."""
        issues = await self._issue_repository.search_by_title(title_pattern)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_project_open_issues(self, project_id: UUID) -> list[IssueResponse]:
        """Get open issues for a specific project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_project_open_issues(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]

    async def get_project_closed_issues(self, project_id: UUID) -> list[IssueResponse]:
        """Get closed issues for a specific project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        issues = await self._issue_repository.get_project_closed_issues(project_id)
        return [IssueResponse.model_validate(issue) for issue in issues]
