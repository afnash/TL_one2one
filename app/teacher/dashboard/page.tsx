"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, FilePlus2, Play, Upload } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, initials, ListRow, PageHeader, RowList, Section, Stat } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, sessions, students, assignments, submissions, materials, startLiveSession } = useLMS();

  const when = (x: { date: string; scheduledTime?: string }) => `${x.date} ${x.scheduledTime || ""}`;
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED").sort((a, b) => when(a).localeCompare(when(b)));
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").sort((a, b) => when(b).localeCompare(when(a)));
  const latestSubmission = [...submissions].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))[0];
  const toReview = submissions.filter((s) => s.status === "SUBMITTED");
  const firstName = (user.name || "").split(" ")[0] || "there";

  const completedFor = (studentId: string) =>
    sessions.filter((x) => x.status === "COMPLETED" && (x.studentId === studentId || x.studentIds?.includes(studentId))).length;

  const nextLesson = (studentId: string) => {
    const next = upcomingSessions
      .filter((x) => x.studentId === studentId || x.studentIds?.includes(studentId))
      .sort((x, y) => `${x.date} ${x.scheduledTime}`.localeCompare(`${y.date} ${y.scheduledTime}`))[0];
    return next ? `${next.date} ${next.scheduledTime}` : "not scheduled";
  };

  const start = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/teacher/session/${sessionId}`);
  };

  return (
    <AppShell headerTitle="Dashboard">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader
          title={`Good to see you, ${firstName}`}
          description="Today's lessons, work to review and your students."
          action={
            <Button asChild>
              <Link href="/teacher/sessions">
                <CalendarPlus data-icon="inline-start" />
                Schedule a lesson
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Students" value={students.length} href="/teacher/students" />
          <Stat label="To review" value={toReview.length} hint="Submitted work" href="/teacher/assignments" />
          <Stat label="Upcoming lessons" value={upcomingSessions.length} href="/teacher/sessions" />
          <Stat label="Lessons taught" value={completedSessions.length} href="/teacher/reports" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section
            title="Upcoming lessons"
            href="/teacher/sessions"
            className="lg:col-span-2"
          >
            {upcomingSessions.length > 0 ? (
              <RowList>
                {upcomingSessions.slice(0, 5).map((sess) => (
                  <ListRow
                    key={sess.id}
                    lead={
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                          {initials(sess.studentName)}
                        </AvatarFallback>
                      </Avatar>
                    }
                    title={`${sess.studentName} · ${sess.subject}`}
                    meta={`${sess.topic} · ${sess.date} at ${sess.scheduledTime} · ${sess.durationMinutes} min`}
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => start(sess.id)}
                      >
                        <Play data-icon="inline-start" />
                        Start
                      </Button>
                    }
                  />
                ))}
              </RowList>
            ) : (
              <EmptyNote>No lessons scheduled. Schedule one to see it here.</EmptyNote>
            )}
          </Section>

          <Section title="Quick actions">
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/teacher/assignments/new">
                  <FilePlus2 data-icon="inline-start" />
                  New assignment
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/teacher/materials">
                  <Upload data-icon="inline-start" />
                  Upload material
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {assignments.length} assignments · {materials.length} materials shared
            </p>
          </Section>
        </div>

        <Section title="Your students" href="/teacher/students">
          {students.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((st) => (
                <Link
                  key={st.id}
                  href={`/teacher/students/${st.id}`}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:border-ring/60 hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                        {initials(st.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{st.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[st.grade, st.subjects.join(", ")].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedFor(st.id)} {completedFor(st.id) === 1 ? "lesson" : "lessons"} completed
                  </p>
                  <p className="text-xs text-muted-foreground">Next lesson: {nextLesson(st.id)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyNote>No students assigned to you yet. An administrator can assign them.</EmptyNote>
          )}
        </Section>

        {(latestSubmission || completedSessions[0]) && (
          <Section title="Recent activity">
            <RowList>
              {latestSubmission && (
                <ListRow
                  href="/teacher/assignments"
                  title={`${latestSubmission.studentName} submitted ${latestSubmission.assignmentTitle}`}
                  meta={`${latestSubmission.subject} · ${new Date(latestSubmission.submittedAt).toLocaleString()}`}
                />
              )}
              {completedSessions[0] && (
                <ListRow
                  href="/teacher/reports"
                  title={`Lesson with ${completedSessions[0].studentName} completed`}
                  meta={`${completedSessions[0].topic} · ${completedSessions[0].date} · ${completedSessions[0].durationMinutes} min`}
                />
              )}
            </RowList>
          </Section>
        )}
      </div>
    </AppShell>
  );
}
