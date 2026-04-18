"use client";

import { AppShell } from "@/components/layout/AppShell";
import {
  ledeClass,
  pageStackClass,
  pageTitleClass,
  panelClass,
  sectionTitleClass,
  statCardClass,
  statsGridClass,
  statValueClass,
} from "@/lib/ui";

export default function HomePage() {
  return (
    <AppShell>
      <div className={pageStackClass}>
        <section className={panelClass}>
          <h1 className={pageTitleClass}>Home</h1>
          <p className={ledeClass}>Welcome back. Here is a compact overview of your workspace activity.</p>
          <div className={statsGridClass}>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Open Leads</h2>
              <p className={statValueClass}>42</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Active Calls</h2>
              <p className={statValueClass}>7</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Connected Agents</h2>
              <p className={statValueClass}>12</p>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}