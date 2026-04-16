from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Call, Transcript


def create_call(db: Session, user_id: UUID, direction: str, from_number: str, to_number: str, status: str) -> Call:
    call = Call(
        user_id=user_id,
        direction=direction,
        from_number=from_number,
        to_number=to_number,
        status=status,
    )
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def list_calls(db: Session, user_id: UUID, limit: int, offset: int) -> list[Call]:
    stmt = (
        select(Call)
        .where(Call.user_id == user_id)
        .order_by(desc(Call.created_at))
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_call(db: Session, user_id: UUID, call_id: UUID) -> Call | None:
    stmt = (
        select(Call)
        .where(Call.id == call_id, Call.user_id == user_id)
        .options(selectinload(Call.transcripts))
    )
    return db.scalar(stmt)


def update_call_status(db: Session, user_id: UUID, call_id: UUID, status: str) -> Call | None:
    call = get_call(db, user_id, call_id)
    if call is None:
        return None
    call.status = status
    if status in {"completed", "failed"}:
        call.ended_at = datetime.now(UTC)
    db.commit()
    db.refresh(call)
    return call


def append_transcript(db: Session, call_id: UUID, speaker: str, content: str) -> Transcript:
    transcript = Transcript(call_id=call_id, speaker=speaker, content=content)
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


def update_recording_url(db: Session, call_id: UUID, recording_url: str) -> Call | None:
    call = db.get(Call, call_id)
    if call is None:
        return None
    call.recording_url = recording_url
    db.commit()
    db.refresh(call)
    return call
