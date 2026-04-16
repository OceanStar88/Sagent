"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useState } from "react";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { requestPasswordReset } from "@/lib/api";
import { alertClass, buttonClass, dangerAlertClass, fieldClass, inputClass, labelClass, mutedClass } from "@/lib/ui";

function ForgotPasswordPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setEmailError(null);
    setError(null);
    setMessage(null);

    try {
      const response = await requestPasswordReset(trimmedEmail);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to request a password reset.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Password recovery"
      title="Reset your workspace password without opening support tickets."
      description="Send a password reset link to the workspace owner email so access can be recovered without exposing protected account data."
      featureTitle="What happens next"
      featureItems={[
        "We send a reset link only when the account supports password sign-in.",
        "The link opens a secure password reset screen in this app.",
        "If the account uses Google sign-in, continue with Google instead of a password reset.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Forgot password</h2>
          <p className={mutedClass}>Enter your email address and we will send a reset link if the account can use password recovery.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {message ? <div className={alertClass}>{message}</div> : null}
          {error ? <div className={dangerAlertClass}>{error}</div> : null}
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="forgot-password-email">Email</label>
            <input
              id="forgot-password-email"
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              disabled={submitting}
            />
            {emailError ? <p className="text-sm text-red-700 dark:text-red-300">{emailError}</p> : null}
          </div>
          <button className={buttonClass} type="submit" disabled={submitting}>
            {submitting ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-6 border-t border-slate-900/10 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          <p>Remembered your password? <Link href="/signin" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Return to sign in</Link>.</p>
          <p className="mt-3">Still waiting on verification? <Link href={email.trim() ? `/verify-email?email=${encodeURIComponent(email.trim())}` : "/verify-email"} className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Open email verification</Link>.</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

function ForgotPasswordPageFallback() {
  return (
    <AuthSplitLayout
      eyebrow="Password recovery"
      title="Reset your account password without opening support tickets."
      description="Send a password reset link to the account email so access can be recovered without exposing protected account data."
      featureTitle="What happens next"
      featureItems={[
        "We send a reset link only when the account supports password sign-in.",
        "The link opens a secure password reset screen in this app.",
        "If the account uses Google sign-in, continue with Google instead of a password reset.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Forgot password</h2>
          <p className={mutedClass}>Loading recovery form...</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordPageFallback />}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}