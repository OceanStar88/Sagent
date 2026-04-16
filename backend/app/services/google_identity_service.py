from __future__ import annotations

import json
import time
from collections.abc import Mapping
from dataclasses import dataclass
from threading import Lock
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError

from app.core.config import get_settings

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_JWKS_DEFAULT_TTL_SECONDS = 60 * 60
GOOGLE_JWKS_MIN_TTL_SECONDS = 5 * 60
GOOGLE_ISSUERS = ("accounts.google.com", "https://accounts.google.com")


class GoogleIdentityError(ValueError):
    pass


class GoogleIdentityUnavailableError(RuntimeError):
    pass


@dataclass(frozen=True)
class GoogleIdentityProfile:
    subject: str
    email: str
    given_name: str | None = None
    family_name: str | None = None


@dataclass(frozen=True)
class GoogleJwksCacheEntry:
    jwks: Mapping[str, object]
    expires_at: float


_google_jwks_cache: GoogleJwksCacheEntry | None = None
_google_jwks_cache_lock = Lock()


def verify_google_id_token(id_token: str) -> GoogleIdentityProfile:
    client_id = get_settings().google_oauth_client_id
    if not client_id:
        raise GoogleIdentityUnavailableError("Google sign-in is not configured. Set GOOGLE_OAUTH_CLIENT_ID on the backend.")

    payload = _decode_google_id_token(id_token=id_token, client_id=client_id)

    email = str(payload.get("email") or "").strip().lower()
    subject = str(payload.get("sub") or "")
    given_name = str(payload.get("given_name") or "").strip() or None
    family_name = str(payload.get("family_name") or "").strip() or None
    email_verified = _is_google_email_verified(payload.get("email_verified"))

    if not email or not subject:
        raise GoogleIdentityError("Google did not provide a usable account identity.")
    if not email_verified:
        raise GoogleIdentityError("Your Google account email must be verified before you can use Google sign-in.")

    return GoogleIdentityProfile(subject=subject, email=email, given_name=given_name, family_name=family_name)


def _decode_google_id_token(id_token: str, client_id: str) -> dict[str, object]:
    try:
        unverified_header = jwt.get_unverified_header(id_token)
    except JWTError as exc:
        raise GoogleIdentityError("Google sign-in token is invalid.") from exc

    key_id = str(unverified_header.get("kid") or "")

    for force_refresh in (False, True):
        jwks = _get_google_jwks(force_refresh=force_refresh, allow_stale=not force_refresh)

        try:
            return jwt.decode(
                id_token,
                jwks,
                algorithms=["RS256"],
                audience=client_id,
                issuer=GOOGLE_ISSUERS,
            )
        except ExpiredSignatureError as exc:
            raise GoogleIdentityError("Google sign-in expired. Try again.") from exc
        except JWTClaimsError as exc:
            raise GoogleIdentityError(_map_google_claims_error(str(exc))) from exc
        except JWTError as exc:
            if not force_refresh and key_id and not _jwks_contains_key_id(jwks, key_id):
                continue

            raise GoogleIdentityError("Google sign-in token is invalid.") from exc

    raise GoogleIdentityError("Google sign-in token is invalid.")


def _get_google_jwks(*, force_refresh: bool, allow_stale: bool) -> Mapping[str, object]:
    global _google_jwks_cache

    now = time.time()

    with _google_jwks_cache_lock:
        cache_entry = _google_jwks_cache
        if not force_refresh and cache_entry and cache_entry.expires_at > now:
            return cache_entry.jwks

    try:
        jwks, ttl_seconds = _fetch_google_jwks()
    except GoogleIdentityUnavailableError:
        if allow_stale and cache_entry is not None:
            return cache_entry.jwks
        raise

    with _google_jwks_cache_lock:
        _google_jwks_cache = GoogleJwksCacheEntry(jwks=jwks, expires_at=now + ttl_seconds)

    return jwks


def _fetch_google_jwks() -> tuple[Mapping[str, object], int]:
    try:
        with urlopen(GOOGLE_JWKS_URL, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
            if not isinstance(payload, Mapping) or not isinstance(payload.get("keys"), list):
                raise GoogleIdentityUnavailableError("Google sign-in verification keys are unavailable right now. Try again.")

            ttl_seconds = _extract_cache_ttl_seconds(response.headers.get("Cache-Control"))
            return dict(payload), ttl_seconds
    except HTTPError as exc:
        raise GoogleIdentityUnavailableError("Google sign-in verification keys are unavailable right now. Try again.") from exc
    except URLError as exc:
        raise GoogleIdentityUnavailableError("Google sign-in could not be verified right now. Check outbound connectivity and try again.") from exc


def _extract_cache_ttl_seconds(cache_control_header: str | None) -> int:
    if not cache_control_header:
        return GOOGLE_JWKS_DEFAULT_TTL_SECONDS

    for directive in cache_control_header.split(","):
        key, _, value = directive.strip().partition("=")
        if key.lower() != "max-age" or not value:
            continue

        try:
            return max(int(value), GOOGLE_JWKS_MIN_TTL_SECONDS)
        except ValueError:
            break

    return GOOGLE_JWKS_DEFAULT_TTL_SECONDS


def _jwks_contains_key_id(jwks: Mapping[str, object], key_id: str) -> bool:
    keys = jwks.get("keys")
    if not isinstance(keys, list):
        return False

    return any(isinstance(key, Mapping) and str(key.get("kid") or "") == key_id for key in keys)


def _is_google_email_verified(value: object) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() == "true"


def _map_google_claims_error(message: str) -> str:
    normalized_message = message.strip().lower()

    if normalized_message == "invalid audience":
        return "This Google token was issued for a different application."
    if normalized_message == "invalid issuer":
        return "Google token issuer is invalid."
    if "expiration time claim" in normalized_message:
        return "Google token expiration is invalid."

    return "Google sign-in token is invalid."