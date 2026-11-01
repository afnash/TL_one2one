"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSubjectsPage() {
  const { subjects } = useLMS();

  return (
    <AppShell headerTitle="Subjects">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="Subjects" description="What is taught and the topics each subject covers." />
        {subjects.length === 0 ? (
          <EmptyNote>No subjects defined yet.</EmptyNote>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((sub) => (
              <Card key={sub.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="size-3 rounded-full" style={{ backgroundColor: sub.color }} aria-hidden />
                    {sub.name}
                  </CardTitle>
                  <CardDescription>
                    {sub.code} · {sub.studentCount} {sub.studentCount === 1 ? "learner" : "learners"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {sub.description && <p className="text-sm text-muted-foreground">{sub.description}</p>}
                  {sub.topics.length > 0 && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Topics: </span>
                      {sub.topics.join(", ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
