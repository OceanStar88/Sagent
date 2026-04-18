"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AccountPageContent } from "@/components/AccountPageContent";

export default function SubscriptionPage() {
  return (
    <AppShell>
      <AccountPageContent initialMainId="subscription" />
    </AppShell>
  );
}