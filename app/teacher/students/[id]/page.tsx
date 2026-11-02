"use client";

import { use } from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, ListRow, PageHeader, RowList, Section } from "@/components/dashboard/parts";
import { SubjectProgress } from "@/components/SubjectProgress";
import { Button } from "@/components/ui/button";

export default function Student({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { students, sessions, submissions, sessionReports } = useLMS();
  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <AppShell headerTitle="Student">
        <EmptyNote>Student not found.</EmptyNote>
      </AppShell>
    );
  }
  const lessons = sessions.filter((s) => s.studentId === id || s.studentIds?.includes(id));
  const work = submissions.filter((s) => s.studentId === id);
  const remarks = sessionReports.filter((r) => r.studentId === id);
  return (
    <AppShell headerTitle="Student">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader
          title={student.name}
          description={[student.email, student.grade, student.subjects.join(", ")].filter(Boolean).join(" · ")}
          action={
            <Button asChild>
              <Link href="/teacher/sessions">Schedule a lesson</Link>
            </Button>
          }
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/teacher/assignments/new">Assign work</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/teacher/students">Edit profile</Link>
          </Button>
        </div>
        <Section title="Graded progress">
          <SubjectProgress studentId={id} />
        </Section>
        <Section title="Lessons">
          {lessons.length ? (
            <RowList>
              {lessons.map((s) => (
                <ListRow key={s.id} title={s.topic || "Lesson"} meta={`${s.date} · ${s.status.toLowerCase()}`} />
              ))}
            </RowList>
          ) : (
            <EmptyNote>No lessons yet.</EmptyNote>
          )}
        </Section>
        <Section title="Submitted work">
          {work.length ? (
            <RowList>
              {work.map((s) => (
                <ListRow
                  key={s.id}
                  title={s.assignmentTitle}
                  meta={`${s.status.toLowerCase()} · ${s.score ?? "–"}/${s.maxScore}`}
                  href={`/teacher/assignments/${s.assignmentId}/mark/${id}`}
                />
              ))}
            </RowList>
          ) : (
            <EmptyNote>No submissions yet.</EmptyNote>
          )}
        </Section>
        <Section title="Lesson remarks">
          {remarks.length ? (
            <RowList>
              {remarks.map((r) => (
                <ListRow key={r.id} title={r.date} meta={r.studentPerformanceNotes} />
              ))}
            </RowList>
          ) : (
            <EmptyNote>No remarks yet.</EmptyNote>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
