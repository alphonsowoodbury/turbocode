"""Project API endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import ValidationError

from turbo.api.dependencies import get_project_service
from turbo.core.services import ProjectService
from turbo.core.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithStats,
    IssueResponse,
    DocumentResponse,
)
from turbo.utils.exceptions import (
    ProjectNotFoundError,
    DuplicateResourceError,
    ValidationError as TurboValidationError,
)

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    """Create a new project."""
    try:
        return await project_service.create_project(project_data)
    except DuplicateResourceError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> ProjectResponse:
    """Get a project by ID."""
    try:
        return await project_service.get_project_by_id(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=100),
    offset: Optional[int] = Query(None, ge=0),
    project_service: ProjectService = Depends(get_project_service),
) -> List[ProjectResponse]:
    """Get all projects with optional filtering."""
    if status_filter:
        return await project_service.get_projects_by_status(status_filter)
    elif priority:
        return await project_service.get_projects_by_priority(priority)
    else:
        return await project_service.get_all_projects(limit=limit, offset=offset)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    """Update a project."""
    try:
        return await project_service.update_project(project_id, project_data)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> None:
    """Delete a project."""
    try:
        await project_service.delete_project(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.post("/{project_id}/archive", response_model=ProjectResponse)
async def archive_project(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> ProjectResponse:
    """Archive a project."""
    try:
        return await project_service.archive_project(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.get("/{project_id}/stats", response_model=dict)
async def get_project_statistics(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> dict:
    """Get project statistics."""
    try:
        return await project_service.get_project_statistics(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.get("/search", response_model=List[ProjectResponse])
async def search_projects(
    query: str = Query(..., min_length=1),
    project_service: ProjectService = Depends(get_project_service),
) -> List[ProjectResponse]:
    """Search projects by name."""
    return await project_service.search_projects_by_name(query)


@router.get("/{project_id}/issues", response_model=List[IssueResponse])
async def get_project_issues(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> List[IssueResponse]:
    """Get all issues for a project."""
    try:
        return await project_service.get_project_issues(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.get("/{project_id}/documents", response_model=List[DocumentResponse])
async def get_project_documents(
    project_id: UUID, project_service: ProjectService = Depends(get_project_service)
) -> List[DocumentResponse]:
    """Get all documents for a project."""
    try:
        return await project_service.get_project_documents(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )


@router.post("/{project_id}/tags/{tag_id}", response_model=ProjectResponse)
async def add_tag_to_project(
    project_id: UUID,
    tag_id: UUID,
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectResponse:
    """Add a tag to a project."""
    try:
        return await project_service.add_tag_to_project(project_id, tag_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{project_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_from_project(
    project_id: UUID,
    tag_id: UUID,
    project_service: ProjectService = Depends(get_project_service),
) -> None:
    """Remove a tag from a project."""
    try:
        await project_service.remove_tag_from_project(project_id, tag_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
