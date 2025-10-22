"""
Agent Activity API Endpoints

Monitor AI agent activity in real-time
"""

import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.api.dependencies import get_db_session
from turbo.core.services.agent_activity import tracker

router = APIRouter(prefix="/agents", tags=["agents"])


def load_subagents_registry():
    """Load subagents from registry.json file."""
    registry_path = Path(__file__).parent.parent.parent.parent.parent / "subagents" / "registry.json"

    if not registry_path.exists():
        return []

    try:
        with open(registry_path, "r") as f:
            data = json.load(f)
            return data.get("subagents", [])
    except Exception as e:
        print(f"Error loading subagents registry: {e}")
        return []


@router.get("/activity/active")
async def get_active_agents():
    """Get all currently active agent sessions (real-time, in-memory)."""
    sessions = tracker.get_all_active()
    return {
        "active_sessions": [s.to_dict() for s in sessions],
        "count": len(sessions)
    }


@router.get("/activity/recent")
async def get_recent_agents(
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session)
):
    """Get recently completed agent sessions (from database)."""
    sessions = await tracker.get_recent_from_db(db, limit=limit)
    return {
        "recent_sessions": sessions,
        "count": len(sessions)
    }


@router.get("/activity/stats")
async def get_agent_stats(db: AsyncSession = Depends(get_db_session)):
    """Get overall agent activity statistics (from database)."""
    return await tracker.get_stats_from_db(db)


@router.get("/activity/{session_id}")
async def get_agent_session(session_id: str):
    """Get details of a specific agent session."""
    session = tracker.get_session(session_id)
    if not session:
        # Check recent sessions
        for s in tracker.get_recent():
            if s.session_id == session_id:
                return s.to_dict()
        return {"error": "Session not found"}, 404

    return session.to_dict()


@router.get("/configured")
async def get_configured_agents():
    """Get all configured subagents from the registry."""
    agents = load_subagents_registry()
    return {
        "agents": agents,
        "count": len(agents)
    }


@router.get("/configured/{agent_name}")
async def get_configured_agent(agent_name: str):
    """Get a specific configured agent by name."""
    agents = load_subagents_registry()

    for agent in agents:
        if agent.get("name") == agent_name:
            return agent

    raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")


@router.get("/configured/{agent_name}/sessions")
async def get_agent_sessions(
    agent_name: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session)
):
    """Get sessions for a specific configured agent."""
    # Check if agent exists
    agents = load_subagents_registry()
    agent_exists = any(a.get("name") == agent_name for a in agents)

    if not agent_exists:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    # Get sessions from database filtered by agent name
    # For now, return all recent sessions (can be filtered later)
    sessions = await tracker.get_recent_from_db(db, limit=limit)

    return {
        "agent_name": agent_name,
        "sessions": sessions,
        "count": len(sessions)
    }
