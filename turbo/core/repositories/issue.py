"""Issue repository implementation."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from turbo.core.models.issue import Issue
from turbo.core.repositories.base import BaseRepository
from turbo.core.schemas.issue import IssueCreate, IssueUpdate


class IssueRepository(BaseRepository[Issue, IssueCreate, IssueUpdate]):
    """Repository for issue data access."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Issue)

    async def get_by_project(self, project_id: UUID) -> list[Issue]:
        """Get issues by project ID."""
        stmt = select(self._model).where(self._model.project_id == project_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_status(self, status: str) -> list[Issue]:
        """Get issues by status."""
        stmt = select(self._model).where(self._model.status == status)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_type(self, issue_type: str) -> list[Issue]:
        """Get issues by type."""
        stmt = select(self._model).where(self._model.type == issue_type)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_assignee(self, assignee: str) -> list[Issue]:
        """Get issues by assignee."""
        stmt = select(self._model).where(self._model.assignee == assignee)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_priority(self, priority: str) -> list[Issue]:
        """Get issues by priority."""
        stmt = select(self._model).where(self._model.priority == priority)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def search_by_title(self, title_pattern: str) -> list[Issue]:
        """Search issues by title pattern."""
        stmt = select(self._model).where(self._model.title.ilike(f"%{title_pattern}%"))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_open_issues(self) -> list[Issue]:
        """Get all open issues."""
        stmt = select(self._model).where(self._model.status == "open")
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_closed_issues(self) -> list[Issue]:
        """Get all closed issues."""
        stmt = select(self._model).where(self._model.status == "closed")
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_unassigned_issues(self) -> list[Issue]:
        """Get issues without assignee."""
        stmt = select(self._model).where(self._model.assignee.is_(None))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_high_priority_issues(self) -> list[Issue]:
        """Get high priority and critical issues."""
        stmt = select(self._model).where(self._model.priority.in_(["high", "critical"]))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_project_open_issues(self, project_id: UUID) -> list[Issue]:
        """Get open issues for a specific project."""
        stmt = select(self._model).where(
            (self._model.project_id == project_id) & (self._model.status == "open")
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_project_closed_issues(self, project_id: UUID) -> list[Issue]:
        """Get closed issues for a specific project."""
        stmt = select(self._model).where(
            (self._model.project_id == project_id) & (self._model.status == "closed")
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_project(self, id: UUID) -> Issue | None:
        """Get issue with its project loaded."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.project))
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_tags(self, id: UUID) -> Issue | None:
        """Get issue with its tags loaded."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.tags))
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
