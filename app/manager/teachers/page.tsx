"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function ManagerTeachersPage() {
  return (
    <AppShell headerTitle="Teachers">
      <div className="mx-auto max-w-6xl pb-12">
        <RosterManager kind="TEACHER" title="Teachers" description="Teachers in your department." />
      </div>
    </AppShell>
  );
}
