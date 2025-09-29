"""Document API endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from pydantic import BaseModel

from turbo.api.dependencies import get_document_service
from turbo.core.services import DocumentService
from turbo.core.schemas import DocumentCreate, DocumentUpdate, DocumentResponse
from turbo.utils.exceptions import (
    DocumentNotFoundError,
    ProjectNotFoundError,
    ValidationError as TurboValidationError,
)

router = APIRouter()


class TemplateRequest(BaseModel):
    """Request model for creating document from template."""

    template_name: str
    title: str
    project_id: UUID
    variables: dict = {}


class DuplicateRequest(BaseModel):
    """Request model for duplicating document."""

    title: str
    version: Optional[str] = None


class BulkDeleteRequest(BaseModel):
    """Request model for bulk delete operations."""

    document_ids: List[UUID]


class Template(BaseModel):
    """Template information model."""

    name: str
    description: str
    variables: List[str]


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_data: DocumentCreate,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Create a new document."""
    try:
        return await document_service.create_document(document_data)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {document_data.project_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID, document_service: DocumentService = Depends(get_document_service)
) -> DocumentResponse:
    """Get a document by ID."""
    try:
        return await document_service.get_document_by_id(document_id)
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )


@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    type_filter: Optional[str] = Query(None, alias="type"),
    format_filter: Optional[str] = Query(None, alias="format"),
    project_id: Optional[UUID] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=100),
    offset: Optional[int] = Query(None, ge=0),
    document_service: DocumentService = Depends(get_document_service),
) -> List[DocumentResponse]:
    """Get all documents with optional filtering."""
    if type_filter:
        return await document_service.get_documents_by_type(type_filter)
    elif format_filter:
        return await document_service.get_documents_by_format(format_filter)
    elif project_id:
        return await document_service.get_documents_by_project(project_id)
    else:
        return await document_service.get_all_documents(limit=limit, offset=offset)


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_data: DocumentUpdate,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Update a document."""
    try:
        return await document_service.update_document(document_id, document_data)
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID, document_service: DocumentService = Depends(get_document_service)
) -> None:
    """Delete a document."""
    try:
        await document_service.delete_document(document_id)
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )


@router.get("/search", response_model=List[DocumentResponse])
async def search_documents(
    query: str = Query(..., min_length=1),
    document_service: DocumentService = Depends(get_document_service),
) -> List[DocumentResponse]:
    """Search documents by title and content."""
    return await document_service.search_documents(query)


@router.get("/{document_id}/versions", response_model=List[dict])
async def get_document_versions(
    document_id: UUID, document_service: DocumentService = Depends(get_document_service)
) -> List[dict]:
    """Get document version history."""
    try:
        return await document_service.get_document_versions(document_id)
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )


@router.get("/{document_id}/export")
async def export_document(
    document_id: UUID,
    format: str = Query(..., pattern="^(pdf|html|docx|markdown)$"),
    document_service: DocumentService = Depends(get_document_service),
) -> Response:
    """Export document in different formats."""
    try:
        content, content_type = await document_service.export_document(
            document_id, format
        )

        # Set appropriate headers based on format
        headers = {}
        if format == "pdf":
            headers["Content-Disposition"] = (
                f"attachment; filename=document_{document_id}.pdf"
            )
        elif format == "docx":
            headers["Content-Disposition"] = (
                f"attachment; filename=document_{document_id}.docx"
            )

        return Response(content=content, media_type=content_type, headers=headers)
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}",
        )


@router.post(
    "/from-template",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_document_from_template(
    template_request: TemplateRequest,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Create a document from a template."""
    try:
        return await document_service.create_document_from_template(
            template_request.template_name,
            template_request.title,
            template_request.project_id,
            template_request.variables,
        )
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {template_request.project_id} not found",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/templates", response_model=List[Template])
async def get_available_templates(
    document_service: DocumentService = Depends(get_document_service),
) -> List[Template]:
    """Get available document templates."""
    templates_data = await document_service.get_available_templates()
    return [
        Template(
            name=template["name"],
            description=template["description"],
            variables=template["variables"],
        )
        for template in templates_data
    ]


@router.post(
    "/{document_id}/duplicate",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def duplicate_document(
    document_id: UUID,
    duplicate_request: DuplicateRequest,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Duplicate a document."""
    try:
        return await document_service.duplicate_document(
            document_id, duplicate_request.title, duplicate_request.version
        )
    except DocumentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found",
        )


@router.post("/bulk-delete", response_model=dict)
async def bulk_delete_documents(
    bulk_request: BulkDeleteRequest,
    document_service: DocumentService = Depends(get_document_service),
) -> dict:
    """Bulk delete documents."""
    try:
        deleted_count = await document_service.bulk_delete_documents(
            bulk_request.document_ids
        )
        return {"deleted_count": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
