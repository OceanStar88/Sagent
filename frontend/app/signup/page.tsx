"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { useAuth } from "@/hooks/useAuth";
import { buttonClass, dangerAlertClass, fieldClass, inputClass, labelClass, mutedClass } from "@/lib/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { token, loading, signUp, signUpWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const isBusy = submitting || googleSubmitting;

  useEffect(() => {
    if (!loading && token) {
      router.replace("/home");
    }
  }, [loading, router, token]);

  function validateForm() {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    let nextFirstNameError: string | null = null;
    let nextLastNameError: string | null = null;
    let nextEmailError: string | null = null;
    let nextPasswordError: string | null = null;
    let nextConfirmPasswordError: string | null = null;

    if (!trimmedFirstName) {
      nextFirstNameError = "First name is required.";
    }

    if (!trimmedLastName) {
      nextLastNameError = "Last name is required.";
    }

    if (!trimmedEmail) {
      nextEmailError = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextEmailError = "Enter a valid email address.";
    }

    if (!password) {
      nextPasswordError = "Password is required.";
    } else if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextPasswordError = "Use at least 10 characters with both letters and numbers.";
    }

    if (!confirmPassword) {
      nextConfirmPasswordError = "Confirm your password.";
    } else if (password !== confirmPassword) {
      nextConfirmPasswordError = "Passwords do not match.";
    }

    setFirstNameError(nextFirstNameError);
    setLastNameError(nextLastNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);

    if (nextFirstNameError || nextLastNameError || nextEmailError || nextPasswordError || nextConfirmPasswordError) {
      return null;
    }

    return { firstName: trimmedFirstName, lastName: trimmedLastName, email: trimmedEmail, password };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = validateForm();

    if (!values) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await signUp(values.firstName, values.lastName, values.email, values.password);
      router.replace(`/verify-email?email=${encodeURIComponent(response.email)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to Sign up.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setGoogleSubmitting(true);
    setError(null);

    try {
      await signUpWithGoogle(credential);
      router.replace("/home");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to Sign up with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Account creation"
      title="Launch your AI calling account in minutes."
      description="Create your operator account and start shaping how your voice agent sounds, responds, and reports." 
      featureTitle="Included from day one"
      featureItems={[
        "A secure operator account with email verification before dashboard access.",
        "Default app configuration so you can wire providers and prompts without extra setup.",
        "A secure email-based sign-in path with resendable verification links for operator workflows.",
      ]}
    >
      <div className="rounded-none border border-indigo-600/12 bg-slate-100/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[12px] sm:p-6 dark:border-indigo-400/12 dark:bg-slate-700/60">
        <div className="grid gap-2">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-900 dark:text-zinc-100">Sign up</h2>
          <p className={mutedClass}>Set up your account with email and password.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <label className={labelClass} htmlFor="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                className={inputClass}
                autoComplete="given-name"
                value={firstName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setFirstName(event.target.value);
                  if (firstNameError) {
                    setFirstNameError(null);
                  }
                }}
                disabled={isBusy}
              />
              {firstNameError ? <p className="text-sm text-red-700 dark:text-red-300">{firstNameError}</p> : null}
            </div>
            <div className={fieldClass}>
              <label className={labelClass} htmlFor="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                className={inputClass}
                autoComplete="family-name"
                value={lastName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setLastName(event.target.value);
                  if (lastNameError) {
                    setLastNameError(null);
                  }
                }}
                disabled={isBusy}
              />
              {lastNameError ? <p className="text-sm text-red-700 dark:text-red-300">{lastNameError}</p> : null}
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            value={password}
            disabled={isBusy}
            onChange={(value) => {
              setPassword(value);
              if (passwordError) {
                setPasswordError(null);
              }
              if (confirmPasswordError) {
                setConfirmPasswordError(null);
              }
            }}
          />
          {passwordError ? <p className="-mt-2 text-sm text-red-700 dark:text-red-300">{passwordError}</p> : null}
          <PasswordField
            id="signup-confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            disabled={isBusy}
            onChange={(value) => {
              setConfirmPassword(value);
              if (confirmPasswordError) {
                setConfirmPasswordError(null);
              }
            }}
          />
          {confirmPasswordError ? <p className="-mt-2 text-sm text-red-700 dark:text-red-300">{confirmPasswordError}</p> : null}
          <p className={mutedClass}>Use at least 10 characters with both letters and numbers.</p>
          {error ? <div className={dangerAlertClass}>{error}</div> : null}
          <button className={buttonClass} type="submit" disabled={isBusy}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
        </div>
        <GoogleAuthButton mode="signup" disabled={isBusy} busy={googleSubmitting} onCredential={handleGoogleCredential} />
        <div className="mt-6 border-t border-slate-900/10 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          <p>Already have an account? <Link href="/signin" className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200">Sign in</Link>.</p>
          <p className="mt-3">After signup, we send a verification link before first sign-in is allowed.</p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}