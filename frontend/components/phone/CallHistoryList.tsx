import type { CallSummary } from "@/types";
import {
  emptyStateClass,
  eyebrowClass,
  historyItemClass,
  historyListClass,
  listMetaClass,
  messageHeaderClass,
  panelClass,
  sectionTitleClass,
  statusDotClass,
  statusPillClass,
} from "@/lib/ui";


type CallHistoryListProps = {
  calls: CallSummary[];
  selectedCallId: string | null;
  onSelect: (callId: string) => void;
};


export function CallHistoryList({ calls, selectedCallId, onSelect }: CallHistoryListProps) {
  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-3">
        <p className={eyebrowClass}>Call history</p>
        <h2 className={sectionTitleClass}>Recent conversations</h2>
      </div>
      <div className={historyListClass}>
        {calls.map((call) => (
          <button
            key={call.id}
            type="button"
            className={historyItemClass(selectedCallId === call.id)}
            onClick={() => onSelect(call.id)}
          >
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
    </section>
  );
}
