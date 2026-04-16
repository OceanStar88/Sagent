from app.services.call_service import CallService
from app.services.mock_voice_engine import MockVoiceEngine
from app.services.session_service import SessionManager

session_manager = SessionManager()
call_service = CallService(session_manager=session_manager, voice_engine=MockVoiceEngine())
