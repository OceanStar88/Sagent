"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CallHistoryList } from "@/components/phone/CallHistoryList";
import { CallPanel } from "@/components/phone/CallPanel";
import { TranscriptView } from "@/components/phone/TranscriptView";
import { useCall } from "@/hooks/useCall";
import { getStoredToken } from "@/lib/auth";
import { alertClass, callLayoutClass, pageStackClass } from "@/lib/ui";


export default function PhonePage() {
  const token = getStoredToken();
  const { activeCallId, callState, calls, contacts, error, messages, partialMessage, placeCall, hangUp, selectCall, selectedCallId, startedAt } =
    useCall(token);

  return (
    <AppShell>
      <div className={pageStackClass}>
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
