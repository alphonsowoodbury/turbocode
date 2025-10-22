"""API v1 package."""

from fastapi import APIRouter

from turbo.api.v1.endpoints import (
    action_approvals,
    agents,
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
    group_discussion,
    initiatives,
    issue_implementation,
    issue_refinement,
    issues,
    literature,
    mentors,
    milestones,
    my_queue,
    staff,
    podcasts,
    projects,
    resumes,
    saved_filters,
    script_runs,
    settings,
    skills,
    subagents,
    tags,
    terminal,
    webhooks,
    websocket,
    work_queue,
)

# Create the main API router
router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
router.include_router(action_approvals.router)
router.include_router(agents.router, tags=["agents"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(issues.router, prefix="/issues", tags=["issues"])
router.include_router(work_queue.router, prefix="/work-queue", tags=["work-queue"])
router.include_router(issue_implementation.router)
router.include_router(issue_refinement.router)
router.include_router(dependencies.router)
router.include_router(milestones.router, prefix="/milestones", tags=["milestones"])
router.include_router(initiatives.router, prefix="/initiatives", tags=["initiatives"])
router.include_router(documents.router, prefix="/documents", tags=["documents"])
router.include_router(literature.router)
router.include_router(podcasts.router)
router.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
router.include_router(my_queue.router)  # Already has /my-queue prefix
router.include_router(staff.router, prefix="/staff", tags=["staff"])
router.include_router(group_discussion.router, prefix="/group-discussions", tags=["group-discussions"])
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
router.include_router(script_runs.router, prefix="/script-runs", tags=["script-runs"])
router.include_router(settings.router, tags=["settings"])
router.include_router(subagents.router)
router.include_router(terminal.router)
router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
router.include_router(websocket.router, tags=["websocket"])
