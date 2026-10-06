"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function ManagerTeachersPage() {
  return (
    <AppShell headerTitle="Department Faculty" headerSubtitle="Add and manage teachers assigned to your department">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Team</h1>
          <p className="text-xs text-slate-500">
            View, add, and manage teacher profiles and assign them to curriculum disciplines.
          </p>
        </div>
        <RosterManager kind="TEACHER" />
      </div>
    </AppShell>
  );
}
