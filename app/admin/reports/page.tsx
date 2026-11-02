"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { SessionReportDetails } from "@/components/session/SessionReportDetails";

export default function AdminReportsPage() {
  const { sessionReports } = useLMS();
  return (
    <AppShell headerTitle="Reports">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Reports" description="Every lesson report written by teachers, newest first." />
        {sessionReports.length ? (
          [...sessionReports].sort((a, b) => b.date.localeCompare(a.date)).map((report) => <SessionReportDetails key={report.id} report={report} />)
        ) : (
          <EmptyNote>No session reports yet.</EmptyNote>
        )}
      </div>
    </AppShell>
  );
}
