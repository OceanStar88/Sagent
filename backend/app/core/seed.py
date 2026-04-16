from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.defaults import DEFAULT_AGENT_SYSTEM_PROMPT, build_default_agent_settings
from app.core.security import get_password_hash
from app.models.entities import AgentConfig, Contact, User, UserEmailVerification, UserProfile


def seed_demo_data(db: Session) -> None:
    user = db.scalar(select(User).where(User.email == "admin@sagent.local"))
    if user is None:
        user = User(
            email="admin@sagent.local",
            password_hash=get_password_hash("password123"),
        )
        db.add(user)
        db.flush()
    elif not user.password_hash.startswith("$pbkdf2-sha256$"):
        user.password_hash = get_password_hash("password123")

    verification = db.get(UserEmailVerification, user.id)
    if verification is None:
        db.add(
            UserEmailVerification(
                user_id=user.id,
                email=user.email,
                token_hash=None,
                expires_at=None,
                verified_at=datetime.now(UTC),
            )
        )
    elif verification.verified_at is None:
        verification.verified_at = datetime.now(UTC)
        verification.token_hash = None
        verification.expires_at = None

    profile = db.get(UserProfile, user.id)
    if profile is None:
        db.add(UserProfile(user_id=user.id, first_name="Admin", last_name="User"))

    agent_config = db.get(AgentConfig, user.id)
    if agent_config is None:
        db.add(
            AgentConfig(
                user_id=user.id,
                system_prompt=DEFAULT_AGENT_SYSTEM_PROMPT,
                settings=build_default_agent_settings(),
            )
        )

    existing_contacts = db.scalars(select(Contact).where(Contact.user_id == user.id)).all()
    if not existing_contacts:
        db.add_all(
            [
                Contact(user_id=user.id, name="Acme Logistics", phone_number="+6591234567"),
                Contact(user_id=user.id, name="Mira Tan", phone_number="+6587654321"),
            ]
        )

    db.commit()
