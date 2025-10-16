"""Issue model definition."""


from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from turbo.core.database.base import Base
from turbo.core.models.associations import initiative_issues, issue_tags, milestone_issues


class Issue(Base):
    """Issue model representing a task, bug, or feature request."""

    __tablename__ = "issues"

    # Required fields
    title = Column(String(200), nullable=False, index=True)
    description = Column(String, nullable=False)
    type = Column(String(20), nullable=False, default="task")
    status = Column(String(20), nullable=False, default="open", index=True)
    discovery_status = Column(String(20), nullable=True, index=True)  # For discovery issues
    priority = Column(String(10), default="medium")

    # Optional fields
    assignee = Column(String(255), nullable=True)  # Email address
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=True)  # User email or "AI: model_name"

    # Foreign keys
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,  # Optional for discovery issues
        index=True,
    )

    # Relationships
    project = relationship("Project", back_populates="issues")

    tags = relationship(
        "Tag", secondary=issue_tags, back_populates="issues", lazy="select"
    )

    milestones = relationship(
        "Milestone", secondary=milestone_issues, back_populates="issues", lazy="select"
    )

    initiatives = relationship(
        "Initiative", secondary=initiative_issues, back_populates="issues", lazy="select"
    )

    terminal_sessions = relationship(
        "TerminalSession",
        back_populates="issue",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        """String representation of the issue."""
        return f"<Issue(id={self.id}, title='{self.title}')>"
