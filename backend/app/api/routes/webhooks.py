from uuid import UUID

from fastapi import APIRouter, Form, HTTPException, Response

from app.core.database import SessionLocal
from app.models.entities import Call
from app.repositories import call_repository

router = APIRouter(tags=["webhooks"])


@router.post("/incoming-call")
def incoming_call() -> Response:
    twiml = """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say>Inbound call handling is ready for integration.</Say>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/outbound-answer")
def outbound_answer() -> Response:
    twiml = """<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say>The outbound call session has connected.</Say>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/recording-webhook")
def recording_webhook(call_sid: str = Form(...), recording_url: str = Form(...)) -> dict:
    try:
        call_id = UUID(call_sid)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="call_sid must be a UUID in the demo backend") from exc

    db = SessionLocal()
    try:
        call = db.get(Call, call_id)
        if call is None:
            raise HTTPException(status_code=404, detail="Call not found")
        call_repository.update_recording_url(db, call_id, recording_url)
    finally:
        db.close()
    return {"status": "ok"}
