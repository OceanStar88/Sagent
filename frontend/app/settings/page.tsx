"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getSettings, updateSettings } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import {
  alertClass,
  buttonClass,
  buttonRowClass,
  eyebrowClass,
  fieldClass,
  inputClass,
  labelClass,
  ledeClass,
  nestedPanelClass,
  pageStackClass,
  pageTitleClass,
  panelClass,
  sectionTitleClass,
  settingsGridClass,
  splitGridClass,
  textareaClass,
} from "@/lib/ui";
import type { SettingsPayload } from "@/types";


const DEFAULT_SETTINGS: SettingsPayload = {
  twilio: { account_sid: "", phone_number: "+6512345678" },
  elevenlabs: { api_key: "", voice_id: "demo-voice" },
  openai: { api_key: "" },
  agent: { system_prompt: "You are a concise, friendly Singapore-based AI call assistant." },
};


export default function SettingsPage() {
  const [form, setForm] = useState<SettingsPayload>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    getSettings(token)
      .then(setForm)
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  function updateField(section: keyof SettingsPayload, field: string, value: string) {
    setForm((current: SettingsPayload) => {
      switch (section) {
        case "twilio":
          return { ...current, twilio: { ...current.twilio, [field]: value } };
        case "elevenlabs":
          return { ...current, elevenlabs: { ...current.elevenlabs, [field]: value } };
        case "openai":
          return { ...current, openai: { ...current.openai, [field]: value } };
        case "agent":
          return { ...current, agent: { ...current.agent, [field]: value } };
      }
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) {
      return;
    }
    try {
      const saved = await updateSettings(token, form);
      setForm(saved);
      setStatus("Settings saved.");
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save settings.");
      setStatus(null);
    }
  }

  return (
    <AppShell>
      <section className={panelClass}>
        <div className="flex flex-col gap-3">
          <p className={eyebrowClass}>Account configuration</p>
          <h1 className={pageTitleClass}>Settings</h1>
          <p className={ledeClass}>These values persist per account and feed the simulated call engine.</p>
        </div>
        <div className={pageStackClass}>
          {status ? <div className={alertClass}>{status}</div> : null}
          {error ? <div className={alertClass}>{error}</div> : null}
          <form className={settingsGridClass} onSubmit={handleSubmit}>
            <div className={splitGridClass}>
              <div className={nestedPanelClass}>
                <h2 className={sectionTitleClass}>Twilio</h2>
                <div className={fieldClass}>
                  <label className={labelClass} htmlFor="account_sid">Account SID</label>
                  <input id="account_sid" className={inputClass} value={form.twilio.account_sid} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("twilio", "account_sid", event.target.value)} />
                </div>
                <div className={fieldClass}>
                  <label className={labelClass} htmlFor="phone_number">Phone number</label>
                  <input id="phone_number" className={inputClass} value={form.twilio.phone_number} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("twilio", "phone_number", event.target.value)} />
                </div>
              </div>

              <div className={nestedPanelClass}>
                <h2 className={sectionTitleClass}>Voice providers</h2>
                <div className={fieldClass}>
                  <label className={labelClass} htmlFor="voice_id">ElevenLabs voice ID</label>
                  <input id="voice_id" className={inputClass} value={form.elevenlabs.voice_id} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("elevenlabs", "voice_id", event.target.value)} />
                </div>
                <div className={fieldClass}>
                  <label className={labelClass} htmlFor="openai_key">OpenAI API key</label>
                  <input id="openai_key" className={inputClass} value={form.openai.api_key} onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("openai", "api_key", event.target.value)} />
                </div>
              </div>
            </div>

            <div className={nestedPanelClass}>
              <h2 className={sectionTitleClass}>Agent prompt</h2>
              <div className={fieldClass}>
                <label className={labelClass} htmlFor="system_prompt">System prompt</label>
                <textarea
                  id="system_prompt"
                  className={textareaClass}
                  value={form.agent.system_prompt}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField("agent", "system_prompt", event.target.value)}
                />
              </div>
            </div>

            <div className={buttonRowClass}>
              <button className={buttonClass} type="submit">
              Save settings
              </button>
            </div>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
