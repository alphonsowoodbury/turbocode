"""Issue API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from turbo.api.dependencies import get_issue_service
from turbo.core.schemas import IssueCreate, IssueResponse, IssueUpdate, TagResponse
from turbo.core.services import IssueService
from turbo.utils.exceptions import (
    IssueNotFoundError,
    ProjectNotFoundError,
)
from turbo.utils.exceptions import (
    ValidationError as TurboValidationError,
)

router = APIRouter()


class AssignmentRequest(BaseModel):
    """Request model for issue assignment."""

    assignee: str


@router.post("/", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_data: IssueCreate, issue_service: IssueService = Depends(get_issue_service)
) -> IssueResponse:
    """Create a new issue."""
    try:
        return await issue_service.create_issue(issue_data)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {issue_data.project_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: UUID, issue_service: IssueService = Depends(get_issue_service)
) -> IssueResponse:
    """Get an issue by ID."""
    try:
        return await issue_service.get_issue_by_id(issue_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )


@router.get("/", response_model=list[IssueResponse])
async def get_issues(
    status_filter: str | None = Query(None, alias="status"),
    assignee: str | None = Query(None),
    project_id: UUID | None = Query(None),
    workspace: str | None = Query(None, pattern="^(all|personal|freelance|work)$"),
    work_company: str | None = Query(None),
    limit: int | None = Query(None, ge=1, le=100),
    offset: int | None = Query(None, ge=0),
    issue_service: IssueService = Depends(get_issue_service),
) -> list[IssueResponse]:
    """Get all issues with optional filtering by status, assignee, project, and workspace."""
    # Workspace filtering takes precedence
    if workspace and workspace != "all":
        return await issue_service.get_issues_by_workspace(
            workspace=workspace,
            work_company=work_company,
            limit=limit,
            offset=offset,
        )
    elif status_filter:
        return await issue_service.get_issues_by_status(status_filter)
    elif assignee:
        return await issue_service.get_issues_by_assignee(assignee)
    elif project_id:
        return await issue_service.get_issues_by_project(project_id)
    else:
        return await issue_service.get_all_issues(limit=limit, offset=offset)


@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: UUID,
    issue_data: IssueUpdate,
    issue_service: IssueService = Depends(get_issue_service),
) -> IssueResponse:
    """Update an issue."""
    try:
        return await issue_service.update_issue(issue_id, issue_data)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_issue(
    issue_id: UUID, issue_service: IssueService = Depends(get_issue_service)
) -> None:
    """Delete an issue."""
    try:
        await issue_service.delete_issue(issue_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )


@router.post("/{issue_id}/assign", response_model=IssueResponse)
async def assign_issue(
    issue_id: UUID,
    assignment: AssignmentRequest,
    issue_service: IssueService = Depends(get_issue_service),
) -> IssueResponse:
    """Assign an issue to someone."""
    try:
        return await issue_service.assign_issue(issue_id, assignment.assignee)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )
    except TurboValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.post("/{issue_id}/close", response_model=IssueResponse)
async def close_issue(
    issue_id: UUID, issue_service: IssueService = Depends(get_issue_service)
) -> IssueResponse:
    """Close an issue."""
    try:
        return await issue_service.close_issue(issue_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )


@router.post("/{issue_id}/reopen", response_model=IssueResponse)
async def reopen_issue(
    issue_id: UUID, issue_service: IssueService = Depends(get_issue_service)
) -> IssueResponse:
    """Reopen a closed issue."""
    try:
        return await issue_service.reopen_issue(issue_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )


@router.get("/search", response_model=list[IssueResponse])
async def search_issues(
    query: str = Query(..., min_length=1),
    issue_service: IssueService = Depends(get_issue_service),
) -> list[IssueResponse]:
    """Search issues by title."""
    return await issue_service.search_issues_by_title(query)


@router.post("/{issue_id}/tags/{tag_id}", response_model=IssueResponse)
async def add_tag_to_issue(
    issue_id: UUID,
    tag_id: UUID,
    issue_service: IssueService = Depends(get_issue_service),
) -> IssueResponse:
    """Add a tag to an issue."""
    try:
        return await issue_service.add_tag_to_issue(issue_id, tag_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{issue_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_from_issue(
    issue_id: UUID,
    tag_id: UUID,
    issue_service: IssueService = Depends(get_issue_service),
) -> None:
    """Remove a tag from an issue."""
    try:
        await issue_service.remove_tag_from_issue(issue_id, tag_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )


@router.get("/{issue_id}/tags", response_model=list[TagResponse])
async def get_issue_tags(
    issue_id: UUID, issue_service: IssueService = Depends(get_issue_service)
) -> list[TagResponse]:
    """Get all tags for an issue."""
    try:
        return await issue_service.get_issue_tags(issue_id)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found",
        )
