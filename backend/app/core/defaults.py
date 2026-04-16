DEFAULT_AGENT_SYSTEM_PROMPT = "You are a concise, friendly Singapore-based AI call assistant."


def build_default_agent_settings() -> dict:
    return {
        "twilio": {"account_sid": "", "phone_number": "+6512345678"},
        "elevenlabs": {"api_key": "", "voice_id": "demo-voice"},
        "openai": {"api_key": ""},
        "agent": {"locale": "en-SG"},
    }