"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useMemo, useState } from "react";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { resetPassword } from "@/lib/api";
import { alertClass, buttonClass, dangerAlertClass, mutedClass } from "@/lib/ui";

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(token) && !submitting, [submitting, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let nextPasswordError: string | null = null;
    let nextConfirmPasswordError: string | null = null;

    if (!token) {
      setError("This password reset link is missing its token.");
      return;
    }

    if (!password) {
      nextPasswordError = "Password is required.";
    } else if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextPasswordError = "Use at least 10 characters with both letters and numbers.";
    }

    if (!confirmPassword) {
      nextConfirmPasswordError = "Confirm your new password.";
    } else if (password !== confirmPassword) {
      nextConfirmPasswordError = "Passwords do not match.";
    }

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    if (nextPasswordError || nextConfirmPasswordError) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      window.setTimeout(() => {
        router.replace(`/signin${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      }, 1200);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Password recovery"
      title="Choose a new password for your account."
      description="Use the reset link from your inbox to replace the current password and return to the operator console."
      featureTitle="Security notes"
      featureItems={[
        "Reset links are time-limited and can only be used once.",
        "The new password must match the same minimum rules as signup.",
        "Google-only accounts should continue with Google instead of setting a password here.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Reset password</h2>
          <p className={mutedClass}>Set a new password and then return to sign in.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {!token ? <div className={dangerAlertClass}>This password reset link is invalid. Request a new reset email.</div> : null}
          {message ? <div className={alertClass}>{message}</div> : null}
          {error ? <div className={dangerAlertClass}>{error}</div> : null}
          <PasswordField id="reset-password" label="New password" autoComplete="new-password" value={password} disabled={!canSubmit} onChange={(value) => { setPassword(value); if (passwordError) { setPasswordError(null); } if (confirmPasswordError) { setConfirmPasswordError(null); } }} />
          {passwordError ? <p className="-mt-2 text-sm text-red-700 dark:text-red-300">{passwordError}</p> : null}
          <PasswordField id="reset-confirm-password" label="Confirm new password" autoComplete="new-password" value={confirmPassword} disabled={!canSubmit} onChange={(value) => { setConfirmPassword(value); if (confirmPasswordError) { setConfirmPasswordError(null); } }} />
          {confirmPasswordError ? <p className="-mt-2 text-sm text-red-700 dark:text-red-300">{confirmPasswordError}</p> : null}
          <button className={buttonClass} type="submit" disabled={!canSubmit}>
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
        <div className="mt-6 border-t border-slate-900/10 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          <p>Need another link? <Link href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"} className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Request password reset again</Link>.</p>
          <p className="mt-3">Already have access? <Link href="/signin" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Return to sign in</Link>.</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

function ResetPasswordPageFallback() {
  return (
    <AuthSplitLayout
      eyebrow="Password recovery"
      title="Choose a new password for your account."
      description="Use the reset link from your inbox to replace the current password and return to the operator console."
      featureTitle="Security notes"
      featureItems={[
        "Reset links are time-limited and can only be used once.",
        "The new password must match the same minimum rules as signup.",
        "Google-only accounts should continue with Google instead of setting a password here.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Reset password</h2>
          <p className={mutedClass}>Loading reset form...</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}