"""API v1 package."""

from fastapi import APIRouter

from turbo.api.v1.endpoints import documents, issues, projects, tags

# Create the main API router
router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(issues.router, prefix="/issues", tags=["issues"])
router.include_router(documents.router, prefix="/documents", tags=["documents"])
router.include_router(tags.router, prefix="/tags", tags=["tags"])
