"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCalls, getContacts, getSettings } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { isLiveStatus, toCanonicalCallStatus } from "@/lib/call-status";
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
  const [summary, setSummary] = useState({ calls: 0, liveCalls: 0, failedCalls: 0, contacts: 0, configured: false });

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    Promise.all([getCalls(token), getContacts(token), getSettings(token)])
      .then(([calls, contacts, settings]) => {
        setSummary({
          calls: calls.length,
          liveCalls: calls.filter((call) => isLiveStatus(call.status)).length,
          failedCalls: calls.filter((call) => toCanonicalCallStatus(call.status) === "Failed").length,
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
            <h1 className={pageTitleClass}>Voice operations at a glance</h1>
            <p className={ledeClass}>Monitor active calls, jump into agent workflows, and triage outcomes quickly across leads, calls, and analytics.</p>
          </div>
        </div>
        <div className={statsGridClass}>
          <article className={statCardClass}>
            <div className={mutedClass}>Calls tracked</div>
            <strong className={statValueClass}>{summary.calls}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Live calls</div>
            <strong className={statValueClass}>{summary.liveCalls}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Failed calls</div>
            <strong className={statValueClass}>{summary.failedCalls}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Leads</div>
            <strong className={statValueClass}>{summary.contacts}</strong>
          </article>
          <article className={statCardClass}>
            <div className={mutedClass}>Agent setup</div>
            <strong className={statValueClass}>{summary.configured ? "Ready" : "Missing"}</strong>
          </article>
        </div>
        <div className={buttonRowClass}>
          <Link className={buttonClass} href="/agents">
            Open agents
          </Link>
          <Link className={secondaryButtonClass} href="/calls">
            Review calls
          </Link>
          <Link className={secondaryButtonClass} href="/analytics">
            Open analytics
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
