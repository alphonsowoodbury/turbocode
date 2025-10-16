"""WebSocket endpoints for real-time updates."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from turbo.core.services.websocket_manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/comments/{entity_type}/{entity_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    entity_type: str,
    entity_id: str
):
    """
    WebSocket endpoint for real-time comment updates.

    Clients connect to this endpoint to receive real-time notifications when:
    - New comments are created
    - Comments are updated
    - Comments are deleted

    Args:
        websocket: WebSocket connection
        entity_type: Type of entity (issue, project, milestone, etc.)
        entity_id: UUID of the entity
    """
    await manager.connect(websocket, entity_type, entity_id)

    try:
        # Keep connection alive and listen for client messages
        while True:
            # Wait for any client messages (keepalive pings, etc.)
            data = await websocket.receive_text()

            # Echo back ping messages for keepalive
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        manager.disconnect(websocket, entity_type, entity_id)
        logger.info(f"Client disconnected from {entity_type}:{entity_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, entity_type, entity_id)
