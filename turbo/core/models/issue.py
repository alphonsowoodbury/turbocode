"""Issue model definition."""

from typing import Optional

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from turbo.core.database.base import Base
from turbo.core.models.associations import issue_tags


class Issue(Base):
    """Issue model representing a task, bug, or feature request."""

    __tablename__ = "issues"

    # Required fields
    title = Column(String(200), nullable=False, index=True)
    description = Column(String, nullable=False)
    type = Column(String(20), nullable=False, default="task")
    status = Column(String(20), nullable=False, default="open", index=True)
    priority = Column(String(10), default="medium")

    # Optional fields
    assignee = Column(String(255), nullable=True)  # Email address

    # Foreign keys
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    project = relationship("Project", back_populates="issues")

    tags = relationship(
        "Tag", secondary=issue_tags, back_populates="issues", lazy="select"
    )

    def __repr__(self) -> str:
        """String representation of the issue."""
        return f"<Issue(id={self.id}, title='{self.title}')>"
