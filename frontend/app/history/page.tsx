"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCallDetail, getCalls } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import {
  alertClass,
  emptyStateClass,
  eyebrowClass,
  historyItemClass,
  ledeClass,
  listMetaClass,
  messageCardClass,
  messageHeaderClass,
  nestedPanelClass,
  pageStackClass,
  pageTitleClass,
  panelClass,
  speakerDotToneClass,
  speakerPillClass,
  splitGridClass,
  statusDotClass,
  statusPillClass,
  transcriptStreamClass,
} from "@/lib/ui";
import type { CallDetail, CallSummary } from "@/types";


export default function HistoryPage() {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [selected, setSelected] = useState<CallDetail | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    getCalls(token)
      .then((items) => {
        setCalls(items);
        if (items[0]) {
          setSelectedCallId(items[0].id);
          return getCallDetail(token, items[0].id).then(setSelected);
        }
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  async function selectCall(callId: string) {
    const token = getStoredToken();
    if (!token) {
      return;
    }
    try {
      setSelectedCallId(callId);
      setSelected(await getCallDetail(token, callId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load call detail.");
    }
  }

  return (
    <AppShell>
      <div className={pageStackClass}>
        {error ? <div className={alertClass}>{error}</div> : null}
        <section className={panelClass}>
          <div className="flex flex-col gap-3">
            <p className={eyebrowClass}>Archive</p>
            <h1 className={pageTitleClass}>Call history</h1>
          </div>
          <div className={splitGridClass}>
            <div className="flex flex-col gap-3">
              {calls.map((call) => (
                <button key={call.id} type="button" className={historyItemClass(selectedCallId === call.id)} onClick={() => selectCall(call.id)}>
                  <div className={messageHeaderClass}>
                    <strong>{call.to_number}</strong>
                    <span className={statusPillClass}>
                      <span className={statusDotClass(call.status)} />
                      {call.status}
                    </span>
                  </div>
                  <div className={listMetaClass}>{new Date(call.started_at).toLocaleString()}</div>
                </button>
              ))}
              {!calls.length ? <div className={emptyStateClass}>No calls yet.</div> : null}
            </div>
            <div className={nestedPanelClass}>
              {selected ? (
                <>
                  <div className={messageHeaderClass}>
                    <strong>{selected.to_number}</strong>
                    <span className={statusPillClass}>{selected.status}</span>
                  </div>
                  <div className={transcriptStreamClass}>
                    {selected.transcripts.map((item, index) => (
                      <article key={`${item.timestamp}-${index}`} className={messageCardClass(item.speaker)}>
                        <div className={messageHeaderClass}>
                          <span className={speakerPillClass}>
                            <span className={speakerDotToneClass(item.speaker)} />
                            {item.speaker}
                          </span>
                          <span className={listMetaClass}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div>{item.text}</div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className={emptyStateClass}>Select a call to inspect the transcript.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
