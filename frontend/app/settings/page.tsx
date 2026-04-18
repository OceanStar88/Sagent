"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ledeClass, pageStackClass, pageTitleClass, panelClass, sectionTitleClass, settingsGridClass, statCardClass } from "@/lib/ui";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className={pageStackClass}>
        <section className={panelClass}>
          <h1 className={pageTitleClass}>Settings</h1>
          <p className={ledeClass}>Manage system rules, notifications, and integration controls.</p>
          <div className={settingsGridClass}>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Workspace Rules</h2>
              <p className={ledeClass}>Set default working hours, assignment strategy, and escalation policies.</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Notification Preferences</h2>
              <p className={ledeClass}>Configure alerts for missed calls, SLA breaches, and lead updates.</p>
            </article>
            <article className={statCardClass}>
              <h2 className={sectionTitleClass}>Integration Access</h2>
              <p className={ledeClass}>Review connected tools and rotate API credentials when needed.</p>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}