"""Terminal service for managing PTY sessions."""

import asyncio
import os
import signal
import sys
from datetime import datetime
from typing import Dict, Optional
from uuid import UUID, uuid4

import ptyprocess
from sqlalchemy.ext.asyncio import AsyncSession

from turbo.core.models.terminal import TerminalSession
from turbo.core.schemas.terminal import (
    TerminalSessionCreate,
    TerminalSessionResponse,
    TerminalSessionUpdate,
)


class TerminalService:
    """Service for managing terminal sessions with PTY."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize the terminal service."""
        self.session = session
        self.active_sessions: Dict[str, ptyprocess.PtyProcess] = {}
        self.session_tasks: Dict[str, asyncio.Task] = {}

    async def create_session(
        self, create_data: TerminalSessionCreate
    ) -> TerminalSessionResponse:
        """Create a new terminal session with PTY."""
        # Generate unique session ID
        session_id = str(uuid4())

        # Prepare environment variables
        env = os.environ.copy()
        if create_data.environment_vars:
            env.update(create_data.environment_vars)

        # Add Turbo context to environment
        if create_data.project_id:
            env["TURBO_PROJECT_ID"] = str(create_data.project_id)
        if create_data.issue_id:
            env["TURBO_ISSUE_ID"] = str(create_data.issue_id)

        env["TURBO_SESSION_ID"] = session_id

        # Expand working directory
        working_dir = os.path.expanduser(create_data.working_directory)
        if not os.path.exists(working_dir):
            working_dir = os.path.expanduser("~")

        # Create PTY process
        try:
            pty = ptyprocess.PtyProcess.spawn(
                [create_data.shell],
                dimensions=(24, 80),
                cwd=working_dir,
                env=env,
            )
            self.active_sessions[session_id] = pty

            # Create database record directly
            db_session = TerminalSession(
                user_id=create_data.user_id,
                session_id=session_id,
                project_id=create_data.project_id,
                issue_id=create_data.issue_id,
                shell=create_data.shell,
                working_directory=working_dir,
                environment_vars=create_data.environment_vars,
                pid=pty.pid,
                is_active=True,
                last_activity=datetime.utcnow(),
            )

            self.session.add(db_session)
            await self.session.commit()
            await self.session.refresh(db_session)

            return TerminalSessionResponse.model_validate(db_session)

        except Exception as e:
            await self.session.rollback()
            raise RuntimeError(f"Failed to create terminal session: {e}") from e

    async def get_session(self, session_id: str) -> Optional[TerminalSessionResponse]:
        """Get terminal session by session_id."""
        from sqlalchemy import select

        stmt = select(TerminalSession).where(TerminalSession.session_id == session_id)
        result = await self.session.execute(stmt)
        db_session = result.scalar_one_or_none()
        if db_session:
            return TerminalSessionResponse.model_validate(db_session)
        return None

    async def list_active_sessions(self, user_id: str) -> list[TerminalSessionResponse]:
        """List all active sessions for a user."""
        from sqlalchemy import select

        stmt = select(TerminalSession).where(
            TerminalSession.user_id == user_id,
            TerminalSession.is_active == True
        )
        result = await self.session.execute(stmt)
        sessions = result.scalars().all()
        return [TerminalSessionResponse.model_validate(s) for s in sessions]

    async def write_to_session(self, session_id: str, data: str) -> bool:
        """Write data to terminal session."""
        pty = self.active_sessions.get(session_id)
        if not pty or not pty.isalive():
            return False

        try:
            pty.write(data.encode("utf-8"))
            # Update last activity
            await self._update_activity(session_id)
            return True
        except Exception:
            return False

    async def read_from_session(
        self, session_id: str, timeout: float = 0.1
    ) -> Optional[str]:
        """Read data from terminal session (non-blocking)."""
        pty = self.active_sessions.get(session_id)
        if not pty or not pty.isalive():
            return None

        try:
            # Non-blocking read
            data = pty.read(timeout=timeout)
            if data:
                await self._update_activity(session_id)
                return data.decode("utf-8", errors="replace")
        except Exception:
            pass

        return None

    async def resize_session(self, session_id: str, rows: int, cols: int) -> bool:
        """Resize terminal session."""
        pty = self.active_sessions.get(session_id)
        if not pty or not pty.isalive():
            return False

        try:
            pty.setwinsize(rows, cols)
            return True
        except Exception:
            return False

    async def end_session(self, session_id: str) -> bool:
        """End a terminal session."""
        pty = self.active_sessions.get(session_id)
        if pty and pty.isalive():
            try:
                # Send SIGTERM
                pty.kill(signal.SIGTERM)
                # Wait briefly for graceful shutdown
                await asyncio.sleep(0.5)
                if pty.isalive():
                    # Force kill if still alive
                    pty.kill(signal.SIGKILL)
            except Exception:
                pass

            # Remove from active sessions
            self.active_sessions.pop(session_id, None)

        # Update database
        from sqlalchemy import select

        stmt = select(TerminalSession).where(TerminalSession.session_id == session_id)
        result = await self.session.execute(stmt)
        db_session = result.scalar_one_or_none()

        if db_session:
            update_data = TerminalSessionUpdate(
                is_active=False, ended_at=datetime.utcnow()
            )
            for field, value in update_data.model_dump(exclude_unset=True).items():
                setattr(db_session, field, value)
            await self.session.commit()
            return True

        return False

    async def _update_activity(self, session_id: str) -> None:
        """Update last activity timestamp."""
        from sqlalchemy import select

        stmt = select(TerminalSession).where(TerminalSession.session_id == session_id)
        result = await self.session.execute(stmt)
        db_session = result.scalar_one_or_none()

        if db_session:
            db_session.last_activity = datetime.utcnow()
            await self.session.commit()

    async def cleanup_dead_sessions(self) -> int:
        """Clean up sessions where PTY process has died."""
        cleaned = 0
        for session_id, pty in list(self.active_sessions.items()):
            if not pty.isalive():
                await self.end_session(session_id)
                cleaned += 1
        return cleaned

    def get_pty(self, session_id: str) -> Optional[ptyprocess.PtyProcess]:
        """Get PTY process for a session (for WebSocket handlers)."""
        return self.active_sessions.get(session_id)
