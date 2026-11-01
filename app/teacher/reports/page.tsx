"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { ExcelSessionReports } from "@/components/session/ExcelSessionReports";
import { ListRow, PageHeader, RowList, Section } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";

export default function TeacherReportsPage() {
  const { sessions, sessionReports } = useLMS();

  // Completed sessions that don't have a report yet
  const pending = sessions.filter((s) => s.status === "COMPLETED" && !sessionReports.some((r) => r.sessionId === s.id));

  const reports = [...sessionReports].sort(
    (a, b) => b.date.localeCompare(a.date) || (b.createdAt || "").localeCompare(a.createdAt || ""),
  );

  return (
    <AppShell headerTitle="Reports">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Reports" description="Write up each lesson and keep a record of attendance and progress." />

        {pending.length > 0 && (
          <Section title="Waiting for a report" description={`${pending.length} completed ${pending.length === 1 ? "lesson" : "lessons"}`}>
            <RowList>
              {pending.map((session) => (
                <ListRow
                  key={session.id}
                  title={`${session.studentName} · ${session.subject}`}
                  meta={`${session.topic} · ${session.date} at ${session.scheduledTime}`}
                  action={
                    <Button size="sm" asChild>
                      <Link href={`/teacher/session/${session.id}/report`}>
                        <FileText data-icon="inline-start" />
                        Write report
                      </Link>
                    </Button>
                  }
                />
              ))}
            </RowList>
          </Section>
        )}

        <ExcelSessionReports
          reports={reports}
          title="Session reports"
          subtitle="Attendance, ratings and remarks for every lesson. Export to a spreadsheet."
          canEdit={true}
        />
      </div>
    </AppShell>
  );
}
