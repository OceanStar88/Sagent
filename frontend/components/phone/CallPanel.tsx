import type { Contact } from "@/types";
import {
  buttonClass,
  contactCardClass,
  contactGridClass,
  eyebrowClass,
  ledeClass,
  listMetaClass,
  panelClass,
  sectionTitleClass,
  secondaryButtonClass,
  statusDotClass,
  statusPillClass,
} from "@/lib/ui";


type CallPanelProps = {
  contacts: Contact[];
  defaultFromNumber: string;
  callState: string;
  activeCallId: string | null;
  onStartCall: (toNumber: string, fromNumber: string) => Promise<void>;
  onEndCall: (callId: string) => Promise<void>;
};


export function CallPanel({
  contacts,
  defaultFromNumber,
  callState,
  activeCallId,
  onStartCall,
  onEndCall,
}: CallPanelProps) {
  async function handleQuickCall(phoneNumber: string) {
    await onStartCall(phoneNumber, defaultFromNumber);
  }

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-3">
        <p className={eyebrowClass}>Outbound controls</p>
        <h2 className={sectionTitleClass}>Launch a monitored call</h2>
        <p className={ledeClass}>Select a lead and the backend will simulate the STT → LLM → TTS conversation loop while streaming transcripts into the UI.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className={statusPillClass}>
          <span className={statusDotClass(callState)} />
          {callState}
        </span>
      </div>

      <div className={contactGridClass}>
        {contacts.map((contact) => (
          <article key={contact.id} className={contactCardClass}>
            <div>
              <h3 className={sectionTitleClass}>{contact.name}</h3>
              <p className={listMetaClass}>{contact.phone_number}</p>
            </div>
            <button className={buttonClass} onClick={() => handleQuickCall(contact.phone_number)} disabled={Boolean(activeCallId)}>
              Call now
            </button>
          </article>
        ))}
      </div>

      {activeCallId ? (
        <button className={secondaryButtonClass} onClick={() => onEndCall(activeCallId)}>
          End active call
        </button>
      ) : null}
    </section>
  );
}
