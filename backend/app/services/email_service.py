import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    pass


def send_verification_email(*, recipient_email: str, verification_url: str) -> None:
    subject = "Verify your Sagent email"
    text_body = (
        "Verify your Sagent account email.\n\n"
        f"Open this link to continue: {verification_url}\n\n"
        "If you did not request this account, you can ignore this email."
    )
    html_body = (
        "<p>Verify your Sagent account email.</p>"
        f"<p><a href=\"{verification_url}\">Verify your email</a></p>"
        "<p>If you did not request this account, you can ignore this email.</p>"
    )
    send_email(
        recipient_email=recipient_email,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        fallback_message=f"Verification URL for {recipient_email}: {verification_url}",
    )


def send_password_reset_email(*, recipient_email: str, reset_url: str) -> None:
    subject = "Reset your Sagent password"
    text_body = (
        "A password reset was requested for your Sagent account.\n\n"
        f"Open this link to choose a new password: {reset_url}\n\n"
        "If you did not request a reset, you can ignore this email."
    )
    html_body = (
        "<p>A password reset was requested for your Sagent account.</p>"
        f"<p><a href=\"{reset_url}\">Reset your password</a></p>"
        "<p>If you did not request a reset, you can ignore this email.</p>"
    )
    send_email(
        recipient_email=recipient_email,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        fallback_message=f"Password reset URL for {recipient_email}: {reset_url}",
    )


def send_email(
    *,
    recipient_email: str,
    subject: str,
    text_body: str,
    html_body: str,
    fallback_message: str,
) -> None:
    settings = get_settings()

    if not settings.smtp_host:
        logger.warning("SMTP is not configured. %s", fallback_message)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = recipient_email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as smtp:
                _login_and_send(smtp, message)
            return

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            _login_and_send(smtp, message)
    except smtplib.SMTPAuthenticationError as exc:
        logger.exception("SMTP authentication failed for host %s", settings.smtp_host)
        error_text = exc.smtp_error.decode("utf-8", errors="ignore") if isinstance(exc.smtp_error, bytes) else str(exc.smtp_error)
        if "basic authentication is disabled" in error_text.lower():
            raise EmailDeliveryError(
                "SMTP authentication failed because this Outlook account does not allow basic username/password SMTP auth. "
                "Use an SMTP provider that supports app-password or API credentials, or switch to Gmail app-password, SendGrid, or Mailtrap."
            ) from exc
        raise EmailDeliveryError("SMTP authentication failed. Check SMTP_USERNAME, SMTP_PASSWORD, and provider security settings.") from exc
    except smtplib.SMTPException as exc:
        logger.exception("SMTP delivery failed for host %s", settings.smtp_host)
        raise EmailDeliveryError("Email delivery failed. Check SMTP host, port, TLS/SSL settings, and provider availability.") from exc


def _login_and_send(smtp: smtplib.SMTP, message: EmailMessage) -> None:
    settings = get_settings()

    if settings.smtp_username and settings.smtp_password:
        smtp.login(settings.smtp_username, settings.smtp_password)

    smtp.send_message(message)