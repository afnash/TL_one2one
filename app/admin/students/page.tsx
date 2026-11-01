"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function AdminStudentsPage() {
  return (
    <AppShell headerTitle="Students">
      <div className="mx-auto max-w-6xl pb-12">
        <RosterManager kind="STUDENT" title="Students" description="Create student accounts and assign each to a teacher." />
      </div>
    </AppShell>
  );
}
