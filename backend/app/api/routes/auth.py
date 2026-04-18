from datetime import UTC, datetime, timedelta
from urllib.parse import quote

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.security import (
    build_google_oauth_password_hash,
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    get_password_hash,
    hash_email_verification_token,
    hash_password_reset_token,
    is_google_oauth_password_hash,
    verify_password,
)
from app.repositories.auth_repository import (
    clear_user_avatar,
    create_user,
    create_user_profile,
    get_email_verification_by_token_hash,
    get_password_reset_by_token_hash,
    get_user_avatar,
    get_user_by_email,
    get_user_by_id,
    get_user_preference,
    get_user_profile,
    is_user_email_verified,
    mark_email_as_verified,
    mark_password_reset_used,
    set_email_verification_pending,
    set_email_verification_verified,
    set_password_reset_pending,
    update_user_profile,
    update_user_theme_preference,
    upsert_user_avatar,
)
from app.schemas.auth import (
    AuthUser,
    ChangePasswordRequest,
    GoogleSigninRequest,
    GoogleSignupRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetEmailRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    UpdateProfileRequest,
    UserPreferencesPayload,
    VerificationEmailRequest,
    VerificationTokenRequest,
)
from app.services.avatar_service import (
    AvatarStorageError,
    AvatarValidationError,
    avatar_public_url,
    delete_avatar_asset,
    store_avatar_upload,
)
from app.services.email_service import (
    EmailDeliveryError,
    send_password_reset_email,
    send_verification_email,
)
from app.services.google_identity_service import (
    GoogleIdentityError,
    GoogleIdentityUnavailableError,
    verify_google_id_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def resolve_theme_preference(db: DbSession, user_id) -> str:
    preference = get_user_preference(db, user_id)
    return preference.theme_preference if preference is not None else "system"


def build_auth_user(
    *,
    email: str,
    first_name: str | None = None,
    last_name: str | None = None,
    email_verified: bool = True,
    avatar_url: str | None = None,
    theme_preference: str = "system",
) -> AuthUser:
    if first_name and last_name:
        display_name = f"{first_name} {last_name}"
    else:
        local_part = email.split("@", 1)[0].replace(".", " ").replace("_", " ").replace("-", " ").strip()
        display_name = " ".join(segment.capitalize() for segment in local_part.split()) or email
    return AuthUser(
        email=email,
        display_name=display_name,
        first_name=first_name,
        last_name=last_name,
        email_verified=email_verified,
        avatar_url=avatar_url,
        theme_preference=theme_preference,
    )


def build_token_response(
    *,
    user_id,
    email: str,
    first_name: str | None = None,
    last_name: str | None = None,
    email_verified: bool = True,
    avatar_url: str | None = None,
    theme_preference: str = "system",
) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user_id),
        user=build_auth_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            email_verified=email_verified,
            avatar_url=avatar_url,
            theme_preference=theme_preference,
        ),
    )


def build_user_token_response(db: DbSession, *, user) -> TokenResponse:
    user_profile = get_user_profile(db, user.id)
    avatar = get_user_avatar(db, user.id)
    return build_token_response(
        user_id=user.id,
        email=user.email,
        first_name=user_profile.first_name if user_profile is not None else None,
        last_name=user_profile.last_name if user_profile is not None else None,
        email_verified=is_user_email_verified(db, user),
        avatar_url=avatar_public_url(
            getattr(avatar, "storage_key", None),
            updated_at=getattr(avatar, "updated_at", None),
        ),
        theme_preference=resolve_theme_preference(db, user.id),
    )


def derive_name_from_email(email: str) -> tuple[str, str]:
    local_part = email.split("@", 1)[0].replace(".", " ").replace("_", " ").replace("-", " ").strip()
    segments = [segment for segment in local_part.split() if segment]
    if len(segments) >= 2:
        return segments[0].capitalize(), segments[-1].capitalize()
    if len(segments) == 1:
        return segments[0].capitalize(), "User"
    return "Sagent", "User"


def build_verification_url(token: str, email: str) -> str:
    base_url = settings.frontend_app_url.rstrip("/")
    return f"{base_url}/verify-email?token={quote(token)}&email={quote(email)}"


def send_signup_verification_email(*, email: str, token: str) -> None:
    send_verification_email(
        recipient_email=email,
        verification_url=build_verification_url(token, email),
    )


def build_password_reset_url(token: str, email: str) -> str:
    base_url = settings.frontend_app_url.rstrip("/")
    return f"{base_url}/reset-password?token={quote(token)}&email={quote(email)}"


def send_password_reset_link(*, email: str, token: str) -> None:
    send_password_reset_email(
        recipient_email=email,
        reset_url=build_password_reset_url(token, email),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Invalid credentials")
    if is_google_oauth_password_hash(user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This account uses Google sign-in. Continue with Google to access your account.")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Invalid credentials")
    if not is_user_email_verified(db, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email before signing in. Request a new verification link if needed.",
        )
    return build_user_token_response(db, user=user)


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: DbSession) -> SignupResponse:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail="An account already exists for that email")

    verification_token = create_email_verification_token()
    verification_expires_at = datetime.now(UTC) + timedelta(hours=settings.email_verification_expire_hours)

    try:
        user = create_user(
            db,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
        )
        create_user_profile(
            db,
            user_id=user.id,
            first_name=payload.first_name,
            last_name=payload.last_name,
        )
        set_email_verification_pending(
            db,
            user=user,
            token_hash=hash_email_verification_token(verification_token),
            expires_at=verification_expires_at,
        )
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail="An account already exists for that email") from exc

    try:
        send_signup_verification_email(email=user.email, token=verification_token)
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Your account was created, but the verification email could not be delivered. "
                f"{exc}"
            ),
        ) from exc

    return SignupResponse(
        email=user.email,
        message="Check your inbox to verify your email before signing in.",
        verification_required=True,
    )


@router.post("/google/signin", response_model=TokenResponse)
def google_signin(payload: GoogleSigninRequest, db: DbSession) -> TokenResponse:
    try:
        profile = verify_google_id_token(payload.id_token)
    except GoogleIdentityError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail=str(exc)) from exc
    except GoogleIdentityUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                            detail=str(exc)) from exc

    user = get_user_by_email(db, profile.email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="No account exists for that Google email. Sign up first.")

    if not is_user_email_verified(db, user):
        set_email_verification_verified(db, user=user, verified_at=datetime.now(UTC))
        db.commit()

    return build_user_token_response(db, user=user)


@router.post("/google/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def google_signup(payload: GoogleSignupRequest, db: DbSession) -> TokenResponse:
    try:
        profile = verify_google_id_token(payload.id_token)
    except GoogleIdentityError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except GoogleIdentityUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if get_user_by_email(db, profile.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail="An account already exists for that Google email")

    try:
        user = create_user(
            db,
            email=profile.email,
            password_hash=build_google_oauth_password_hash(profile.subject),
        )
        first_name, last_name = (
            (profile.given_name, profile.family_name)
            if profile.given_name and profile.family_name
            else derive_name_from_email(profile.email)
        )
        create_user_profile(db, user_id=user.id, first_name=first_name, last_name=last_name)
        set_email_verification_verified(db, user=user, verified_at=datetime.now(UTC))
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail="An account already exists for that Google email") from exc

    return build_user_token_response(db, user=user)


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerificationTokenRequest, db: DbSession) -> MessageResponse:
    verification = get_email_verification_by_token_hash(db, hash_email_verification_token(payload.token))
    if verification is None or verification.expires_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This verification link is invalid or has already been used")

    now = datetime.now(UTC)
    if verification.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This verification link has expired")

    mark_email_as_verified(db, verification, verified_at=now)
    db.commit()
    return MessageResponse(message="Email verified. You can now sign in.")


@router.post("/resend-verification", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def resend_verification_email(payload: VerificationEmailRequest, db: DbSession) -> MessageResponse:
    user = get_user_by_email(db, payload.email)
    generic_message = "If that account is awaiting verification, a new email has been sent."
    if user is None or is_user_email_verified(db, user):
        return MessageResponse(message=generic_message)

    verification_token = create_email_verification_token()
    verification_expires_at = datetime.now(UTC) + timedelta(hours=settings.email_verification_expire_hours)
    set_email_verification_pending(
        db,
        user=user,
        token_hash=hash_email_verification_token(verification_token),
        expires_at=verification_expires_at,
    )
    db.commit()
    try:
        send_signup_verification_email(email=user.email, token=verification_token)
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"The verification email could not be delivered. {exc}",
        ) from exc

    return MessageResponse(message=generic_message)


@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def forgot_password(payload: PasswordResetEmailRequest, db: DbSession) -> MessageResponse:
    user = get_user_by_email(db, payload.email)
    generic_message = "If that account can reset a password, a reset link has been sent."
    if user is None or is_google_oauth_password_hash(user.password_hash):
        return MessageResponse(message=generic_message)

    reset_token = create_password_reset_token()
    reset_expires_at = datetime.now(UTC) + timedelta(hours=settings.email_verification_expire_hours)
    set_password_reset_pending(
        db,
        user=user,
        token_hash=hash_password_reset_token(reset_token),
        expires_at=reset_expires_at,
    )
    db.commit()
    try:
        send_password_reset_link(email=user.email, token=reset_token)
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"The password reset email could not be delivered. {exc}",
        ) from exc

    return MessageResponse(message=generic_message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: PasswordResetConfirmRequest, db: DbSession) -> MessageResponse:
    password_reset = get_password_reset_by_token_hash(db, hash_password_reset_token(payload.token))
    if password_reset is None or password_reset.expires_at is None or password_reset.used_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This password reset link is invalid or has already been used")

    now = datetime.now(UTC)
    if password_reset.expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This password reset link has expired")

    user = get_user_by_id(db, password_reset.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This password reset link is invalid")
    if is_google_oauth_password_hash(user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="This account uses Google sign-in. Continue with Google to access your account.")

    user.password_hash = get_password_hash(payload.password)
    mark_password_reset_used(db, password_reset, used_at=now)
    db.commit()
    return MessageResponse(message="Password updated. You can now sign in with your new password.")


@router.get("/me", response_model=AuthUser)
def get_me(current_user: CurrentUser, db: DbSession) -> AuthUser:
    avatar = get_user_avatar(db, current_user.id)
    user_profile = get_user_profile(db, current_user.id)
    return build_auth_user(
        email=current_user.email,
        first_name=user_profile.first_name if user_profile is not None else None,
        last_name=user_profile.last_name if user_profile is not None else None,
        email_verified=is_user_email_verified(db, current_user),
        avatar_url=avatar_public_url(
            avatar.storage_key if avatar else None,
            updated_at=avatar.updated_at if avatar else None,
        ),
        theme_preference=resolve_theme_preference(db, current_user.id),
    )


@router.patch("/profile", response_model=AuthUser)
def update_profile(payload: UpdateProfileRequest, current_user: CurrentUser, db: DbSession) -> AuthUser:
    parts = payload.display_name.split(None, 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""

    update_user_profile(db, user_id=current_user.id, first_name=first_name, last_name=last_name)
    db.commit()

    avatar = get_user_avatar(db, current_user.id)
    return build_auth_user(
        email=current_user.email,
        first_name=first_name,
        last_name=last_name or None,
        email_verified=is_user_email_verified(db, current_user),
        avatar_url=avatar_public_url(
            avatar.storage_key if avatar else None,
            updated_at=avatar.updated_at if avatar else None,
        ),
        theme_preference=resolve_theme_preference(db, current_user.id),
    )


@router.post("/change-password", response_model=MessageResponse)
def change_password(payload: ChangePasswordRequest, current_user: CurrentUser, db: DbSession) -> MessageResponse:
    if is_google_oauth_password_hash(current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password change is not available for Google sign-in accounts.",
        )
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from current password.",
        )
    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated successfully.")


@router.post("/avatar", response_model=AuthUser)
async def upload_avatar(*, file: UploadFile = File(...), current_user: CurrentUser, db: DbSession) -> AuthUser:
    try:
        storage_key, content_type, original_filename, file_size = await store_avatar_upload(file, user_id=current_user.id)
    except AvatarValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail=str(exc)) from exc
    except AvatarStorageError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                            detail=str(exc)) from exc

    try:
        avatar = upsert_user_avatar(
            db,
            user=current_user,
            storage_key=storage_key,
            original_filename=original_filename,
            content_type=content_type,
            file_size=file_size,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    user_profile = get_user_profile(db, current_user.id)

    return build_auth_user(
        email=current_user.email,
        first_name=user_profile.first_name if user_profile is not None else None,
        last_name=user_profile.last_name if user_profile is not None else None,
        email_verified=is_user_email_verified(db, current_user),
        avatar_url=avatar_public_url(avatar.storage_key, updated_at=avatar.updated_at),
        theme_preference=resolve_theme_preference(db, current_user.id),
    )


@router.delete("/avatar", response_model=AuthUser)
def delete_avatar(current_user: CurrentUser, db: DbSession) -> AuthUser:
    deleted_avatar = clear_user_avatar(db, current_user)
    db.commit()
    if deleted_avatar is not None:
        try:
            delete_avatar_asset(deleted_avatar.storage_key)
        except AvatarStorageError:
            pass

    user_profile = get_user_profile(db, current_user.id)

    return build_auth_user(
        email=current_user.email,
        first_name=user_profile.first_name if user_profile is not None else None,
        last_name=user_profile.last_name if user_profile is not None else None,
        email_verified=is_user_email_verified(db, current_user),
        avatar_url=None,
        theme_preference=resolve_theme_preference(db, current_user.id),
    )


@router.get("/preferences", response_model=UserPreferencesPayload)
def get_user_preferences(current_user: CurrentUser, 
                         db: DbSession) -> UserPreferencesPayload:
    return UserPreferencesPayload(theme_preference=resolve_theme_preference(db, current_user.id))


@router.put("/preferences", response_model=UserPreferencesPayload)
def update_user_preferences(payload: UserPreferencesPayload, 
                            current_user: CurrentUser, 
                            db: DbSession) -> UserPreferencesPayload:
    preference = update_user_theme_preference(db, user=current_user, 
                                              theme_preference=payload.theme_preference)
    db.commit()
    return UserPreferencesPayload(theme_preference=preference.theme_preference)
