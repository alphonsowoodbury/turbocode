"""SQLAlchemy declarative base and base model."""

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import declared_attr


class BaseModel:
    """Base model with common fields and functionality."""

    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        return cls.__name__.lower() + "s"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        """String representation of the model."""
        if hasattr(self, 'name'):
            return f"<{self.__class__.__name__}(id={self.id}, name='{self.name}')>"
        elif hasattr(self, 'title'):
            return f"<{self.__class__.__name__}(id={self.id}, title='{self.title}')>"
        else:
            return f"<{self.__class__.__name__}(id={self.id})>"

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }


# Create the declarative base with our custom base class
Base = declarative_base(cls=BaseModel)