from uuid import UUID

from sqlalchemy.orm import Session

from app.models.entities import AgentConfig


def get_settings_for_user(db: Session, user_id: UUID) -> AgentConfig | None:
    return db.get(AgentConfig, user_id)


def upsert_settings_for_user(db: Session, user_id: UUID, system_prompt: str, settings: dict) -> AgentConfig:
    config = db.get(AgentConfig, user_id)
    if config is None:
        config = AgentConfig(user_id=user_id, system_prompt=system_prompt, settings=settings)
        db.add(config)
    else:
        config.system_prompt = system_prompt
        config.settings = settings
    db.commit()
    db.refresh(config)
    return config
