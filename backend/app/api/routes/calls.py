from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.repositories import call_repository
from app.schemas.call import CallDetail, CallSummary, OutboundCallRequest, OutboundCallResponse
from app.services.runtime import call_service

router = APIRouter(prefix="/calls", tags=["calls"])


@router.post("/outbound", response_model=OutboundCallResponse)
async def start_outbound_call(payload: OutboundCallRequest, db: DbSession, current_user: CurrentUser) -> OutboundCallResponse:
    return await call_service.start_outbound_call(db, current_user.id, payload)


@router.get("", response_model=list[CallSummary])
def get_calls(db: DbSession, current_user: CurrentUser, limit: int = 20, offset: int = 0) -> list[CallSummary]:
    calls = call_repository.list_calls(db, current_user.id, limit, offset)
    return [CallSummary.model_validate(call) for call in calls]


@router.get("/{call_id}", response_model=CallDetail)
def get_call_detail(call_id: UUID, db: DbSession, current_user: CurrentUser) -> CallDetail:
    return call_service.get_call_detail(db, current_user.id, call_id)


@router.post("/{call_id}/end", response_model=OutboundCallResponse)
async def end_call(call_id: UUID, db: DbSession, current_user: CurrentUser) -> OutboundCallResponse:
    return await call_service.end_call(db, current_user.id, call_id)
