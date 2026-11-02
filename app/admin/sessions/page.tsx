"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AdminSessionsPage() {
  const { sessions } = useLMS();

  return (
    <AppShell headerTitle="Lessons">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Lessons" description="Every one-to-one lesson on the platform." />
        {sessions.length === 0 ? (
          <EmptyNote>No lessons have been scheduled yet.</EmptyNote>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead className="hidden sm:table-cell">Teacher</TableHead>
                  <TableHead className="hidden md:table-cell">Student</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess) => (
                  <TableRow key={sess.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{sess.topic}</p>
                      <p className="text-xs text-muted-foreground">{sess.subject}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{sess.teacherName}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{sess.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {sess.date} {sess.scheduledTime}
                      <span className="block text-xs">{sess.durationMinutes} min</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm capitalize">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            sess.status === "LIVE" ? "bg-emerald-500" : sess.status === "COMPLETED" ? "bg-primary" : "bg-muted-foreground/50",
                          )}
                        />
                        {sess.status.toLowerCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
