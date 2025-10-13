"""Milestone repository implementation."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from turbo.core.models.milestone import Milestone
from turbo.core.repositories.base import BaseRepository
from turbo.core.schemas.milestone import MilestoneCreate, MilestoneUpdate


class MilestoneRepository(BaseRepository[Milestone, MilestoneCreate, MilestoneUpdate]):
    """Repository for milestone data access."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Milestone)

    async def get_by_project(self, project_id: UUID) -> list[Milestone]:
        """Get milestones by project ID."""
        stmt = select(self._model).where(self._model.project_id == project_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_status(self, status: str) -> list[Milestone]:
        """Get milestones by status."""
        stmt = select(self._model).where(self._model.status == status)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_issues(self, id: UUID) -> Milestone | None:
        """Get milestone with its issues loaded."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.issues))
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_tags(self, id: UUID) -> Milestone | None:
        """Get milestone with its tags loaded."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.tags))
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_documents(self, id: UUID) -> Milestone | None:
        """Get milestone with its documents loaded."""
        stmt = (
            select(self._model)
            .options(selectinload(self._model.documents))
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_all_relations(self, id: UUID) -> Milestone | None:
        """Get milestone with all relations loaded."""
        stmt = (
            select(self._model)
            .options(
                selectinload(self._model.issues),
                selectinload(self._model.tags),
                selectinload(self._model.documents),
                selectinload(self._model.project),
            )
            .where(self._model.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()