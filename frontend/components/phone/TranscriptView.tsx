import { useEffect, useMemo, useRef, useState } from "react";

import type { TranscriptItem } from "@/types";
import {
  emptyStateClass,
  eyebrowClass,
  listMetaClass,
  messageCardClass,
  messageHeaderClass,
  panelClass,
  pillRowClass,
  sectionTitleClass,
  speakerDotToneClass,
  speakerPillClass,
  statusDotClass,
  statusPillClass,
  transcriptStreamClass,
} from "@/lib/ui";


type TranscriptViewProps = {
  callState: string;
  messages: TranscriptItem[];
  partialMessage: string;
  startedAt: string | null;
};


function formatElapsed(startedAt: string | null, now: number): string {
  if (!startedAt) {
    return "00:00";
  }
  const seconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}


export function TranscriptView({ callState, messages, partialMessage, startedAt }: TranscriptViewProps) {
  const streamRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, partialMessage]);

  const timer = useMemo(() => formatElapsed(startedAt, now), [startedAt, now]);

  return (
    <section className={panelClass}>
      <div className={messageHeaderClass}>
        <div>
          <p className={eyebrowClass}>Live observer</p>
          <h2 className={sectionTitleClass}>Transcript stream</h2>
        </div>
        <div className={pillRowClass}>
          <span className={statusPillClass}>
            <span className={statusDotClass(callState)} />
            {callState}
          </span>
          <span className={statusPillClass}>Timer {timer}</span>
        </div>
      </div>

      <div ref={streamRef} className={transcriptStreamClass}>
        {messages.map((message, index) => (
          <article key={`${message.timestamp}-${index}`} className={messageCardClass(message.speaker)}>
            <div className={messageHeaderClass}>
              <span className={speakerPillClass}>
                <span className={speakerDotToneClass(message.speaker)} />
                {message.speaker}
              </span>
              <span className={listMetaClass}>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div>{message.text}</div>
          </article>
        ))}
        {partialMessage ? (
          <article className={messageCardClass("user", true)}>
            <div className={messageHeaderClass}>
              <span className={speakerPillClass}>
                <span className={speakerDotToneClass("user")} />
                partial user transcript
              </span>
            </div>
            <div>{partialMessage}</div>
          </article>
        ) : null}
        {!messages.length && !partialMessage ? <div className={emptyStateClass}>No transcript yet. Start a call to open the observer stream.</div> : null}
      </div>
    </section>
  );
}
