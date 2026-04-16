"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useEffect, useState } from "react";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { resendVerification, verifyEmail } from "@/lib/api";
import { alertClass, buttonClass, dangerAlertClass, fieldClass, ghostButtonClass, inputClass, labelClass, mutedClass } from "@/lib/ui";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(token ? "Verifying your email..." : null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(Boolean(token));
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token)
      .then((response) => {
        setVerified(true);
        setMessage(response.message);
        setError(null);
      })
      .catch((requestError) => {
        setVerified(false);
        setError(requestError instanceof Error ? requestError.message : "Unable to verify email.");
        setMessage(null);
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResending(true);
    setError(null);

    try {
      const response = await resendVerification(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to resend verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Email verification"
      title="Verify your email before you enter the app."
      description="We use a verification link to confirm the account owner can receive operational emails before the first sign-in succeeds."
      featureTitle="Why this step exists"
      featureItems={[
        "Prevents an account from being claimed with an address nobody controls.",
        "Keeps operational alerts and account recovery tied to a reachable inbox.",
        "Supports a resend flow without exposing protected account data.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Verify email</h2>
          <p className={mutedClass}>Open the link from your inbox, or request another verification email below.</p>
        </div>

        <div className="mt-6 grid gap-4">
          {message ? <div className={alertClass}>{message}</div> : null}
          {error ? <div className={dangerAlertClass}>{error}</div> : null}
          {!token && initialEmail ? <div className={alertClass}>Verification email sent to <strong>{initialEmail}</strong>.</div> : null}
          {verifying ? <p className={mutedClass}>Checking your verification link...</p> : null}
          {verified ? (
            <Link href={`/signin?verified=1&email=${encodeURIComponent(email || initialEmail)}`} className={buttonClass}>
              Continue to sign in
            </Link>
          ) : null}
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleResend}>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="verification-email">Email</label>
            <input
              id="verification-email"
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <button className={ghostButtonClass} type="submit" disabled={resending || !email.trim()}>
            {resending ? "Sending verification..." : "Resend verification email"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-900/10 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          <p>Already verified? <Link href="/signin" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Return to sign in</Link>.</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

function VerifyEmailPageFallback() {
  return (
    <AuthSplitLayout
      eyebrow="Email verification"
      title="Verify your email before you enter the app."
      description="We use a verification link to confirm the account owner can receive operational emails before the first sign-in succeeds."
      featureTitle="Why this step exists"
      featureItems={[
        "Prevents an account from being claimed with an address nobody controls.",
        "Keeps operational alerts and account recovery tied to a reachable inbox.",
        "Supports a resend flow without exposing protected account data.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Verify email</h2>
          <p className={mutedClass}>Loading verification state...</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailPageFallback />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}