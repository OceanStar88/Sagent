from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.entities import Call, User
from app.services.runtime import session_manager

router = APIRouter()


@router.websocket("/ws/observe/{call_id}")
async def observe_call(websocket: WebSocket, call_id: UUID, token: str) -> None:
    await websocket.accept()

    try:
        payload = decode_access_token(token)
    except ValueError:
        await websocket.send_json({"type": "error", "message": "Invalid token"})
        await websocket.close(code=1008)
        return

    db: Session = SessionLocal()
    try:
        user = db.get(User, payload.get("sub"))
        call = db.get(Call, call_id)
        if user is None or call is None or user.id != call.user_id:
            await websocket.send_json({"type": "error", "message": "Invalid call_id"})
            await websocket.close(code=1008)
            return

        session = await session_manager.register(call_id, websocket)
        current_state = session.state if session is not None else call.status
        await websocket.send_json({"type": "call_state", "state": current_state})

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await session_manager.unregister(call_id, websocket)
    finally:
        db.close()
