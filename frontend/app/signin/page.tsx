"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { useAuth } from "@/hooks/useAuth";
import { resendVerification } from "@/lib/api";
import { alertClass, buttonClass, dangerAlertClass, fieldClass, ghostButtonClass, inputClass, labelClass, mutedClass } from "@/lib/ui";

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, loading, signIn, signInWithGoogle } = useAuth();
  const verified = searchParams.get("verified") === "1";
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const verificationEmail = email || searchParams.get("email") || "";
  const isBusy = submitting || googleSubmitting || resendingVerification;

  useEffect(() => {
    if (!loading && token) {
      router.replace("/home");
    }
  }, [loading, router, token]);

  function validateForm() {
    const trimmedEmail = email.trim().toLowerCase();
    let nextEmailError: string | null = null;
    let nextPasswordError: string | null = null;

    if (!trimmedEmail) {
      nextEmailError = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextEmailError = "Enter a valid email address.";
    }

    if (!password) {
      nextPasswordError = "Password is required.";
    }

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return null;
    }

    return { email: trimmedEmail, password };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = validateForm();

    if (!values) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await signIn(values.email, values.password);
      router.replace("/home");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setGoogleSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithGoogle(credential);
      router.replace("/home");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function handleInlineResendVerification() {
    const trimmedEmail = verificationEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setEmailError("Enter your email address to resend verification.");
      return;
    }

    setResendingVerification(true);
    setError(null);
    setMessage(null);

    try {
      const response = await resendVerification(trimmedEmail);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to resend verification email.");
    } finally {
      setResendingVerification(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Operator access"
      title="Run every voice workflow from one control plane."
      description="Sign in to the Sagent operator console to launch calls, monitor live transcripts, and tune your AI configuration in real time."
      featureTitle="What operators get"
      featureItems={[
        "A single account view for call activity, contacts, settings, and controls.",
        "Live transcript visibility while the AI is listening, thinking, and responding.",
        "Fast account-level updates for prompt, Twilio, ElevenLabs, and OpenAI settings.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Sign in</h2>
          <p className={mutedClass}>Access your existing account with email and password.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {verified ? <div className="rounded-none border border-emerald-600/25 bg-emerald-600/10 px-4 py-3 text-sm text-slate-900 dark:border-emerald-400/30 dark:bg-emerald-400/14 dark:text-zinc-100">Email verified. Sign in to open your account.</div> : null}
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
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
              disabled={isBusy}
            />
            {emailError ? <p className="text-sm text-red-700 dark:text-red-300">{emailError}</p> : null}
          </div>
          <PasswordField
            id="signin-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            disabled={isBusy}
            onChange={(value) => {
              setPassword(value);
              if (passwordError) {
                setPasswordError(null);
              }
            }}
          />
          {passwordError ? <p className="-mt-2 text-sm text-red-700 dark:text-red-300">{passwordError}</p> : null}
          {message ? <div className={alertClass}>{message}</div> : null}
          {error ? <div className={dangerAlertClass}>{error}</div> : null}
          {error?.toLowerCase().includes("verify your email") && verificationEmail ? (
            <div className="grid gap-2">
              <Link href={`/verify-email?email=${encodeURIComponent(verificationEmail)}`} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">
                Open email verification page
              </Link>
              <button type="button" className={ghostButtonClass} onClick={handleInlineResendVerification} disabled={isBusy}>
                {resendingVerification ? "Sending verification..." : "Resend verification email"}
              </button>
            </div>
          ) : null}
          <button className={buttonClass} type="submit" disabled={isBusy}>
            {submitting ? "Signing in..." : "Enter dashboard"}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
        </div>
        <GoogleAuthButton mode="signin" busy={googleSubmitting} disabled={submitting || resendingVerification} onCredential={handleGoogleCredential} />
        <div className="mt-6 border-t border-slate-900/10 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          <p>New to Sagent? <Link href="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Sign up</Link>.</p>
          <p className="mt-3">First-time accounts must verify their email before they can sign in.</p>
          <p className="mt-3"><Link href={verificationEmail ? `/forgot-password?email=${encodeURIComponent(verificationEmail)}` : "/forgot-password"} className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Forgot your password?</Link></p>
          <p className="mt-3">Demo access remains available with <strong>admin@sagent.local</strong> and <strong>password123</strong>.</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

function SignInPageFallback() {
  return (
    <AuthSplitLayout
      eyebrow="Operator access"
      title="Run every voice workflow from one control plane."
      description="Sign in to the Sagent operator console to launch calls, monitor live transcripts, and tune your AI configuration in real time."
      featureTitle="What operators get"
      featureItems={[
        "A single account view for call activity, contacts, settings, and controls.",
        "Live transcript visibility while the AI is listening, thinking, and responding.",
        "Fast account-level updates for prompt, Twilio, ElevenLabs, and OpenAI settings.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Sign in</h2>
          <p className={mutedClass}>Loading sign-in options...</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInPageContent />
    </Suspense>
  );
}