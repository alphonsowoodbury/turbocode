"""Create initiatives and milestones for Ritmo project."""

import asyncio
from datetime import datetime, timedelta
from uuid import UUID

from turbo.core.database.connection import get_db_session
from turbo.core.schemas import InitiativeCreate, MilestoneCreate
from turbo.core.services.initiative import InitiativeService
from turbo.core.services.milestone import MilestoneService


RITMO_PROJECT_ID = UUID("8777c38b-44a2-4bd5-ad8f-e5c6dd62eb02")


async def create_initiatives():
    """Create all initiatives for Ritmo."""
    initiatives = [
        {
            "name": "Core Music Platform",
            "description": "Foundational architecture including database models, repositories, services, and schemas for all music entities",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "Song & Album Management",
            "description": "Complete song lifecycle management including versioning, metadata, and album organization",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "Collaboration & Rights",
            "description": "Collaborator tracking, split management, publishing information, and rights administration",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "Studio & Production Tools",
            "description": "Session management, equipment tracking, production notes, and studio workflow optimization",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "Release & Distribution",
            "description": "Release planning, streaming platform integration, analytics, and marketing tools",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "File & Asset Management",
            "description": "Audio file storage, metadata extraction, cloud integration, and asset organization",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "API & CLI Development",
            "description": "FastAPI REST endpoints, CLI commands, MCP server integration, and developer tools",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
        {
            "name": "Web UI & User Experience",
            "description": "Web interface, audio player, waveform visualization, and responsive design",
            "status": "planning",
            "project_id": RITMO_PROJECT_ID,
        },
    ]

    async for session in get_db_session():
        initiative_service = InitiativeService(session)
        created = []
        for init_data in initiatives:
            initiative = await initiative_service.create_initiative(InitiativeCreate(**init_data))
            created.append(initiative)
            print(f"Created initiative: {initiative.name} ({initiative.id})")
        return created


async def create_milestones():
    """Create all milestones for Ritmo."""
    today = datetime.now()
    milestones = [
        {
            "name": "Foundation - Phase 1",
            "description": "Core architecture, database models, and repository layer complete",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today,
            "due_date": today + timedelta(days=30),
        },
        {
            "name": "MVP - Phase 2",
            "description": "Basic song management, API endpoints, and CLI commands functional",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=30),
            "due_date": today + timedelta(days=60),
        },
        {
            "name": "Collaboration - Phase 3",
            "description": "Collaborator tracking, split management, and rights features complete",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=60),
            "due_date": today + timedelta(days=90),
        },
        {
            "name": "Studio Tools - Phase 4",
            "description": "Session management, equipment tracking, and production tools operational",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=90),
            "due_date": today + timedelta(days=120),
        },
        {
            "name": "File Management - Phase 5",
            "description": "File storage, cloud integration, and metadata extraction working",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=120),
            "due_date": today + timedelta(days=150),
        },
        {
            "name": "Release & Analytics - Phase 6",
            "description": "Release planning, streaming platform integration, and analytics dashboard live",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=150),
            "due_date": today + timedelta(days=180),
        },
        {
            "name": "Web UI - Phase 7",
            "description": "Complete web interface with audio player and visualization features",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=180),
            "due_date": today + timedelta(days=210),
        },
        {
            "name": "Production Ready - v1.0",
            "description": "Testing complete, documentation finished, ready for Grammy-winning producers",
            "status": "planned",
            "project_id": RITMO_PROJECT_ID,
            "start_date": today + timedelta(days=210),
            "due_date": today + timedelta(days=240),
        },
    ]

    async for session in get_db_session():
        milestone_service = MilestoneService(session)
        created = []
        for milestone_data in milestones:
            milestone = await milestone_service.create_milestone(MilestoneCreate(**milestone_data))
            created.append(milestone)
            print(f"Created milestone: {milestone.name} ({milestone.id})")
        return created


async def main():
    """Main execution."""
    print("Creating Ritmo Project Structure...")
    print("\n" + "="*80)
    print("INITIATIVES")
    print("="*80)
    initiatives = await create_initiatives()

    print("\n" + "="*80)
    print("MILESTONES")
    print("="*80)
    milestones = await create_milestones()

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Created {len(initiatives)} initiatives")
    print(f"Created {len(milestones)} milestones")
    print("\nRitmo project structure is ready!")
    print(f"\nView project: http://localhost:3001/projects/{RITMO_PROJECT_ID}")


if __name__ == "__main__":
    asyncio.run(main())
