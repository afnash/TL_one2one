"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
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
    <AppShell headerTitle="Reports">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Reports" description="Lesson reports written by your teachers, newest first." />
        {teamReports.length ? (
          [...teamReports].sort((a, b) => b.date.localeCompare(a.date)).map((report) => <SessionReportDetails key={report.id} report={report} />)
        ) : (
          <EmptyNote>No session reports from your teachers yet.</EmptyNote>
        )}
      </div>
    </AppShell>
  );
}
