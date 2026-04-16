from __future__ import annotations

from importlib import import_module
from io import BytesIO

from fastapi import UploadFile

from app.core.config import get_settings


class AvatarValidationError(ValueError):
    pass


class AvatarStorageError(RuntimeError):
    pass


ALLOWED_IMAGE_FORMATS = {
    "JPEG": ("image/jpeg", ".jpg"),
    "PNG": ("image/png", ".png"),
    "WEBP": ("image/webp", ".webp"),
}


def avatar_public_url(storage_key: str | None) -> str | None:
    if not storage_key:
        return None

    cloudinary_module = _require_cloudinary()
    cloudinary_module.config(
        cloud_name=_require_setting("cloudinary_cloud_name"),
        api_key=_require_setting("cloudinary_api_key"),
        api_secret=_require_setting("cloudinary_api_secret"),
        secure=True,
    )

    CloudinaryImage = import_module("cloudinary").CloudinaryImage
    return CloudinaryImage(storage_key).build_url(
        secure=True,
        fetch_format="auto",
        quality="auto",
        crop="fill",
        gravity="face",
        width=get_settings().avatar_image_size,
        height=get_settings().avatar_image_size,
    )


async def store_avatar_upload(file: UploadFile, *, user_id) -> tuple[str, str, str, int]:
    settings = get_settings()
    try:
        raw = await file.read(settings.avatar_max_bytes + 1)
    finally:
        await file.close()

    if not raw:
        raise AvatarValidationError("Select an image to upload.")
    if len(raw) > settings.avatar_max_bytes:
        raise AvatarValidationError(f"Avatar images must be {settings.avatar_max_bytes // (1024 * 1024)} MB or smaller.")

    normalized_bytes, content_type, original_filename = _normalize_avatar_image(raw, filename=file.filename)
    public_id = _avatar_public_id(user_id)
    upload_result = _upload_to_cloudinary(
        file_bytes=normalized_bytes,
        public_id=public_id,
        content_type=content_type,
        original_filename=original_filename,
    )
    uploaded_public_id = upload_result.get("public_id")
    if not isinstance(uploaded_public_id, str) or not uploaded_public_id:
        raise AvatarStorageError("Cloudinary did not return a valid avatar identifier.")

    returned_content_type = upload_result.get("resource_type")
    file_size = len(normalized_bytes)
    if isinstance(upload_result.get("bytes"), int):
        file_size = upload_result["bytes"]

    return uploaded_public_id, content_type if returned_content_type == "image" else content_type, original_filename, file_size


def delete_avatar_asset(storage_key: str | None) -> None:
    if not storage_key:
        return

    uploader = _require_cloudinary_uploader()
    try:
        uploader.destroy(storage_key, invalidate=True, resource_type="image")
    except Exception as exc:
        raise AvatarStorageError("Avatar removal failed on Cloudinary.") from exc


def _normalize_avatar_image(raw: bytes, *, filename: str | None) -> tuple[bytes, str, str]:
    Image, ImageOps = _require_pillow()

    try:
        image = Image.open(BytesIO(raw))
        image.load()
    except Exception as exc:
        raise AvatarValidationError("The uploaded file is not a valid image.") from exc

    source_format = (image.format or "").upper()
    if source_format not in ALLOWED_IMAGE_FORMATS:
        raise AvatarValidationError("Only PNG, JPEG, and WebP images are supported.")

    image = ImageOps.exif_transpose(image)
    if image.width < 32 or image.height < 32:
        raise AvatarValidationError("Avatar images must be at least 32x32 pixels.")

    target_size = get_settings().avatar_image_size
    resampling = getattr(Image, "Resampling", Image).LANCZOS
    processed = ImageOps.fit(image, (target_size, target_size), method=resampling, centering=(0.5, 0.5))

    has_alpha = "A" in processed.getbands()
    buffer = BytesIO()
    if has_alpha:
        processed.save(buffer, format="PNG", optimize=True)
        content_type = "image/png"
    else:
        if processed.mode not in ("RGB", "L"):
            processed = processed.convert("RGB")
        processed.save(buffer, format="JPEG", quality=88, optimize=True, progressive=True)
        content_type = "image/jpeg"

    return buffer.getvalue(), content_type, _sanitize_filename(filename)


def _upload_to_cloudinary(*, file_bytes: bytes, public_id: str, content_type: str, original_filename: str) -> dict:
    cloudinary_module = _require_cloudinary()
    cloudinary_module.config(
        cloud_name=_require_setting("cloudinary_cloud_name"),
        api_key=_require_setting("cloudinary_api_key"),
        api_secret=_require_setting("cloudinary_api_secret"),
        secure=True,
    )
    uploader = _require_cloudinary_uploader()

    try:
        return uploader.upload(
            BytesIO(file_bytes),
            public_id=public_id,
            overwrite=True,
            invalidate=True,
            resource_type="image",
            folder=None,
            use_filename=False,
            unique_filename=False,
            filename=original_filename,
            context={"original_filename": original_filename},
            format="png" if content_type == "image/png" else "jpg",
        )
    except Exception as exc:
        raise AvatarStorageError("Avatar upload to Cloudinary failed. Check Cloudinary credentials and connectivity.") from exc


def _avatar_public_id(user_id) -> str:
    folder = get_settings().cloudinary_avatar_folder.strip("/")
    if folder:
        return f"{folder}/{user_id}/avatar"
    return f"{user_id}/avatar"


def _sanitize_filename(filename: str | None) -> str:
    if not filename:
        return "avatar"
    cleaned = filename.replace("\\", "/").split("/")[-1].strip()
    return cleaned[:255] or "avatar"


def _require_setting(name: str) -> str:
    value = getattr(get_settings(), name)
    if not value:
        raise AvatarStorageError(f"Missing required Cloudinary setting: {name.upper()}.")
    return value


def _require_cloudinary():
    try:
        return import_module("cloudinary")
    except ModuleNotFoundError as exc:
        raise AvatarStorageError("Cloudinary support is not installed. Install backend dependencies to enable avatar uploads.") from exc


def _require_cloudinary_uploader():
    try:
        return import_module("cloudinary.uploader")
    except ModuleNotFoundError as exc:
        raise AvatarStorageError("Cloudinary support is not installed. Install backend dependencies to enable avatar uploads.") from exc


def _require_pillow():
    try:
        image_module = import_module("PIL.Image")
        image_ops_module = import_module("PIL.ImageOps")
        return image_module, image_ops_module
    except ModuleNotFoundError as exc:
        raise AvatarStorageError("Pillow is not installed. Install backend dependencies to enable production-grade avatar processing.") from exc
