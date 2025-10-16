"""Custom exceptions for Turbo application."""

from uuid import UUID


class TurboBaseException(Exception):
    """Base exception for all Turbo-specific errors."""

    def __init__(self, message: str, error_code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code


class ResourceNotFoundError(TurboBaseException):
    """Base class for resource not found errors."""

    def __init__(
        self, resource_type: str, resource_id: UUID, error_code: str | None = None
    ) -> None:
        message = f"{resource_type} with ID {resource_id} not found"
        super().__init__(message, error_code)
        self.resource_type = resource_type
        self.resource_id = resource_id


class ProjectNotFoundError(ResourceNotFoundError):
    """Raised when a project cannot be found."""

    def __init__(self, project_id: UUID) -> None:
        super().__init__("Project", project_id, "PROJECT_NOT_FOUND")
        self.project_id = project_id


class IssueNotFoundError(ResourceNotFoundError):
    """Raised when an issue cannot be found."""

    def __init__(self, issue_id: UUID) -> None:
        super().__init__("Issue", issue_id, "ISSUE_NOT_FOUND")
        self.issue_id = issue_id


class DocumentNotFoundError(ResourceNotFoundError):
    """Raised when a document cannot be found."""

    def __init__(self, document_id: UUID) -> None:
        super().__init__("Document", document_id, "DOCUMENT_NOT_FOUND")
        self.document_id = document_id


class TagNotFoundError(ResourceNotFoundError):
    """Raised when a tag cannot be found."""

    def __init__(self, tag_id: UUID) -> None:
        super().__init__("Tag", tag_id, "TAG_NOT_FOUND")
        self.tag_id = tag_id


class MilestoneNotFoundError(ResourceNotFoundError):
    """Raised when a milestone cannot be found."""

    def __init__(self, milestone_id: UUID) -> None:
        super().__init__("Milestone", milestone_id, "MILESTONE_NOT_FOUND")
        self.milestone_id = milestone_id


class InitiativeNotFoundError(ResourceNotFoundError):
    """Raised when an initiative cannot be found."""

    def __init__(self, initiative_id: UUID) -> None:
        super().__init__("Initiative", initiative_id, "INITIATIVE_NOT_FOUND")
        self.initiative_id = initiative_id


class MentorNotFoundError(ResourceNotFoundError):
    """Raised when a mentor cannot be found."""

    def __init__(self, mentor_id: UUID) -> None:
        super().__init__("Mentor", mentor_id, "MENTOR_NOT_FOUND")
        self.mentor_id = mentor_id


class ResumeNotFoundError(ResourceNotFoundError):
    """Raised when a resume cannot be found."""

    def __init__(self, resume_id: UUID) -> None:
        super().__init__("Resume", resume_id, "RESUME_NOT_FOUND")
        self.resume_id = resume_id


class ResumeSectionNotFoundError(ResourceNotFoundError):
    """Raised when a resume section cannot be found."""

    def __init__(self, section_id: UUID) -> None:
        super().__init__("Resume Section", section_id, "RESUME_SECTION_NOT_FOUND")
        self.section_id = section_id


class DuplicateResourceError(TurboBaseException):
    """Raised when attempting to create a resource that already exists."""

    def __init__(self, resource_type: str, identifier: str) -> None:
        message = f"{resource_type} with {identifier} already exists"
        super().__init__(message, "DUPLICATE_RESOURCE")
        self.resource_type = resource_type
        self.identifier = identifier


class ValidationError(TurboBaseException):
    """Raised when data validation fails."""

    def __init__(self, message: str, field: str | None = None) -> None:
        super().__init__(message, "VALIDATION_ERROR")
        self.field = field


class ClaudeIntegrationError(TurboBaseException):
    """Raised when Claude integration fails."""

    def __init__(self, operation: str, details: str | None = None) -> None:
        message = f"Claude integration failed for operation: {operation}"
        if details:
            message += f" - {details}"
        super().__init__(message, "CLAUDE_INTEGRATION_ERROR")
        self.operation = operation
        self.details = details


class DatabaseError(TurboBaseException):
    """Raised when database operations fail."""

    def __init__(self, message: str, operation: str | None = None) -> None:
        super().__init__(message, "DATABASE_ERROR")
        self.operation = operation


class ConfigurationError(TurboBaseException):
    """Raised when configuration is invalid or missing."""

    def __init__(self, message: str, config_key: str | None = None) -> None:
        super().__init__(message, "CONFIGURATION_ERROR")
        self.config_key = config_key
