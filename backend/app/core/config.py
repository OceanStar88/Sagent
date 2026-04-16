from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sagent API"
    api_prefix: str = "/v1"
    database_url: str = "postgresql+psycopg://postgres:8811@localhost:5432/sagent"
    frontend_app_url: str = "http://localhost:3000"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    email_verification_expire_hours: int = 24
    google_oauth_client_id: str | None = None
    cors_origins: list[str] = ["http://localhost:3000"]
    auth_allow_test_email_domains: bool = True
    avatar_max_bytes: int = 5 * 1024 * 1024
    avatar_image_size: int = 512
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    cloudinary_avatar_folder: str = "sagent/avatars"
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_from_email: str = "no-reply@sagent.local"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
