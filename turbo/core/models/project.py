"""Project model definition."""


from sqlalchemy import Boolean, Column, Float, String
from sqlalchemy.orm import relationship

from turbo.core.database.base import Base
from turbo.core.models.associations import project_blueprints, project_tags


class Project(Base):
    """Project model representing a development project."""

    __tablename__ = "projects"

    # Required fields
    name = Column(String(100), nullable=False, index=True)
    description = Column(String, nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)

    # Optional fields
    priority = Column(String(10), default="medium")
    completion_percentage = Column(Float, default=0.0)
    is_archived = Column(Boolean, default=False, index=True)

    # Relationships
    issues = relationship(
        "Issue", back_populates="project", cascade="all, delete-orphan", lazy="dynamic"
    )

    documents = relationship(
        "Document",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    tags = relationship(
        "Tag", secondary=project_tags, back_populates="projects", lazy="select"
    )

    blueprints = relationship(
        "Blueprint", secondary=project_blueprints, back_populates="projects", lazy="select"
    )

    milestones = relationship(
        "Milestone",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    initiatives = relationship(
        "Initiative",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    terminal_sessions = relationship(
        "TerminalSession",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        """String representation of the project."""
        return f"<Project(id={self.id}, name='{self.name}')>"
