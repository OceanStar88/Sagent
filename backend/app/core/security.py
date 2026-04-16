import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

# Use PBKDF2 for new hashes to avoid bcrypt backend edge cases while still
# accepting legacy bcrypt hashes if one already exists in the database.
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
settings = get_settings()
GOOGLE_OAUTH_PASSWORD_HASH_PREFIX = "google-oauth$"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def build_google_oauth_password_hash(subject: str) -> str:
    return f"{GOOGLE_OAUTH_PASSWORD_HASH_PREFIX}{hashlib.sha256(subject.encode('utf-8')).hexdigest()}"


def is_google_oauth_password_hash(password_hash: str) -> bool:
    return password_hash.startswith(GOOGLE_OAUTH_PASSWORD_HASH_PREFIX)


def create_email_verification_token() -> str:
    return secrets.token_urlsafe(32)


def hash_email_verification_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_password_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid access token") from exc
