import re

from email_validator import EmailNotValidError
from email_validator import validate_email as validate_email_address
from pydantic import BaseModel, Field, field_validator

from app.core.config import get_settings

settings = get_settings()

EMAIL_LOCAL_PART_PATTERN = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$")
EMAIL_DOMAIN_LABEL_PATTERN = re.compile(r"^[A-Za-z0-9-]{1,63}$")


def normalize_email(value: str) -> str:
    return value.strip().lower()


def validate_email_value(value: str) -> str:
    email = normalize_email(value)

    try:
        result = validate_email_address(
            email,
            check_deliverability=False,
            test_environment=settings.auth_allow_test_email_domains,
        )
    except EmailNotValidError as exc:
        if settings.auth_allow_test_email_domains and "special-use or reserved name" in str(exc).lower():
            return validate_reserved_domain_email(email)
        raise ValueError(str(exc)) from exc

    return result.normalized


def validate_reserved_domain_email(email: str) -> str:
    if "@" not in email:
        raise ValueError("An email address must contain a single @-sign")

    local_part, domain = email.rsplit("@", 1)

    if not local_part or not domain:
        raise ValueError("An email address must include both a local part and a domain")

    if not EMAIL_LOCAL_PART_PATTERN.fullmatch(local_part):
        raise ValueError("The part before the @-sign is not valid")

    labels = domain.split(".")
    if len(labels) < 2:
        raise ValueError("The part after the @-sign is not valid. It should have a period.")

    for label in labels:
        if not EMAIL_DOMAIN_LABEL_PATTERN.fullmatch(label) or label.startswith("-") or label.endswith("-"):
            raise ValueError("The part after the @-sign is not valid")

    if not labels[-1][-1].isalpha():
        raise ValueError("The part after the @-sign is not within a valid top-level domain")

    return email


def validate_password_strength(value: str) -> str:
    password = value.strip()
    if len(password) < 10:
        raise ValueError("Password must be at least 10 characters long")
    if password != value:
        raise ValueError("Password cannot start or end with whitespace")
    if not any(character.isalpha() for character in password) or not any(character.isdigit() for character in password):
        raise ValueError("Password must include at least one letter and one number")
    return password


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return validate_email_value(value)


class SignupRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: str
    password: str = Field(min_length=10, max_length=128)

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name_part(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Name fields cannot be empty")
        return normalized

    @field_validator("email")
    @classmethod
    def validate_signup_email(cls, value: str) -> str:
        return validate_email_value(value)

    @field_validator("password")
    @classmethod
    def validate_signup_password(cls, value: str) -> str:
        return validate_password_strength(value)


class GoogleSigninRequest(BaseModel):
    id_token: str = Field(min_length=20, max_length=4096)


class GoogleSignupRequest(BaseModel):
    id_token: str = Field(min_length=20, max_length=4096)


class AuthUser(BaseModel):
    email: str
    display_name: str
    first_name: str | None = None
    last_name: str | None = None
    role: str = "Operator"
    email_verified: bool = True
    avatar_url: str | None = None
    theme_preference: str = "system"

    @field_validator("email")
    @classmethod
    def validate_auth_user_email(cls, value: str) -> str:
        return validate_email_value(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser


class SignupResponse(BaseModel):
    email: str
    message: str
    verification_required: bool = True


class VerificationTokenRequest(BaseModel):
    token: str = Field(min_length=20, max_length=255)


class VerificationEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_verification_email(cls, value: str) -> str:
        return validate_email_value(value)


class PasswordResetEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_password_reset_email(cls, value: str) -> str:
        return validate_email_value(value)


class PasswordResetConfirmRequest(BaseModel):
    token: str = Field(min_length=20, max_length=255)
    password: str = Field(min_length=10, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_reset_password(cls, value: str) -> str:
        return validate_password_strength(value)


class MessageResponse(BaseModel):
    message: str


class UserPreferencesPayload(BaseModel):
    theme_preference: str = Field(default="system")

    @field_validator("theme_preference")
    @classmethod
    def validate_theme_preference(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"light", "dark", "system"}:
            raise ValueError("Theme preference must be one of: light, dark, system")
        return normalized


class UpdateProfileRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=160)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Display name cannot be blank")
        return stripped


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=10, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)
