"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { ExcelSessionReports } from "@/components/session/ExcelSessionReports";
import { AlertCircle, Clock, Plus, Video, FileSpreadsheet } from "lucide-react";

export default function TeacherReportsPage() {
  const { sessions, sessionReports, user } = useLMS();

  // Filter completed sessions that don't have a report yet
  const pending = sessions.filter(
    (s) => s.status === "COMPLETED" && !sessionReports.some((r) => r.sessionId === s.id)
  );

  const reports = [...sessionReports].sort(
    (a, b) => b.date.localeCompare(a.date) || (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  return (
    <AppShell
      headerTitle="Academic & Session Reports"
      headerSubtitle="Excel-column spreadsheet and detailed audit records for your student sessions"
    >
      <div className="mx-auto max-w-7xl space-y-6 pb-16">
        {/* Pending Reports Banner */}
        {pending.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-amber-950 text-sm sm:text-base">
                Completed Sessions Awaiting Report ({pending.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {pending.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap justify-between items-center gap-3 p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {session.studentName} — <span className="text-indigo-600">{session.subject}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {session.topic} • {session.date} at {session.scheduledTime}
                    </p>
                  </div>
                  <Link
                    href={`/teacher/session/${session.id}/report`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Fill Report</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Excel Spreadsheet Column View */}
        <ExcelSessionReports
          reports={reports}
          title="Student Academic & Session Reports (Spreadsheet)"
          subtitle="Excel tabular column format with student remarks, attendance, ratings, and export capability"
          canEdit={true}
        />
      </div>
    </AppShell>
  );
}
