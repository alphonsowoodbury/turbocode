"""Comment database model."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from turbo.core.models.base import Base


class Comment(Base):
    """Comment model for issue discussions."""

    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    issue_id: Mapped[UUID] = mapped_column(ForeignKey("issues.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    author_type: Mapped[str] = mapped_column(
        String(10), nullable=False, default="user"
    )  # 'user' or 'ai'
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship
    issue: Mapped["Issue"] = relationship("Issue", back_populates="comments")

    def __repr__(self) -> str:
        """String representation."""
        return f"<Comment(id={self.id}, issue_id={self.issue_id}, author={self.author_name})>"
