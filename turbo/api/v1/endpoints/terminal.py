"""Terminal API endpoints."""

import asyncio
import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.api.dependencies import get_db_session
from turbo.core.schemas.terminal import (
    TerminalResize,
    TerminalSessionCreate,
    TerminalSessionResponse,
)
from turbo.core.services.terminal import TerminalService

router = APIRouter(prefix="/terminal", tags=["terminal"])

# Global service instance for WebSocket connections
# In production, this should be managed differently (e.g., Redis)
_terminal_services: dict[str, TerminalService] = {}


def get_terminal_service(
    session: AsyncSession = Depends(get_db_session),
) -> TerminalService:
    """Get terminal service."""
    return TerminalService(session)


@router.post("/sessions", response_model=TerminalSessionResponse)
async def create_terminal_session(
    create_data: TerminalSessionCreate,
    service: TerminalService = Depends(get_terminal_service),
) -> TerminalSessionResponse:
    """Create a new terminal session."""
    try:
        return await service.create_session(create_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/sessions", response_model=list[TerminalSessionResponse])
async def list_terminal_sessions(
    user_id: str,
    service: TerminalService = Depends(get_terminal_service),
) -> list[TerminalSessionResponse]:
    """List active terminal sessions for a user."""
    return await service.list_active_sessions(user_id)


@router.get("/sessions/{session_id}", response_model=TerminalSessionResponse)
async def get_terminal_session(
    session_id: str,
    service: TerminalService = Depends(get_terminal_service),
) -> TerminalSessionResponse:
    """Get terminal session details."""
    session = await service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/resize")
async def resize_terminal(
    session_id: str,
    resize_data: TerminalResize,
    service: TerminalService = Depends(get_terminal_service),
) -> dict[str, Any]:
    """Resize terminal session."""
    success = await service.resize_session(
        session_id, resize_data.rows, resize_data.cols
    )
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or inactive")
    return {"success": True}


@router.delete("/sessions/{session_id}")
async def end_terminal_session(
    session_id: str,
    service: TerminalService = Depends(get_terminal_service),
) -> dict[str, Any]:
    """End a terminal session."""
    success = await service.end_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True}


@router.websocket("/ws/{session_id}")
async def terminal_websocket(
    websocket: WebSocket,
    session_id: str,
) -> None:
    """WebSocket endpoint for terminal I/O."""
    await websocket.accept()

    # Get database session and create service
    async for db_session in get_db_session():
        service = TerminalService(db_session)
        _terminal_services[session_id] = service

        # Verify session exists
        terminal_session = await service.get_session(session_id)
        if not terminal_session:
            await websocket.close(code=1008, reason="Session not found")
            return

        # Get PTY process
        pty = service.get_pty(session_id)
        if not pty or not pty.isalive():
            await websocket.close(code=1008, reason="Session inactive")
            return

        # Create tasks for bidirectional communication
        async def read_from_pty() -> None:
            """Read from PTY and send to WebSocket."""
            try:
                while pty.isalive():
                    data = await service.read_from_session(session_id, timeout=0.1)
                    if data:
                        await websocket.send_json({"type": "output", "data": data})
                    await asyncio.sleep(0.01)
            except WebSocketDisconnect:
                pass
            except Exception as e:
                print(f"Error reading from PTY: {e}")

        async def write_to_pty() -> None:
            """Receive from WebSocket and write to PTY."""
            try:
                while True:
                    message = await websocket.receive_text()
                    try:
                        data = json.loads(message)
                        msg_type = data.get("type")

                        if msg_type == "input":
                            input_data = data.get("data", "")
                            await service.write_to_session(session_id, input_data)

                        elif msg_type == "resize":
                            rows = data.get("rows", 24)
                            cols = data.get("cols", 80)
                            await service.resize_session(session_id, rows, cols)

                    except json.JSONDecodeError:
                        # Treat as raw input
                        await service.write_to_session(session_id, message)

            except WebSocketDisconnect:
                pass
            except Exception as e:
                print(f"Error writing to PTY: {e}")

        # Run both tasks concurrently
        try:
            reader_task = asyncio.create_task(read_from_pty())
            writer_task = asyncio.create_task(write_to_pty())

            # Wait for either task to complete (usually means disconnection)
            done, pending = await asyncio.wait(
                [reader_task, writer_task], return_when=asyncio.FIRST_COMPLETED
            )

            # Cancel remaining tasks
            for task in pending:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

        except Exception as e:
            print(f"WebSocket error: {e}")
        finally:
            # Clean up
            _terminal_services.pop(session_id, None)
            await websocket.close()
