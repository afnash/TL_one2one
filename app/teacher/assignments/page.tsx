"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeacherAssignmentsPage() {
  const { assignments, submissions } = useLMS();

  const withSubs = assignments.map((asg) => {
    const subs = submissions.filter((s) => s.assignmentId === asg.id);
    return { asg, subs, toMark: subs.filter((s) => s.status === "SUBMITTED").length };
  });

  const render = (list: typeof withSubs, empty: string) =>
    list.length === 0 ? (
      <EmptyNote>{empty}</EmptyNote>
    ) : (
      <div className="flex flex-col gap-4">
        {list.map(({ asg, subs, toMark }) => (
          <Card key={asg.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {asg.kind === "HOMEWORK" ? "Homework: " : ""}
                {asg.title}
              </CardTitle>
              <CardDescription>
                {asg.subject} · {asg.difficulty} · Due {asg.dueDate} at {asg.dueTime} · {asg.questions.length}{" "}
                {asg.questions.length === 1 ? "question" : "questions"} ·{" "}
                {asg.targetType === "BROADCAST" ? "All students" : `${asg.assignedStudentIds.length} student(s)`}
              </CardDescription>
              <CardAction>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/teacher/assignments/${asg.id}/edit`}>
                    <Pencil data-icon="inline-start" />
                    Edit
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {toMark > 0 && <p className="text-sm font-medium text-foreground">{toMark} waiting to be marked</p>}
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <ul className="divide-y divide-border/60 rounded-lg border">
                  {subs.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{sub.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.status === "REVIEWED" ? `Scored ${sub.score} of ${sub.maxScore}` : "Awaiting review"}
                        </p>
                      </div>
                      <Button size="sm" variant={sub.status === "REVIEWED" ? "outline" : "default"} asChild>
                        <Link href={`/teacher/assignments/${asg.id}/mark/${sub.studentId}`}>
                          {sub.status === "REVIEWED" ? "Edit marks" : "Mark"}
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <AppShell headerTitle="Assignments">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader
          title="Assignments"
          description="Create work, then mark what students hand in."
          action={
            <Button asChild>
              <Link href="/teacher/assignments/new">
                <Plus data-icon="inline-start" />
                New assignment
              </Link>
            </Button>
          }
        />
        <Tabs defaultValue="all" className="gap-4">
          <TabsList>
            <TabsTrigger value="all">All ({withSubs.length})</TabsTrigger>
            <TabsTrigger value="review">To mark ({withSubs.filter((w) => w.toMark > 0).length})</TabsTrigger>
            <TabsTrigger value="done">Marked</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{render(withSubs, "No assignments yet. Create one to get started.")}</TabsContent>
          <TabsContent value="review">{render(withSubs.filter((w) => w.toMark > 0), "Nothing waiting to be marked.")}</TabsContent>
          <TabsContent value="done">
            {render(withSubs.filter((w) => w.subs.length > 0 && w.toMark === 0), "No fully marked assignments yet.")}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
