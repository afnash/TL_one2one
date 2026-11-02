"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function AdminTeachersPage() {
  return (
    <AppShell headerTitle="Teachers">
      <div className="mx-auto max-w-6xl pb-12">
        <RosterManager kind="TEACHER" title="Teachers" description="Create teacher accounts and assign them to managers." />
      </div>
    </AppShell>
  );
}
