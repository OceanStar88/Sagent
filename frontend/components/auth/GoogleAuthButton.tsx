"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

import { cn, mutedClass } from "@/lib/ui";


type GoogleAuthButtonProps = {
  mode: "signin" | "signup";
  disabled?: boolean;
  busy?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
};


const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";


export function GoogleAuthButton({ mode, disabled = false, busy = false, onCredential }: GoogleAuthButtonProps) {
  const elementId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const initializedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.google?.accounts?.id) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) {
      return;
    }

    const updateButtonWidth = () => {
      if (!wrapperRef.current) {
        return;
      }
      setButtonWidth(Math.round(wrapperRef.current.getBoundingClientRect().width));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateButtonWidth();
    });

    updateButtonWidth();
    resizeObserver.observe(wrapperRef.current);
    window.addEventListener("resize", updateButtonWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateButtonWidth);
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !window.google?.accounts?.id || initializedRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        if (credential) {
          void onCredentialRef.current(credential);
        }
      },
      context: mode,
      ux_mode: "popup",
      auto_select: false,
    });

    initializedRef.current = true;
  }, [mode, scriptReady]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !buttonRef.current || !window.google?.accounts?.id || buttonWidth <= 0) {
      return;
    }

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: buttonWidth,
      text: mode === "signup" ? "signup_with" : "signin_with",
      logo_alignment: "left",
    });
  }, [buttonWidth, mode, scriptReady]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <Script id={GOOGLE_IDENTITY_SCRIPT_ID} src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div ref={wrapperRef} className="relative mx-auto w-full max-w-[400px]">
        <div
          id={`google-auth-${elementId}`}
          ref={buttonRef}
          className={cn(
            "min-h-10 w-full [&>div]:!w-full [&>div>div]:!w-full [&_iframe]:!w-full",
            busy && "pointer-events-none opacity-70",
          )}
        />
        {disabled ? <div className="absolute inset-0 z-10 cursor-not-allowed" aria-hidden="true" /> : null}
      </div>
      {disabled && mode === "signup" ? <p className={mutedClass}>Complete the form to continue with Google.</p> : null}
    </div>
  );
}