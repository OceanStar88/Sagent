"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
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

interface FormState {
  current: string;
  next: string;
  confirm: string;
}

const EMPTY: FormState = { current: "", next: "", confirm: "" };

type PasswordChecks = {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  differsFromCurrent: boolean;
  noOuterWhitespace: boolean;
  matchesConfirm: boolean;
};

function PasswordInput({
  id,
  label,
  value,
  autoComplete,
  onChange,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  onChange: (v: string) => void;
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={fieldClass}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + " pr-12"}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}

function validateForm(form: FormState): string | null {
  if (!form.current) return "Current password is required.";
  if (!form.next) return "New password is required.";
  if (form.next !== form.next.trim()) return "New password cannot start or end with whitespace.";
  if (form.next.length < 10) return "New password must be at least 10 characters.";
  if (!/[a-zA-Z]/.test(form.next) || !/\d/.test(form.next))
    return "New password must include at least one letter and one number.";
  if (form.next !== form.confirm) return "Passwords do not match.";
  if (form.current === form.next) return "New password must differ from current password.";
  return null;
}

function buildChecks(form: FormState): PasswordChecks {
  const minLength = form.next.length >= 10;
  const hasLetter = /[a-zA-Z]/.test(form.next);
  const hasNumber = /\d/.test(form.next);
  const differsFromCurrent = Boolean(form.current) && form.next !== form.current;
  const noOuterWhitespace = form.next === form.next.trim();
  const matchesConfirm = Boolean(form.confirm) && form.next === form.confirm;

  return {
    minLength,
    hasLetter,
    hasNumber,
    differsFromCurrent,
    noOuterWhitespace,
    matchesConfirm,
  };
}

export function PasswordChangeDetail() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const checks = buildChecks(form);
  const isSubmittable =
    Boolean(form.current) &&
    Boolean(form.next) &&
    Boolean(form.confirm) &&
    checks.minLength &&
    checks.hasLetter &&
    checks.hasNumber &&
    checks.differsFromCurrent &&
    checks.noOuterWhitespace &&
    checks.matchesConfirm;

  function set(field: keyof FormState) {
    return (v: string) => {
      setForm((prev) => ({ ...prev, [field]: v }));
      setError(null);
      setSuccess(false);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) { setError(validationError); return; }

    const token = getStoredToken();
    if (!token) { setError("Not authenticated."); return; }

    setSaving(true);
    setError(null);

    try {
      await changePassword(token, { current_password: form.current, new_password: form.next });
      setForm(EMPTY);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(EMPTY);
    setError(null);
    setSuccess(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Change Password</h2>
      <p className={ledeClass}>
        Choose a strong password of at least 10 characters containing both letters and numbers.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <PasswordInput
          id="current-password"
          label="Current password"
          value={form.current}
          autoComplete="current-password"
          onChange={set("current")}
        />
        <PasswordInput
          id="new-password"
          label="New password"
          value={form.next}
          autoComplete="new-password"
          onChange={set("next")}
          describedBy="pw-error"
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          value={form.confirm}
          autoComplete="new-password"
          onChange={set("confirm")}
        />

        <div className="grid gap-1.5 rounded-none border border-slate-900/10 bg-slate-50 px-3 py-3 text-xs dark:border-white/10 dark:bg-slate-800/30">
          <ValidationRow label="At least 10 characters" valid={checks.minLength} />
          <ValidationRow label="Contains at least one letter" valid={checks.hasLetter} />
          <ValidationRow label="Contains at least one number" valid={checks.hasNumber} />
          <ValidationRow label="No leading or trailing spaces" valid={checks.noOuterWhitespace} />
          <ValidationRow label="Different from current password" valid={checks.differsFromCurrent} />
          <ValidationRow label="Confirmation matches" valid={checks.matchesConfirm} />
        </div>

        {error && <p id="pw-error" role="alert" className={dangerAlertClass}>{error}</p>}
        {success && !error && (
          <p role="status" className={alertClass}>Password updated successfully.</p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <button type="submit" disabled={saving || !isSubmittable} className={buttonClass}>
            {saving ? "Updating…" : "Update password"}
          </button>
          {(form.current || form.next || form.confirm) && (
            <button type="button" onClick={handleReset} disabled={saving} className={ghostButtonClass}>
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ValidationRow({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={
          valid
            ? "inline-flex size-1.5 rounded-full bg-emerald-500"
            : "inline-flex size-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
        }
      />
      <span className={valid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{label}</span>
    </div>
  );
}
