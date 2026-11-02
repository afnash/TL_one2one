"use client";

import React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentHistoryPage() {
  const { sessionReports } = useLMS();

  return (
    <AppShell headerTitle="History">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
        <PageHeader title="History" description="Reports from your past lessons." />
        {sessionReports.length === 0 && <EmptyNote>Reports appear here after each lesson.</EmptyNote>}
        <div className="flex flex-col gap-4">
          {sessionReports.map((rep) => (
            <Card key={rep.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {rep.subject}: {rep.topicTaught}
                </CardTitle>
                <CardDescription>
                  {rep.date} · {rep.startTime} to {rep.endTime} · {rep.durationMinutes} min · Rated{" "}
                  {rep.studentPerformanceRating} of 5
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {rep.studentPerformanceNotes && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{rep.studentPerformanceNotes}</p>
                )}
                <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Homework</dt>
                    <dd className="font-medium">{rep.assignmentGiven || "None"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Next lesson</dt>
                    <dd className="font-medium">{rep.nextSessionPlan || "Not planned yet"}</dd>
                  </div>
                </dl>
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <Link href="/student/whiteboards">
                    <Layers data-icon="inline-start" />
                    Open whiteboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
