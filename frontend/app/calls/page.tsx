"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCallDetail, getCalls } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { toCanonicalCallStatus } from "@/lib/call-status";
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

const CATEGORIES = ["All", "Inbound", "Outbound"] as const;
type Category = (typeof CATEGORIES)[number];

export default function CallsPage() {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [selected, setSelected] = useState<CallDetail | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
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

  const filteredCalls = useMemo(() => {
    if (activeCategory === "All") {
      return calls;
    }
    return calls.filter((call) => call.direction.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory, calls]);

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
            <p className={eyebrowClass}>Call operations</p>
            <h1 className={pageTitleClass}>Calls</h1>
            <p className={ledeClass}>Track inbound and outbound activity with status-first visibility and transcript-level drilldown.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  className={historyItemClass(active)}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <div className={splitGridClass}>
            <div className="flex flex-col gap-3">
              {filteredCalls.map((call) => {
                const canonicalStatus = toCanonicalCallStatus(call.status);
                return (
                  <button key={call.id} type="button" className={historyItemClass(selectedCallId === call.id)} onClick={() => selectCall(call.id)}>
                    <div className={messageHeaderClass}>
                      <strong>{call.to_number}</strong>
                      <span className={statusPillClass}>
                        <span className={statusDotClass(canonicalStatus.toLowerCase())} />
                        {canonicalStatus}
                      </span>
                    </div>
                    <div className={listMetaClass}>{call.direction} · {new Date(call.started_at).toLocaleString()}</div>
                  </button>
                );
              })}
              {!filteredCalls.length ? <div className={emptyStateClass}>No calls in this category.</div> : null}
            </div>
            <div className={nestedPanelClass}>
              {selected ? (
                <>
                  <div className={messageHeaderClass}>
                    <strong>{selected.to_number}</strong>
                    <span className={statusPillClass}>{toCanonicalCallStatus(selected.status)}</span>
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
                <div className={emptyStateClass}>Select a call to inspect transcript and metadata.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
