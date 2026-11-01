"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentAssignmentsPage() {
  const { assignments, submissions } = useLMS();

  const rows = assignments.map((asg) => {
    const submission = submissions.find((s) => s.assignmentId === asg.id);
    const state = submission?.status === "REVIEWED" ? "reviewed" : submission?.status === "SUBMITTED" ? "submitted" : "todo";
    return { asg, submission, state } as const;
  });

  const render = (filter: (state: string) => boolean, empty: string) => {
    const list = rows.filter((r) => filter(r.state));
    if (!list.length) return <EmptyNote>{empty}</EmptyNote>;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(({ asg, submission, state }) => (
          <Card key={asg.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {asg.kind === "HOMEWORK" ? "Homework: " : ""}
                {asg.title}
              </CardTitle>
              <CardDescription>
                {asg.subject} · Due {asg.dueDate} · {asg.questions.length} {asg.questions.length === 1 ? "question" : "questions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {asg.description && <p className="line-clamp-2 text-sm text-muted-foreground">{asg.description}</p>}
              <p className="text-sm font-medium">
                {state === "reviewed" && submission
                  ? `Graded: ${submission.score} of ${submission.maxScore}`
                  : state === "submitted"
                    ? "Submitted, waiting for review"
                    : "Not submitted yet"}
              </p>
              {state === "reviewed" && submission?.teacherFeedback && (
                <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">{submission.teacherFeedback}</p>
              )}
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-xs text-muted-foreground">{asg.teacherName}</span>
              <Button size="sm" variant={state === "todo" ? "default" : "outline"} asChild>
                <Link href={`/student/assignments/${asg.id}`}>
                  {state === "reviewed" ? "View graded work" : state === "submitted" ? "View submission" : "Start"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppShell headerTitle="Assignments">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="Assignments" description="Solve work on the whiteboard and read your teacher's feedback." />
        <Tabs defaultValue="all" className="gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To do</TabsTrigger>
            <TabsTrigger value="reviewed">Graded</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{render(() => true, "No assignments yet.")}</TabsContent>
          <TabsContent value="todo">{render((s) => s === "todo", "You are all caught up.")}</TabsContent>
          <TabsContent value="reviewed">{render((s) => s === "reviewed", "Nothing graded yet.")}</TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
