"use client";

import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { SessionReportDetails } from "@/components/session/SessionReportDetails";

export default function TeacherReportsPage() {
  const { sessions, sessionReports } = useLMS();
  const pending = sessions.filter(s => s.status === "COMPLETED" && !sessionReports.some(r => r.sessionId === s.id));
  const reports = [...sessionReports].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  return <AppShell headerTitle="Academic & Session Reports" headerSubtitle="Review lessons, student progress, and next steps; reopen any report to update it">
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {pending.length > 0 && <section className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <h2 className="font-bold text-indigo-950">Sessions awaiting a report</h2>
        {pending.map(session => <div key={session.id} className="flex flex-wrap justify-between items-center gap-3 text-sm">
          <p>{session.studentName} · {session.subject} · {session.date}</p>
          <Link href={`/teacher/session/${session.id}/report`} className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white">End Session report</Link>
        </div>)}
      </section>}
      {reports.map(report => <SessionReportDetails key={report.id} report={report} editable />)}
      {!reports.length && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">No session reports yet. End a class or choose a completed session above to create one.</p>}
    </div>
  </AppShell>;
}
