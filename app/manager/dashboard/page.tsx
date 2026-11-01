"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, initials, ListRow, PageHeader, RowList, Section, Stat } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLMS } from "@/lib/store";

export default function ManagerDashboardPage() {
  const { user, directory, sessions } = useLMS();

  // Teachers and students in this manager's scope
  const myTeachers = directory.teachers.filter(
    (t) => t.managerId === user.id || (!t.managerId && user.role === "SUPERADMIN"),
  );
  const myTeacherIds = myTeachers.map((t) => t.id);
  const myStudents = directory.students.filter((s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId));
  const myStudentIds = myStudents.map((s) => s.id);

  const mySessions = sessions.filter((s) => myTeacherIds.includes(s.teacherId) || myStudentIds.includes(s.studentId));
  const liveSessions = mySessions.filter((s) => s.status === "LIVE");
  const activeSessions = mySessions.filter((s) => s.status === "LIVE" || s.status === "SCHEDULED");
  const completedSessions = mySessions.filter((s) => s.status === "COMPLETED");
  const unassigned = myStudents.filter((s) => !s.teacherId);
  const hours = Math.floor(completedSessions.reduce((acc, s) => acc + (s.actualDurationSeconds || 0), 0) / 3600);

  return (
    <AppShell headerTitle="Dashboard">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader
          title={`Welcome back, ${(user.name || "").split(" ")[0] || "there"}`}
          description="Your teachers, students and lessons."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/manager/students">
                  <Plus data-icon="inline-start" />
                  Student
                </Link>
              </Button>
              <Button asChild>
                <Link href="/manager/teachers">
                  <Plus data-icon="inline-start" />
                  Teacher
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Teachers" value={myTeachers.length} href="/manager/teachers" />
          <Stat label="Students" value={myStudents.length} href="/manager/students" />
          <Stat
            label="Lessons"
            value={mySessions.length}
            hint={liveSessions.length > 0 ? `${liveSessions.length} live now` : undefined}
            href="/manager/sessions"
          />
          <Stat label="Teaching hours" value={hours} hint={`${completedSessions.length} completed`} />
        </div>

        {unassigned.length > 0 && (
          <Section title="Needs attention">
            <RowList>
              <ListRow
                href="/manager/students"
                title={`${unassigned.length} ${unassigned.length === 1 ? "student has" : "students have"} no teacher`}
                meta="Assign a teacher so lessons can be scheduled."
              />
            </RowList>
          </Section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Your teachers" href="/manager/teachers">
            {myTeachers.length > 0 ? (
              <RowList>
                {myTeachers.slice(0, 6).map((teacher) => {
                  const count = myStudents.filter((s) => s.teacherId === teacher.id).length;
                  return (
                    <ListRow
                      key={teacher.id}
                      lead={
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                            {initials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                      }
                      title={teacher.name}
                      meta={teacher.subjects?.join(", ") || teacher.email}
                      action={
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {count} {count === 1 ? "student" : "students"}
                        </span>
                      }
                    />
                  );
                })}
              </RowList>
            ) : (
              <EmptyNote>No teachers in your group yet. Add one to get started.</EmptyNote>
            )}
          </Section>

          <Section title="Live and upcoming" href="/manager/sessions" hrefLabel="All lessons">
            {activeSessions.length > 0 ? (
              <RowList>
                {activeSessions.slice(0, 6).map((session) => (
                  <ListRow
                    key={session.id}
                    title={`${session.subject}: ${session.topic}`}
                    meta={`${session.teacherName} with ${session.studentName} · ${session.date || "Today"} ${session.scheduledTime || ""}`}
                    action={
                      session.status === "LIVE" ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                          Live
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </RowList>
            ) : (
              <EmptyNote>No live or upcoming lessons in your department.</EmptyNote>
            )}
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
