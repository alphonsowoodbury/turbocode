"""API v1 package."""

from fastapi import APIRouter

from turbo.api.v1.endpoints import (
    ai,
    blueprints,
    calendar,
    calendar_events,
    comments,
    dependencies,
    documents,
    favorites,
    forms,
    graph,
    initiatives,
    issue_refinement,
    issues,
    literature,
    mentors,
    milestones,
    podcasts,
    projects,
    resumes,
    saved_filters,
    skills,
    tags,
    terminal,
    websocket,
)

# Create the main API router
router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(issues.router, prefix="/issues", tags=["issues"])
router.include_router(issue_refinement.router)
router.include_router(dependencies.router)
router.include_router(milestones.router, prefix="/milestones", tags=["milestones"])
router.include_router(initiatives.router, prefix="/initiatives", tags=["initiatives"])
router.include_router(documents.router, prefix="/documents", tags=["documents"])
router.include_router(literature.router)
router.include_router(podcasts.router)
router.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
router.include_router(tags.router, prefix="/tags", tags=["tags"])
router.include_router(comments.router, prefix="/comments", tags=["comments"])
router.include_router(blueprints.router, prefix="/blueprints", tags=["blueprints"])
router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
router.include_router(saved_filters.router, prefix="/saved-filters", tags=["saved-filters"])
router.include_router(forms.router)
router.include_router(graph.router, prefix="/graph", tags=["graph"])
router.include_router(calendar.router)
router.include_router(calendar_events.router, prefix="/calendar-events", tags=["calendar-events"])
router.include_router(skills.router, prefix="/skills", tags=["skills"])
router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
router.include_router(terminal.router)
router.include_router(websocket.router, tags=["websocket"])
