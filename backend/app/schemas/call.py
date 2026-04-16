from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OutboundCallRequest(BaseModel):
    to_number: str
    from_number: str


class OutboundCallResponse(BaseModel):
    call_id: UUID
    status: str


class TranscriptItem(BaseModel):
    speaker: str
    text: str
    timestamp: datetime


class CallSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    direction: str
    status: str
    from_number: str
    to_number: str
    started_at: datetime
    ended_at: datetime | None
    recording_url: str | None


class CallDetail(BaseModel):
    call_id: UUID
    status: str
    direction: str
    from_number: str
    to_number: str
    started_at: datetime
    ended_at: datetime | None
    recording_url: str | None
    transcripts: list[TranscriptItem]


class EndCallResponse(BaseModel):
    call_id: UUID
    status: str
