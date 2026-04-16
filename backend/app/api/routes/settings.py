from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.repositories.settings_repository import get_settings_for_user, upsert_settings_for_user
from app.schemas.settings import SettingsPayload

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsPayload)
def get_settings(db: DbSession, current_user: CurrentUser) -> SettingsPayload:
    config = get_settings_for_user(db, current_user.id)
    if config is None:
        return SettingsPayload()
    payload = dict(config.settings or {})
    payload["agent"] = {"system_prompt": config.system_prompt}
    return SettingsPayload.model_validate(payload)


@router.put("", response_model=SettingsPayload)
def update_settings(payload: SettingsPayload, db: DbSession, current_user: CurrentUser) -> SettingsPayload:
    settings_body = payload.model_dump()
    system_prompt = settings_body.pop("agent").get("system_prompt", "")
    config = upsert_settings_for_user(db, current_user.id, system_prompt=system_prompt, settings=settings_body)
    response = dict(config.settings)
    response["agent"] = {"system_prompt": config.system_prompt}
    return SettingsPayload.model_validate(response)
