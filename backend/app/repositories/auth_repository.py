from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import (
    User,
    UserAvatar,
    UserEmailVerification,
    UserPasswordReset,
    UserPreference,
    UserProfile,
)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_user_by_id(db: Session, user_id) -> User | None:
    return db.get(User, user_id)


def get_email_verification_by_user_id(db: Session, user_id) -> UserEmailVerification | None:
    return db.get(UserEmailVerification, user_id)


def get_user_avatar(db: Session, user_id) -> UserAvatar | None:
    return db.get(UserAvatar, user_id)


def get_user_preference(db: Session, user_id) -> UserPreference | None:
    return db.get(UserPreference, user_id)


def get_user_profile(db: Session, user_id) -> UserProfile | None:
    return db.get(UserProfile, user_id)


def get_email_verification_by_token_hash(db: Session, token_hash: str) -> UserEmailVerification | None:
    return db.scalar(select(UserEmailVerification).where(UserEmailVerification.token_hash == token_hash))


def get_password_reset_by_user_id(db: Session, user_id) -> UserPasswordReset | None:
    return db.get(UserPasswordReset, user_id)


def get_password_reset_by_token_hash(db: Session, token_hash: str) -> UserPasswordReset | None:
    return db.scalar(select(UserPasswordReset).where(UserPasswordReset.token_hash == token_hash))


def is_user_email_verified(db: Session, user: User) -> bool:
    verification = get_email_verification_by_user_id(db, user.id)
    return verification is None or verification.verified_at is not None


def set_email_verification_pending(
    db: Session,
    *,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> UserEmailVerification:
    verification = get_email_verification_by_user_id(db, user.id)
    if verification is None:
        verification = UserEmailVerification(
            user_id=user.id,
            email=user.email,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(verification)
    else:
        verification.email = user.email
        verification.token_hash = token_hash
        verification.expires_at = expires_at
        verification.verified_at = None

    db.flush()
    return verification


def mark_email_as_verified(db: Session, verification: UserEmailVerification, *, verified_at: datetime) -> None:
    verification.verified_at = verified_at
    verification.token_hash = None
    verification.expires_at = None
    db.flush()


def set_email_verification_verified(db: Session, *, user: User, verified_at: datetime) -> UserEmailVerification:
    verification = get_email_verification_by_user_id(db, user.id)
    if verification is None:
        verification = UserEmailVerification(
            user_id=user.id,
            email=user.email,
            token_hash=None,
            expires_at=None,
            verified_at=verified_at,
        )
        db.add(verification)
    else:
        verification.email = user.email
        verification.token_hash = None
        verification.expires_at = None
        verification.verified_at = verified_at

    db.flush()
    return verification


def set_password_reset_pending(
    db: Session,
    *,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> UserPasswordReset:
    password_reset = get_password_reset_by_user_id(db, user.id)
    if password_reset is None:
        password_reset = UserPasswordReset(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(password_reset)
    else:
        password_reset.token_hash = token_hash
        password_reset.expires_at = expires_at
        password_reset.used_at = None

    db.flush()
    return password_reset


def mark_password_reset_used(db: Session, password_reset: UserPasswordReset, *, used_at: datetime) -> None:
    password_reset.used_at = used_at
    password_reset.token_hash = None
    password_reset.expires_at = None
    db.flush()


def upsert_user_avatar(
    db: Session,
    *,
    user: User,
    storage_key: str,
    original_filename: str,
    content_type: str,
    file_size: int,
) -> UserAvatar:
    avatar = get_user_avatar(db, user.id)
    if avatar is None:
        avatar = UserAvatar(
            user_id=user.id,
            storage_key=storage_key,
            original_filename=original_filename,
            content_type=content_type,
            file_size=file_size,
        )
        db.add(avatar)
    else:
        avatar.storage_key = storage_key
        avatar.original_filename = original_filename
        avatar.content_type = content_type
        avatar.file_size = file_size

    db.flush()
    return avatar


def clear_user_avatar(db: Session, user: User) -> UserAvatar | None:
    avatar = get_user_avatar(db, user.id)
    if avatar is None:
        return None

    db.delete(avatar)
    db.flush()
    return avatar


def get_or_create_user_preference(db: Session, user: User) -> UserPreference:
    preference = get_user_preference(db, user.id)
    if preference is None:
        preference = UserPreference(user_id=user.id, theme_preference="system")
        db.add(preference)
        db.flush()
    return preference


def update_user_theme_preference(db: Session, *, user: User, theme_preference: str) -> UserPreference:
    preference = get_or_create_user_preference(db, user)
    preference.theme_preference = theme_preference
    db.flush()
    return preference


def create_user(db: Session, *, email: str, password_hash: str) -> User:
    user = User(
        email=email,
        password_hash=password_hash,
    )
    db.add(user)
    db.flush()
    return user


def create_user_profile(db: Session, *, user_id, first_name: str, last_name: str) -> UserProfile:
    profile = UserProfile(user_id=user_id, first_name=first_name, last_name=last_name)
    db.add(profile)
    db.flush()
    return profile


def update_user_profile(db: Session, *, user_id, first_name: str, last_name: str) -> UserProfile:
    profile = get_user_profile(db, user_id)
    if profile is None:
        profile = UserProfile(user_id=user_id, first_name=first_name, last_name=last_name)
        db.add(profile)
    else:
        profile.first_name = first_name
        profile.last_name = last_name
    db.flush()
    return profile
