"""Document model definition."""

from typing import Optional

from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from turbo.core.database.base import Base


class Document(Base):
    """Document model representing project documentation."""

    __tablename__ = "documents"

    # Required fields
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="specification")
    format = Column(String(20), nullable=False, default="markdown")

    # Optional fields
    version = Column(String(20), nullable=True)
    author = Column(String(255), nullable=True)  # Email address

    # Foreign keys
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Relationships
    project = relationship("Project", back_populates="documents")

    def __repr__(self) -> str:
        """String representation of the document."""
        return f"<Document(id={self.id}, title='{self.title}')>"