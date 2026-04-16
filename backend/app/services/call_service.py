import asyncio
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.entities import Contact
from app.repositories import call_repository, settings_repository
from app.schemas.call import CallDetail, OutboundCallRequest, OutboundCallResponse, TranscriptItem
from app.services.mock_voice_engine import MockVoiceEngine
from app.services.session_service import SessionManager


class CallService:
    def __init__(self, session_manager: SessionManager, voice_engine: MockVoiceEngine) -> None:
        self.session_manager = session_manager
        self.voice_engine = voice_engine

    async def start_outbound_call(self, db: Session, user_id: UUID, payload: OutboundCallRequest) -> OutboundCallResponse:
        call = call_repository.create_call(
            db=db,
            user_id=user_id,
            direction="outbound",
            from_number=payload.from_number,
            to_number=payload.to_number,
            status="initiated",
        )
        await self.session_manager.create_session(call.id, user_id, state="initiated")
        asyncio.create_task(self._simulate_call(call.id, user_id, payload.to_number))
        return OutboundCallResponse(call_id=call.id, status=call.status)

    def get_call_detail(self, db: Session, user_id: UUID, call_id: UUID) -> CallDetail:
        call = call_repository.get_call(db, user_id, call_id)
        if call is None:
            raise HTTPException(status_code=404, detail="Call not found")
        transcripts = [
            TranscriptItem(speaker=item.speaker, text=item.content, timestamp=item.created_at)
            for item in sorted(call.transcripts, key=lambda transcript: transcript.created_at)
        ]
        return CallDetail(
            call_id=call.id,
            status=call.status,
            direction=call.direction,
            from_number=call.from_number,
            to_number=call.to_number,
            started_at=call.started_at,
            ended_at=call.ended_at,
            recording_url=call.recording_url,
            transcripts=transcripts,
        )

    async def end_call(self, db: Session, user_id: UUID, call_id: UUID) -> OutboundCallResponse:
        call = call_repository.update_call_status(db, user_id, call_id, "completed")
        if call is None:
            raise HTTPException(status_code=404, detail="Call not found")
        await self.session_manager.set_state(call_id, "completed")
        await self.session_manager.close_session(call_id)
        return OutboundCallResponse(call_id=call.id, status=call.status)

    async def _simulate_call(self, call_id: UUID, user_id: UUID, to_number: str) -> None:
        await asyncio.sleep(1)
        db = SessionLocal()
        try:
            call = call_repository.update_call_status(db, user_id, call_id, "connected")
            if call is None:
                return

            await self.session_manager.set_state(call_id, "connected")
            await self.session_manager.set_state(call_id, "listening")

            config = settings_repository.get_settings_for_user(db, user_id)
            system_prompt = config.system_prompt if config else "You are a concise, helpful AI call assistant."
            contact_name = self._resolve_contact_name(db, user_id, to_number)
            script = self.voice_engine.build_script(contact_name, system_prompt)

            for turn in script:
                await self.session_manager.broadcast(
                    call_id,
                    {"type": "partial_transcript", "speaker": "user", "text": turn.user[: max(12, len(turn.user) // 2)]},
                )
                await asyncio.sleep(0.8)

                transcript = call_repository.append_transcript(db, call_id, "user", turn.user)
                await self.session_manager.broadcast(
                    call_id,
                    {
                        "type": "transcript",
                        "speaker": "user",
                        "text": turn.user,
                        "timestamp": transcript.created_at.isoformat(),
                    },
                )

                await self.session_manager.set_state(call_id, "thinking")
                await self.session_manager.broadcast(call_id, {"type": "agent_thinking"})
                await asyncio.sleep(1)

                response = call_repository.append_transcript(db, call_id, "agent", turn.agent)
                await self.session_manager.set_state(call_id, "speaking")
                await self.session_manager.broadcast(
                    call_id,
                    {
                        "type": "transcript",
                        "speaker": "agent",
                        "text": turn.agent,
                        "timestamp": response.created_at.isoformat(),
                    },
                )
                await asyncio.sleep(1.2)
                await self.session_manager.set_state(call_id, "listening")

            call_repository.update_recording_url(db, call_id, f"https://recordings.example.com/{call_id}.mp3")
            call_repository.update_call_status(db, user_id, call_id, "completed")
            await self.session_manager.set_state(call_id, "completed")
            await self.session_manager.close_session(call_id)
        finally:
            db.close()

    def _resolve_contact_name(self, db: Session, user_id: UUID, phone_number: str) -> str:
        contact = db.query(Contact).filter(Contact.user_id == user_id, Contact.phone_number == phone_number).first()
        return contact.name if contact else phone_number
