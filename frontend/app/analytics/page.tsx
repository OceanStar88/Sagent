"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCalls } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { isLiveStatus, toCanonicalCallStatus } from "@/lib/call-status";
import { alertClass, eyebrowClass, ledeClass, nestedPanelClass, pageStackClass, pageTitleClass, panelClass, statCardClass, statsGridClass, statValueClass } from "@/lib/ui";
import type { CallSummary } from "@/types";

function callDurationSeconds(call: CallSummary): number {
  if (!call.ended_at) {
    return 0;
  }
  const duration = Math.round((new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000);
  return Number.isFinite(duration) ? Math.max(0, duration) : 0;
}

export default function AnalyticsPage() {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    getCalls(token)
      .then(setCalls)
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const metrics = useMemo(() => {
    const totalCalls = calls.length;
    const liveCalls = calls.filter((call) => isLiveStatus(call.status)).length;
    const endedCalls = calls.filter((call) => toCanonicalCallStatus(call.status) === "Ended").length;
    const failedCalls = calls.filter((call) => toCanonicalCallStatus(call.status) === "Failed").length;
    const missedCalls = calls.filter((call) => toCanonicalCallStatus(call.status) === "Missed").length;

    const durations = calls.map(callDurationSeconds).filter((value) => value > 0);
    const averageDuration = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0;
    const successRate = totalCalls ? Math.round((endedCalls / totalCalls) * 100) : 0;

    return {
      totalCalls,
      liveCalls,
      endedCalls,
      failedCalls,
      missedCalls,
      averageDuration,
      successRate,
    };
  }, [calls]);

  const topFailureReasons = useMemo(() => {
    const grouped = new Map<string, number>();
    calls.forEach((call) => {
      if (toCanonicalCallStatus(call.status) !== "Failed") {
        return;
      }
      const key = call.status.replace(/_/g, " ");
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [calls]);

  return (
    <AppShell>
      <div className={pageStackClass}>
        {error ? <div className={alertClass}>{error}</div> : null}
        <section className={panelClass}>
          <div className="flex flex-col gap-3">
            <p className={eyebrowClass}>Performance view</p>
            <h1 className={pageTitleClass}>Analytics</h1>
            <p className={ledeClass}>Monitor volume, stability, and outcomes with status-segmented metrics tied to real call history data.</p>
          </div>

          <div className={statsGridClass}>
            <article className={statCardClass}><div>Total calls</div><strong className={statValueClass}>{metrics.totalCalls}</strong></article>
            <article className={statCardClass}><div>Live calls</div><strong className={statValueClass}>{metrics.liveCalls}</strong></article>
            <article className={statCardClass}><div>Ended calls</div><strong className={statValueClass}>{metrics.endedCalls}</strong></article>
            <article className={statCardClass}><div>Failed calls</div><strong className={statValueClass}>{metrics.failedCalls}</strong></article>
            <article className={statCardClass}><div>Missed calls</div><strong className={statValueClass}>{metrics.missedCalls}</strong></article>
            <article className={statCardClass}><div>Avg duration</div><strong className={statValueClass}>{metrics.averageDuration}s</strong></article>
            <article className={statCardClass}><div>Success rate</div><strong className={statValueClass}>{metrics.successRate}%</strong></article>
          </div>

          <article className={nestedPanelClass}>
            <h2 className="m-0 text-[1.15rem] font-semibold leading-tight text-slate-900 dark:text-zinc-100">Failure trend snapshot</h2>
            {!topFailureReasons.length ? (
              <p className={ledeClass}>No failed calls yet. Failure trend will appear when error states are recorded.</p>
            ) : (
              <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                {topFailureReasons.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between border border-slate-900/10 bg-slate-200/70 px-3 py-2 dark:border-white/10 dark:bg-slate-700/55">
                    <span className="capitalize">{reason}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </AppShell>
  );
}
