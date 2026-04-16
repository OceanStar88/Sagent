"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCalls, getContacts, getSettings } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import {
  buttonClass,
  buttonRowClass,
  eyebrowClass,
  heroPanelClass,
  ledeClass,
  mutedClass,
  pageStackClass,
  pageTitleClass,
  secondaryButtonClass,
  statCardClass,
  statsGridClass,
  statValueClass,
} from "@/lib/ui";


export default function HomePage() {
  const [summary, setSummary] = useState({ calls: 0, contacts: 0, configured: false });

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    Promise.all([getCalls(token), getContacts(token), getSettings(token)])
      .then(([calls, contacts, settings]) => {
        setSummary({
          calls: calls.length,
          contacts: contacts.length,
          configured: Boolean(settings.agent.system_prompt),
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <section className={heroPanelClass}>
        <div className={pageStackClass}>
          <div className="flex flex-col gap-3">
            <p className={eyebrowClass}>Operations center</p>
            <h1 className={pageTitleClass}>Talk. Listen. Think. Respond.</h1>
            <p className={ledeClass}>This MVP covers auth, outbound calling, account settings, call history, and a WebSocket observer channel for live transcript updates.</p>
          </div>
        </div>
        <div className={statsGridClass}>
          <article className={statCardClass}>
            <div className={mutedClass}>Calls tracked</div>
            <strong className={statValueClass}>{summary.calls}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Contacts loaded</div>
            <strong className={statValueClass}>{summary.contacts}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Agent config</div>
            <strong className={statValueClass}>{summary.configured ? "Ready" : "Missing"}</strong>
          </article>
        </div>
        <div className={buttonRowClass}>
          <Link className={buttonClass} href="/phone">
            Open phone desk
          </Link>
          <Link className={secondaryButtonClass} href="/settings">
            Adjust agent prompt
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
