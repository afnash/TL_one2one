"use client";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader, Section, Stat } from "@/components/dashboard/parts";
import { SubjectProgress } from "@/components/SubjectProgress";
import { useLMS } from "@/lib/store";

export default function Progress() {
  const { sessions, submissions, sessionReports } = useLMS();
  const graded = submissions.filter((s) => s.status === "REVIEWED");
  return (
    <AppShell headerTitle="Progress">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="My progress" description="Scores, completed lessons and your teacher's feedback." />
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Completed lessons" value={sessions.filter((s) => s.status === "COMPLETED").length} />
          <Stat label="Graded submissions" value={graded.length} />
        </div>
        <Section title="Scores by subject">
          <SubjectProgress />
        </Section>
        <Section title="Teacher feedback">
          {sessionReports.length ? (
            <div className="flex flex-col divide-y divide-border/60">
              {sessionReports.map((r) => (
                <article key={r.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-medium">{r.topicTaught} · {r.date}</h3>
                  <p className="text-sm">{r.studentPerformanceNotes}</p>
                  <p className="text-xs text-muted-foreground">Next: {r.nextSessionPlan}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyNote>No session reports yet.</EmptyNote>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
