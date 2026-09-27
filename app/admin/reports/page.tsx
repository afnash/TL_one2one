"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { SessionReportDetails } from "@/components/session/SessionReportDetails";

export default function AdminReportsPage() {
  const { sessionReports } = useLMS();
  return <AppShell headerTitle="Platform Audit & Reports" headerSubtitle="Educator logs, student progress, and complete session records">
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {[...sessionReports].sort((a, b) => b.date.localeCompare(a.date)).map(report => <SessionReportDetails key={report.id} report={report} />)}
      {!sessionReports.length && <p className="p-8 text-slate-500">No session reports yet.</p>}
    </div>
  </AppShell>;
}
