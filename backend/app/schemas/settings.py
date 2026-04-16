from pydantic import BaseModel, Field


class TwilioSettings(BaseModel):
    account_sid: str = ""
    phone_number: str = ""


class ElevenLabsSettings(BaseModel):
    api_key: str = ""
    voice_id: str = ""


class OpenAISettings(BaseModel):
    api_key: str = ""


class AgentSettings(BaseModel):
    system_prompt: str = Field(default="You are a concise, helpful AI call assistant.")


class SettingsPayload(BaseModel):
    twilio: TwilioSettings = Field(default_factory=TwilioSettings)
    elevenlabs: ElevenLabsSettings = Field(default_factory=ElevenLabsSettings)
    openai: OpenAISettings = Field(default_factory=OpenAISettings)
    agent: AgentSettings = Field(default_factory=AgentSettings)
