"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, ListRow, PageHeader, RowList, Section } from "@/components/dashboard/parts";

export default function ManagerSessionsPage() {
  const { user, sessions, directory } = useLMS();

  const myTeachers = directory.teachers.filter(
    (t) => t.managerId === user.id || (!t.managerId && user.role === "SUPERADMIN")
  );
  const myTeacherIds = myTeachers.map((t) => t.id);

  const myStudents = directory.students.filter(
    (s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId)
  );
  const myStudentIds = myStudents.map((s) => s.id);

  const teamSessions = sessions.filter(
    (s) => myTeacherIds.includes(s.teacherId) || myStudentIds.includes(s.studentId)
  );

  return (
    <AppShell headerTitle="Lessons">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Lessons" description="Durations and live status across your teachers." />
        <Section title={`${teamSessions.length} ${teamSessions.length === 1 ? "lesson" : "lessons"}`}>
          {teamSessions.length > 0 ? (
            <RowList>
              {teamSessions.map((sess) => (
                <ListRow
                  key={sess.id}
                  title={sess.topic || "Lesson"}
                  meta={`${sess.subject} · ${sess.teacherName} with ${sess.studentName} · ${sess.date} at ${sess.scheduledTime || sess.time || "TBC"} · ${
                    sess.actualDurationSeconds ? `${Math.round(sess.actualDurationSeconds / 60)} min taught` : `${sess.durationMinutes || 60} min scheduled`
                  }`}
                  action={<span className="text-xs text-muted-foreground">{sess.status === "LIVE" ? "Live now" : sess.status.charAt(0) + sess.status.slice(1).toLowerCase()}</span>}
                />
              ))}
            </RowList>
          ) : (
            <EmptyNote>No lessons scheduled for your teachers yet.</EmptyNote>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
