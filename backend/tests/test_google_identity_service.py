import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from urllib.error import URLError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services import google_identity_service as service


class GoogleIdentityServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.original_cache = service._google_jwks_cache
        service._google_jwks_cache = None

    def tearDown(self) -> None:
        service._google_jwks_cache = self.original_cache

    @patch("app.services.google_identity_service.get_settings")
    @patch("app.services.google_identity_service.jwt.decode")
    @patch("app.services.google_identity_service.jwt.get_unverified_header")
    @patch("app.services.google_identity_service.urlopen")
    def test_verify_google_id_token_uses_google_jwks(self, mock_urlopen, mock_get_header, mock_decode, mock_get_settings) -> None:
        response = MagicMock()
        response.read.return_value = b'{"keys": [{"kid": "kid-1", "kty": "RSA", "n": "abc", "e": "AQAB"}]}'
        response.headers = {"Cache-Control": "public, max-age=3600, must-revalidate"}
        mock_urlopen.return_value.__enter__.return_value = response
        mock_get_header.return_value = {"kid": "kid-1", "alg": "RS256"}
        mock_decode.return_value = {
            "sub": "google-subject",
            "email": "User@Example.com",
            "email_verified": True,
        }
        mock_get_settings.return_value = SimpleNamespace(google_oauth_client_id="frontend-client-id")

        profile = service.verify_google_id_token("google-id-token")

        self.assertEqual(profile.subject, "google-subject")
        self.assertEqual(profile.email, "user@example.com")
        mock_urlopen.assert_called_once_with(service.GOOGLE_JWKS_URL, timeout=10)
        mock_decode.assert_called_once()

    @patch("app.services.google_identity_service.urlopen", side_effect=URLError("offline"))
    def test_get_google_jwks_uses_stale_cache_when_refresh_fails(self, mock_urlopen) -> None:
        stale_jwks = {"keys": [{"kid": "stale-key"}]}
        service._google_jwks_cache = service.GoogleJwksCacheEntry(jwks=stale_jwks, expires_at=0)

        jwks = service._get_google_jwks(force_refresh=True, allow_stale=True)

        self.assertEqual(jwks, stale_jwks)
        mock_urlopen.assert_called_once_with(service.GOOGLE_JWKS_URL, timeout=10)


if __name__ == "__main__":
    unittest.main()