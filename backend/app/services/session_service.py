import asyncio
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from fastapi import WebSocket


@dataclass
class SessionState:
    call_id: UUID
    user_id: UUID
    state: str = "initiated"
    observers: set[WebSocket] = field(default_factory=set)


class SessionManager:
    def __init__(self) -> None:
        self._sessions: dict[UUID, SessionState] = {}
        self._lock = asyncio.Lock()

    async def create_session(self, call_id: UUID, user_id: UUID, state: str = "initiated") -> SessionState:
        async with self._lock:
            session = SessionState(call_id=call_id, user_id=user_id, state=state)
            self._sessions[call_id] = session
            return session

    async def get_session(self, call_id: UUID) -> SessionState | None:
        async with self._lock:
            return self._sessions.get(call_id)

    async def register(self, call_id: UUID, websocket: WebSocket) -> SessionState | None:
        async with self._lock:
            session = self._sessions.get(call_id)
            if session is None:
                return None
            session.observers.add(websocket)
            return session

    async def unregister(self, call_id: UUID, websocket: WebSocket) -> None:
        async with self._lock:
            session = self._sessions.get(call_id)
            if session is not None:
                session.observers.discard(websocket)

    async def set_state(self, call_id: UUID, state: str) -> None:
        async with self._lock:
            session = self._sessions.get(call_id)
            if session is not None:
                session.state = state
                observers = list(session.observers)
            else:
                observers = []
        await self._broadcast(observers, {"type": "call_state", "state": state})

    async def broadcast(self, call_id: UUID, message: dict[str, Any]) -> None:
        async with self._lock:
            session = self._sessions.get(call_id)
            observers = list(session.observers) if session is not None else []
        await self._broadcast(observers, message)

    async def close_session(self, call_id: UUID) -> None:
        async with self._lock:
            self._sessions.pop(call_id, None)

    async def _broadcast(self, observers: list[WebSocket], message: dict[str, Any]) -> None:
        dead_connections: list[WebSocket] = []
        for observer in observers:
            try:
                await observer.send_json(message)
            except Exception:
                dead_connections.append(observer)
        if dead_connections:
            async with self._lock:
                for session in self._sessions.values():
                    for observer in dead_connections:
                        session.observers.discard(observer)
