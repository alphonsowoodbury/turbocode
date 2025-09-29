"""Document service for business logic operations."""

from typing import List, Optional, Dict, Any
from uuid import UUID

from turbo.core.repositories.document import DocumentRepository
from turbo.core.repositories.project import ProjectRepository
from turbo.core.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
)
from turbo.utils.exceptions import DocumentNotFoundError, ProjectNotFoundError


class DocumentService:
    """Service for document business logic."""

    def __init__(
        self,
        document_repository: DocumentRepository,
        project_repository: ProjectRepository,
    ) -> None:
        self._document_repository = document_repository
        self._project_repository = project_repository

    async def create_document(self, document_data: DocumentCreate) -> DocumentResponse:
        """Create a new document."""
        # Verify project exists
        project = await self._project_repository.get_by_id(document_data.project_id)
        if not project:
            raise ProjectNotFoundError(document_data.project_id)

        document = await self._document_repository.create(document_data)
        return DocumentResponse.model_validate(document)

    async def get_document_by_id(self, document_id: UUID) -> DocumentResponse:
        """Get document by ID."""
        document = await self._document_repository.get_by_id(document_id)
        if not document:
            raise DocumentNotFoundError(document_id)
        return DocumentResponse.model_validate(document)

    async def get_all_documents(
        self,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[DocumentResponse]:
        """Get all documents with optional pagination."""
        documents = await self._document_repository.get_all(limit=limit, offset=offset)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def update_document(
        self,
        document_id: UUID,
        update_data: DocumentUpdate
    ) -> DocumentResponse:
        """Update a document."""
        document = await self._document_repository.update(document_id, update_data)
        if not document:
            raise DocumentNotFoundError(document_id)
        return DocumentResponse.model_validate(document)

    async def delete_document(self, document_id: UUID) -> bool:
        """Delete a document."""
        success = await self._document_repository.delete(document_id)
        if not success:
            raise DocumentNotFoundError(document_id)
        return success

    async def get_documents_by_project(self, project_id: UUID) -> List[DocumentResponse]:
        """Get all documents for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        documents = await self._document_repository.get_by_project(project_id)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def get_documents_by_type(self, document_type: str) -> List[DocumentResponse]:
        """Get documents by type."""
        documents = await self._document_repository.get_by_type(document_type)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def get_documents_by_author(self, author: str) -> List[DocumentResponse]:
        """Get documents by author."""
        documents = await self._document_repository.get_by_author(author)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def search_documents(self, search_term: str) -> List[DocumentResponse]:
        """Search documents by title and content."""
        # Search by title
        title_results = await self._document_repository.search_by_title(search_term)

        # Search by content
        content_results = await self._document_repository.search_by_content(search_term)

        # Combine and deduplicate results
        all_documents = {doc.id: doc for doc in title_results + content_results}

        return [DocumentResponse.model_validate(document) for document in all_documents.values()]

    async def get_project_specifications(self, project_id: UUID) -> List[DocumentResponse]:
        """Get specification documents for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        documents = await self._document_repository.get_project_specifications(project_id)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def get_project_documentation(self, project_id: UUID) -> List[DocumentResponse]:
        """Get documentation documents for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        documents = await self._document_repository.get_project_documentation(project_id)
        return [DocumentResponse.model_validate(document) for document in documents]

    async def get_latest_document_version(
        self,
        project_id: UUID,
        document_type: str
    ) -> Optional[DocumentResponse]:
        """Get the latest version of a document type for a project."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        document = await self._document_repository.get_latest_version(project_id, document_type)
        if document:
            return DocumentResponse.model_validate(document)
        return None

    async def get_recent_documents(
        self,
        limit: int = 10,
        project_id: Optional[UUID] = None
    ) -> List[DocumentResponse]:
        """Get recently updated documents."""
        if project_id:
            # Verify project exists
            project = await self._project_repository.get_by_id(project_id)
            if not project:
                raise ProjectNotFoundError(project_id)

        documents = await self._document_repository.get_recent_documents(
            limit=limit,
            project_id=project_id
        )
        return [DocumentResponse.model_validate(document) for document in documents]

    async def generate_document_from_template(
        self,
        project_id: UUID,
        template_name: str,
        context: Dict[str, Any]
    ) -> DocumentResponse:
        """Generate a document from a template with context."""
        # Verify project exists
        project = await self._project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)

        # This would integrate with the template engine
        # For now, create a basic document
        generated_content = self._generate_from_template(template_name, context)

        document_data = DocumentCreate(
            title=generated_content["title"],
            content=generated_content["content"],
            type="specification",
            format="markdown",
            project_id=project_id
        )

        document = await self._document_repository.create(document_data)
        return DocumentResponse.model_validate(document)

    def _generate_from_template(self, template_name: str, context: Dict[str, Any]) -> Dict[str, str]:
        """Generate content from template (placeholder implementation)."""
        # This would be replaced with actual template engine integration
        if template_name == "technical_spec":
            return {
                "title": f"Technical Specification for {context.get('project_name', 'Project')}",
                "content": f"# Technical Specification\n\nProject: {context.get('project_name', 'Unknown')}\nAuthor: {context.get('author', 'Unknown')}\n\n## Overview\n\nThis is a generated technical specification."
            }
        else:
            return {
                "title": "Generated Document",
                "content": f"# Generated Document\n\nTemplate: {template_name}\nContext: {context}"
            }