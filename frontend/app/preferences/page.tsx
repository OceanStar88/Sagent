"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AccountPageContent } from "@/components/AccountPageContent";

export default function PreferencesPage() {
  return (
    <AppShell>
      <AccountPageContent initialMainId="preferences" />
    </AppShell>
  );
}