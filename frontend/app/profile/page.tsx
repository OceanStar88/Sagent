"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AccountPageContent } from "@/components/AccountPageContent";

export default function ProfilePage() {
  return (
    <AppShell>
      <AccountPageContent initialMainId="profile" />
    </AppShell>
  );
}