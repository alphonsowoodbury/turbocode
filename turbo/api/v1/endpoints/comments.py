"""Comment API endpoints."""

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.database.connection import get_db_session
from turbo.core.models import Comment
from turbo.core.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from turbo.core.services import get_webhook_service
from sqlalchemy import select

router = APIRouter()


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
) -> CommentResponse:
    """Create a new comment on an issue.

    If the comment is from a user, triggers a background task to have Claude respond.
    """
    comment = Comment(
        issue_id=comment_data.issue_id,
        content=comment_data.content,
        author_name=comment_data.author_name,
        author_type=comment_data.author_type,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    # Trigger Claude response for user comments only (avoid infinite loops)
    if comment.author_type == "user":
        webhook_service = get_webhook_service()
        background_tasks.add_task(
            webhook_service.trigger_claude_response, comment.issue_id
        )

    return CommentResponse.model_validate(comment)


@router.get("/issue/{issue_id}", response_model=list[CommentResponse])
async def get_issue_comments(
    issue_id: UUID, db: AsyncSession = Depends(get_db_session)
) -> list[CommentResponse]:
    """Get all comments for an issue."""
    result = await db.execute(
        select(Comment)
        .where(Comment.issue_id == issue_id)
        .order_by(Comment.created_at.asc())
    )
    comments = result.scalars().all()
    return [CommentResponse.model_validate(comment) for comment in comments]


@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: UUID, db: AsyncSession = Depends(get_db_session)
) -> CommentResponse:
    """Get a comment by ID."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found",
        )

    return CommentResponse.model_validate(comment)


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: UUID,
    comment_data: CommentUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> CommentResponse:
    """Update a comment."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found",
        )

    if comment_data.content is not None:
        comment.content = comment_data.content

    await db.commit()
    await db.refresh(comment)
    return CommentResponse.model_validate(comment)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID, db: AsyncSession = Depends(get_db_session)
) -> None:
    """Delete a comment."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found",
        )

    await db.delete(comment)
    await db.commit()
