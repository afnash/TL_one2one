"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function ManagerStudentsPage() {
  return (
    <AppShell headerTitle="Students">
      <div className="mx-auto max-w-6xl pb-12">
        <RosterManager kind="STUDENT" title="Students" description="Students in your department. Assign each to one of your teachers." />
      </div>
    </AppShell>
  );
}
