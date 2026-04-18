"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { ledeClass, mutedClass, sectionTitleClass } from "@/lib/ui";

export function EmailDisplayDetail() {
  const [email, setEmail] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(true);

  useEffect(() => {
    const user = getStoredUser();
    setEmail(user?.email ?? null);
    setVerified(user?.email_verified ?? true);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <h2 className={sectionTitleClass}>Email Address</h2>
      <p className={ledeClass}>
        Your account email is used for sign-in, verification, and transactional notifications.
      </p>

      <div className="flex flex-col gap-3 border border-slate-900/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-indigo-700 dark:text-indigo-400">
              Account email
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-zinc-100">
              {email ?? "—"}
            </p>
          </div>
          {email && (
            <span
              className={
                verified
                  ? "flex-shrink-0 rounded-none bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/14 dark:text-emerald-400"
                  : "flex-shrink-0 rounded-none bg-amber-600/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/14 dark:text-amber-400"
              }
            >
              {verified ? "Verified" : "Unverified"}
            </span>
          )}
        </div>
      </div>

      <p className={mutedClass + " text-sm"}>
        To change your email address, contact support. Self-service email updates are coming in a future release.
      </p>
    </div>
  );
}
