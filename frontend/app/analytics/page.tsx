"use client";

import { AppShell } from "@/components/layout/AppShell";
import {
  ledeClass,
  pageStackClass,
  pageTitleClass,
  panelClass,
  sectionTitleClass,
  splitGridClass,
  statCardClass,
  statsGridClass,
  statValueClass,
} from "@/lib/ui";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className={pageStackClass}>
        <section className={panelClass}>
          <h1 className={pageTitleClass}>Analytics</h1>
          <p className={ledeClass}>Track call performance, conversion trends, and agent productivity.</p>
          <div className={statsGridClass}>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Avg Call Duration</h2>
              <p className={statValueClass}>06:21</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Conversion Rate</h2>
              <p className={statValueClass}>18.4%</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Resolved Today</h2>
              <p className={statValueClass}>96</p>
            </article>
          </div>
          <div className={splitGridClass}>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Call Outcome Breakdown</h2>
              <p className={ledeClass}>Chart placeholder for success, failed, missed, and dropped call outcomes.</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Agent Performance Trend</h2>
              <p className={ledeClass}>Chart placeholder for weekly productivity and conversation quality trend.</p>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}