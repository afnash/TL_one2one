"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function ManagerStudentsPage() {
  return (
    <AppShell headerTitle="Department Students" headerSubtitle="Add, manage, and assign students to your department teachers">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Roster & Allocation</h1>
          <p className="text-xs text-slate-500">
            Add students and assign them to faculty teachers for 1:1 mentorship and live classes.
          </p>
        </div>
        <RosterManager kind="STUDENT" />
      </div>
    </AppShell>
  );
}
