export type AuthUser = {
  email: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  email_verified: boolean;
  avatar_url: string | null;
  theme_preference: ThemePreference;
};

export type ThemePreference = "light" | "dark" | "system";

export type UserPreferencesPayload = {
  theme_preference: ThemePreference;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type SignupResponse = {
  email: string;
  message: string;
  verification_required: boolean;
};

export type MessageResponse = {
  message: string;
};

export type CallSummary = {
  id: string;
  direction: string;
  status: string;
  from_number: string;
  to_number: string;
  started_at: string;
  ended_at: string | null;
  recording_url: string | null;
};

export type TranscriptItem = {
  speaker: "user" | "agent";
  text: string;
  timestamp: string;
};

export type CallDetail = {
  call_id: string;
  status: string;
  direction: string;
  from_number: string;
  to_number: string;
  started_at: string;
  ended_at: string | null;
  recording_url: string | null;
  transcripts: TranscriptItem[];
};

export type Contact = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
};

export type SettingsPayload = {
  twilio: {
    account_sid: string;
    phone_number: string;
  };
  elevenlabs: {
    api_key: string;
    voice_id: string;
  };
  openai: {
    api_key: string;
  };
  agent: {
    system_prompt: string;
  };
};

export type WsMessage =
  | { type: "call_state"; state: string }
  | { type: "agent_thinking" }
  | { type: "partial_transcript"; speaker: "user" | "agent"; text: string }
  | { type: "transcript"; speaker: "user" | "agent"; text: string; timestamp?: string }
  | { type: "error"; message: string };
