"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { CallHistoryList } from "@/components/phone/CallHistoryList";
import { CallPanel } from "@/components/phone/CallPanel";
import { TranscriptView } from "@/components/phone/TranscriptView";
import { useCall } from "@/hooks/useCall";
import { getStoredToken } from "@/lib/auth";
import { alertClass, buttonClass, callLayoutClass, ledeClass, pageStackClass, secondaryButtonClass } from "@/lib/ui";

export default function AgentsPage() {
  const token = getStoredToken();
  const { activeCallId, callState, calls, contacts, error, messages, partialMessage, placeCall, hangUp, selectCall, selectedCallId, startedAt } =
    useCall(token);

  return (
    <AppShell>
      <div className={pageStackClass}>
        <section className="grid gap-3 rounded-none border border-slate-900/10 bg-[rgba(244,246,248,0.9)] p-5 shadow-[0_20px_54px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[rgba(54,59,68,0.9)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-6">
          <h1 className="m-0 text-[2rem] font-semibold tracking-[-0.03em] text-slate-900 dark:text-zinc-100">Agents</h1>
          <p className={ledeClass}>Run outbound calls, observe live transcript flow, and jump into agent configuration from one operational surface.</p>
          <div className="flex flex-wrap gap-3">
            <Link className={secondaryButtonClass} href="/settings">
              Open agent settings
            </Link>
            <Link className={buttonClass} href="/calls">
              View all calls
            </Link>
          </div>
        </section>
        {error ? <div className={alertClass}>{error}</div> : null}
        <div className={callLayoutClass}>
          <div className={pageStackClass}>
            <CallPanel
              contacts={contacts}
              defaultFromNumber="+6512345678"
              callState={callState}
              activeCallId={activeCallId}
              onStartCall={placeCall}
              onEndCall={hangUp}
            />
            <CallHistoryList calls={calls} selectedCallId={selectedCallId} onSelect={selectCall} />
          </div>
          <TranscriptView callState={callState} messages={messages} partialMessage={partialMessage} startedAt={startedAt} />
        </div>
      </div>
    </AppShell>
  );
}
