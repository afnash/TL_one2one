"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Layers, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, ListRow, PageHeader, RowList, Section } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, sessions, assignments, whiteboards, materials, startLiveSession } = useLMS();

  const firstName = (user.name && user.name !== "Student" ? user.name : "there").split(" ")[0];

  const studentSessions = sessions.filter(
    (s) => s.studentId === user.id || (s.studentIds && s.studentIds.includes(user.id)),
  );
  const liveSession = sessions.find((s) => s.status === "LIVE");
  const nextScheduled = studentSessions
    .filter((s) => s.status === "SCHEDULED")
    .sort(
      (a, b) =>
        new Date(`${a.date} ${a.scheduledTime}`).getTime() - new Date(`${b.date} ${b.scheduledTime}`).getTime(),
    )[0];
  const upcoming = liveSession || nextScheduled;

  const join = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  return (
    <AppShell headerTitle="Dashboard">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Your next lesson, homework and study materials."
        />

        {upcoming ? (
          <Card className="border-primary/30 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  {upcoming.status === "LIVE" && <span className="size-2 animate-pulse rounded-full bg-emerald-300" />}
                  {upcoming.status === "LIVE" ? "Your lesson is live" : "Next lesson"}
                </span>
                <h2 className="truncate text-xl font-semibold">
                  {upcoming.subject}: {upcoming.topic}
                </h2>
                <p className="text-sm text-primary-foreground/80">
                  With {upcoming.teacherName} · {upcoming.date} at {upcoming.scheduledTime} · {upcoming.durationMinutes} min
                </p>
              </div>
              <Button variant="secondary" size="lg" onClick={() => join(upcoming.id)} className="shrink-0">
                <Play data-icon="inline-start" />
                {upcoming.status === "LIVE" ? "Join now" : "Start lesson"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <EmptyNote>No lesson scheduled yet. Your teacher will schedule the next one.</EmptyNote>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Homework" description={`${assignments.length} assigned`} href="/student/assignments">
            {assignments.length > 0 ? (
              <RowList>
                {assignments.slice(0, 4).map((a) => (
                  <ListRow
                    key={a.id}
                    href="/student/assignments"
                    title={a.title}
                    meta={`${a.subject} · Due ${a.dueDate || "when ready"}`}
                  />
                ))}
              </RowList>
            ) : (
              <EmptyNote>Nothing to hand in right now.</EmptyNote>
            )}
          </Section>

          <Section title="Study materials" description="Handouts and worksheets" href="/student/materials" hrefLabel="Browse">
            {materials.length > 0 ? (
              <RowList>
                {materials.slice(0, 4).map((m) => (
                  <ListRow
                    key={m.id}
                    href="/student/materials"
                    title={m.title}
                    meta={m.subject}
                    lead={<FileText className="size-4 shrink-0 text-muted-foreground" />}
                  />
                ))}
              </RowList>
            ) : (
              <EmptyNote>No materials shared yet.</EmptyNote>
            )}
          </Section>
        </div>

        {whiteboards.length > 0 && (
          <Section title="Whiteboards" description="Pick up where you left off" href="/student/whiteboards" hrefLabel="All boards">
            <div className="grid gap-3 sm:grid-cols-2">
              {whiteboards.slice(0, 4).map((board) => (
                <Link
                  key={board.id}
                  href={`/student/whiteboards?id=${board.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-ring/60 hover:bg-secondary/40"
                >
                  <Layers className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{board.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {board.subject || "General"} · edited {board.lastEdited && !Number.isNaN(Date.parse(board.lastEdited)) ? formatDate(board.lastEdited) : "recently"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AppShell>
  );
}
