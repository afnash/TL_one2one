"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { SessionReportDetails } from "@/components/session/SessionReportDetails";

export default function ManagerReportsPage() {
  const { user, sessionReports, directory } = useLMS();

  const myTeachers = directory.teachers.filter(
    (t) => t.managerId === user.id || (!t.managerId && user.role === "SUPERADMIN")
  );
  const myTeacherIds = myTeachers.map((t) => t.id);

  const myStudents = directory.students.filter(
    (s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId)
  );
  const myStudentIds = myStudents.map((s) => s.id);

  const teamReports = sessionReports.filter(
    (r) => myTeacherIds.includes(r.teacherId) || myStudentIds.includes(r.studentId)
  );

  return (
    <AppShell
      headerTitle="Department Reports"
      headerSubtitle="Session logs, academic evaluations, and student progress reports"
    >
      <div className="mx-auto max-w-7xl space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Session Reports</h1>
            <p className="text-xs text-slate-500">
              Review completed teaching logs and student evaluations from your department.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
            {teamReports.length} reports
          </span>
        </div>

        {[...teamReports]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((report) => (
            <SessionReportDetails key={report.id} report={report} />
          ))}

        {!teamReports.length && (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No session reports filed by your department faculty yet.
          </div>
        )}
      </div>
    </AppShell>
  );
}
