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
    companies,
    dependencies,
    documents,
    email_templates,
    favorites,
    forms,
    graph,
    group_discussion,
    initiatives,
    issue_implementation,
    issue_refinement,
    issues,
    job_applications,
    job_search,
    literature,
    mentors,
    milestones,
    my_queue,
    network_contacts,
    notes,
    staff,
    podcasts,
    projects,
    resume_generation,
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
    work_experiences,
    work_queue,
    worktrees,
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
router.include_router(notes.router, prefix="/notes", tags=["notes"])
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
router.include_router(worktrees.router, prefix="/worktrees", tags=["worktrees"])

# Career management endpoints
router.include_router(companies.router, prefix="/companies", tags=["companies", "career"])
router.include_router(job_applications.router, prefix="/job-applications", tags=["job-applications", "career"])
router.include_router(job_search.router, tags=["job-search", "career"])
router.include_router(network_contacts.router, prefix="/network-contacts", tags=["network-contacts", "career"])
router.include_router(work_experiences.router, prefix="/work-experiences", tags=["work-experiences", "career"])
router.include_router(email_templates.router, prefix="/email-templates", tags=["email-templates", "career"])
router.include_router(resume_generation.router, prefix="/resume-generation", tags=["resume-generation", "career"])
