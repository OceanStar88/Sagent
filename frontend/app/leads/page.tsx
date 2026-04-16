"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCallDetail, getCalls, getContacts } from "@/lib/api";
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
  sectionTitleClass,
  speakerDotToneClass,
  speakerPillClass,
  splitGridClass,
  statusDotClass,
  statusPillClass,
  transcriptStreamClass,
} from "@/lib/ui";
import type { CallDetail, CallSummary, Contact } from "@/types";

const TABS = ["Info", "Calls"] as const;
type LeadTab = (typeof TABS)[number];

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadCallId, setSelectedLeadCallId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);
  const [activeTab, setActiveTab] = useState<LeadTab>("Info");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    Promise.all([getContacts(token), getCalls(token)])
      .then(([contactItems, callItems]) => {
        setContacts(contactItems);
        setCalls(callItems);
        if (contactItems[0]) {
          setSelectedLeadId(contactItems[0].id);
        }
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const selectedLead = useMemo(() => contacts.find((contact) => contact.id === selectedLeadId) ?? null, [contacts, selectedLeadId]);
  const leadCalls = useMemo(() => {
    if (!selectedLead) {
      return [];
    }
    return calls.filter((call) => call.to_number === selectedLead.phone_number || call.from_number === selectedLead.phone_number);
  }, [calls, selectedLead]);

  async function selectLeadCall(callId: string) {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    try {
      setSelectedLeadCallId(callId);
      setSelectedCall(await getCallDetail(token, callId));
      setActiveTab("Calls");
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
            <p className={eyebrowClass}>Contact management</p>
            <h1 className={pageTitleClass}>Leads</h1>
            <p className={ledeClass}>Review lead profiles, inspect interaction history, and pivot directly into transcript analysis.</p>
          </div>

          <div className={splitGridClass}>
            <div className="flex flex-col gap-3">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className={historyItemClass(selectedLeadId === contact.id)}
                  onClick={() => {
                    setSelectedLeadId(contact.id);
                    setSelectedLeadCallId(null);
                    setSelectedCall(null);
                    setActiveTab("Info");
                  }}
                >
                  <div className={messageHeaderClass}>
                    <strong>{contact.name}</strong>
                    <span className={listMetaClass}>{new Date(contact.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={listMetaClass}>{contact.phone_number}</div>
                </button>
              ))}
              {!contacts.length ? <div className={emptyStateClass}>No leads available yet.</div> : null}
            </div>

            <div className={nestedPanelClass}>
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => {
                  const active = activeTab === tab;
                  return (
                    <button key={tab} type="button" className={historyItemClass(active)} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </button>
                  );
                })}
              </div>

              {activeTab === "Info" ? (
                selectedLead ? (
                  <article className="grid gap-3">
                    <h2 className={sectionTitleClass}>{selectedLead.name}</h2>
                    <div className={listMetaClass}>Phone: {selectedLead.phone_number}</div>
                    <div className={listMetaClass}>Created: {new Date(selectedLead.created_at).toLocaleString()}</div>
                    <div className={listMetaClass}>Total calls: {leadCalls.length}</div>
                  </article>
                ) : (
                  <div className={emptyStateClass}>Select a lead to review profile information.</div>
                )
              ) : (
                <div className="grid gap-3">
                  {leadCalls.map((call) => {
                    const canonicalStatus = toCanonicalCallStatus(call.status);
                    return (
                      <button
                        key={call.id}
                        type="button"
                        className={historyItemClass(selectedLeadCallId === call.id)}
                        onClick={() => selectLeadCall(call.id)}
                      >
                        <div className={messageHeaderClass}>
                          <strong>{new Date(call.started_at).toLocaleString()}</strong>
                          <span className={statusPillClass}>
                            <span className={statusDotClass(canonicalStatus.toLowerCase())} />
                            {canonicalStatus}
                          </span>
                        </div>
                        <div className={listMetaClass}>Duration: {call.ended_at ? `${Math.max(0, Math.round((new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000))}s` : "Live"}</div>
                      </button>
                    );
                  })}

                  {!leadCalls.length ? <div className={emptyStateClass}>No calls for this lead yet.</div> : null}

                  {selectedCall ? (
                    <div className={nestedPanelClass}>
                      <div className={messageHeaderClass}>
                        <strong>Transcript</strong>
                        <span className={statusPillClass}>{toCanonicalCallStatus(selectedCall.status)}</span>
                      </div>
                      <div className={transcriptStreamClass}>
                        {selectedCall.transcripts.map((item, index) => (
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
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
