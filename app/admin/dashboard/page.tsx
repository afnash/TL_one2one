"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, ListRow, PageHeader, RowList, Section, Stat } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { useLMS } from "@/lib/store";

export default function AdminDashboardPage() {
  const { directory, teachers, students, managers, sessions, submissions, materials } = useLMS();

  const totalTeachers = directory.teachers?.length || teachers.length;
  const totalStudents = directory.students?.length || students.length;
  const totalManagers = directory.managers?.length || managers.length;
  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const unassignedStudents = students.filter((s) => !s.teacherId);
  const unassignedTeachers = teachers.filter((t) => !t.managerId);

  // Completed classes per day over the last 7 days.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const date = d.toISOString().split("T")[0];
    return {
      date,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: sessions.filter((s) => s.date === date && s.status === "COMPLETED").length,
    };
  });
  const maxWeeklyCount = Math.max(1, ...week.map((d) => d.count));
  const subjects = Array.from(new Set(sessions.map((s) => s.subject))).filter(Boolean);
  const teachingHours = Math.floor(completedSessions.reduce((n, s) => n + (s.actualDurationSeconds || 0), 0) / 3600);

  return (
    <AppShell headerTitle="Dashboard">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader
          title="Overview"
          description="People, lessons and delivery across the platform."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/managers">
                  <Plus data-icon="inline-start" />
                  Manager
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/students">
                  <Plus data-icon="inline-start" />
                  Student
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/teachers">
                  <Plus data-icon="inline-start" />
                  Teacher
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Managers" value={totalManagers} href="/admin/managers" />
          <Stat label="Teachers" value={totalTeachers} href="/admin/teachers" />
          <Stat label="Students" value={totalStudents} href="/admin/students" />
          <Stat
            label="Lessons"
            value={sessions.length}
            hint={liveSessions.length > 0 ? `${liveSessions.length} live now` : undefined}
            href="/admin/sessions"
          />
        </div>

        {(unassignedStudents.length > 0 || unassignedTeachers.length > 0) && (
          <Section title="Needs attention">
            <RowList>
              {unassignedStudents.length > 0 && (
                <ListRow
                  href="/admin/students"
                  title={`${unassignedStudents.length} ${unassignedStudents.length === 1 ? "student has" : "students have"} no teacher`}
                  meta="Assign a teacher so lessons can be scheduled."
                />
              )}
              {unassignedTeachers.length > 0 && (
                <ListRow
                  href="/admin/teachers"
                  title={`${unassignedTeachers.length} ${unassignedTeachers.length === 1 ? "teacher has" : "teachers have"} no manager`}
                  meta="Assign a manager for oversight."
                />
              )}
            </RowList>
          </Section>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <Section
            title="Completed lessons"
            description="Last 7 days"
            className="lg:col-span-3"
          >
            <div className="flex h-44 items-end gap-3" role="img" aria-label="Completed lessons per day, last 7 days">
              {week.map((d) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">{d.count}</span>
                  <div
                    className="w-full rounded-t-md bg-primary transition-[height] duration-200"
                    style={{ height: `${Math.max(4, (d.count / maxWeeklyCount) * 110)}px`, opacity: d.count ? 1 : 0.2 }}
                  />
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Delivery" className="lg:col-span-2">
            <dl className="flex flex-col divide-y divide-border/60 text-sm">
              {[
                ["Teaching time", `${teachingHours} hrs`],
                ["Graded submissions", `${submissions.filter((s) => s.status === "REVIEWED").length} of ${submissions.length}`],
                ["Materials", `${materials.length}`],
                ["Subjects taught", `${subjects.length}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>

        <Section title="Lessons by subject">
          {subjects.length > 0 ? (
            <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((name) => {
                const count = sessions.filter((s) => s.subject === name).length;
                return (
                  <div key={name} className="flex items-center justify-between border-b border-border/60 py-2.5 text-sm">
                    <span>{name}</span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyNote>Subjects appear here once lessons are scheduled.</EmptyNote>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
