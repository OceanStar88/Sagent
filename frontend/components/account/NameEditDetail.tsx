"use client";

import { useEffect, useRef, useState } from "react";
import { updateProfile } from "@/lib/api";
import { getStoredToken, getStoredUser, setStoredUser } from "@/lib/auth";
import {
  alertClass,
  buttonClass,
  dangerAlertClass,
  fieldClass,
  ghostButtonClass,
  inputClass,
  labelClass,
  ledeClass,
  sectionTitleClass,
} from "@/lib/ui";

const MAX_LENGTH = 160;

export function NameEditDetail() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDirty = value.trim() !== saved.trim();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setValue(user.display_name);
      setSaved(user.display_name);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) { setError("Display name cannot be blank."); return; }
    if (trimmed.length > MAX_LENGTH) { setError(`Display name must be ${MAX_LENGTH} characters or less.`); return; }

    const token = getStoredToken();
    if (!token) { setError("Not authenticated."); return; }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await updateProfile(token, { display_name: trimmed });
      setStoredUser(updatedUser);
      setSaved(updatedUser.display_name);
      setValue(updatedUser.display_name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setValue(saved);
    setError(null);
    setSuccess(false);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Display Name</h2>
      <p className={ledeClass}>
        Your display name is shown in calls, call notes, and teammate views throughout Sagent.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className={fieldClass}>
          <label htmlFor="display-name" className={labelClass}>
            Display name
          </label>
          <input
            id="display-name"
            ref={inputRef}
            type="text"
            autoComplete="name"
            maxLength={MAX_LENGTH}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); setSuccess(false); }}
            className={inputClass}
            aria-describedby={error ? "name-error" : success ? "name-success" : undefined}
          />
          <p className="text-right text-xs text-slate-400 dark:text-slate-500">
            {value.trim().length}/{MAX_LENGTH}
          </p>
        </div>

        {error && <p id="name-error" role="alert" className={dangerAlertClass}>{error}</p>}
        {success && !error && (
          <p id="name-success" role="status" className={alertClass}>Display name saved.</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving || !isDirty} className={buttonClass}>
            {saving ? "Saving…" : "Save name"}
          </button>
          {isDirty && (
            <button type="button" onClick={handleReset} disabled={saving} className={ghostButtonClass}>
              Discard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
