"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAssignmentsPage() {
  const { assignments, submissions, deleteAssignment } = useLMS();

  return (
    <AppShell headerTitle="Assignments">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader title="Assignments" description="Homework set by teachers and how much has been handed in." />
        {assignments.length === 0 ? (
          <EmptyNote>No assignments have been created yet.</EmptyNote>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="hidden sm:table-cell">Teacher</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((asg) => (
                  <TableRow key={asg.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{asg.title}</p>
                      <p className="text-xs text-muted-foreground">{asg.subject}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{asg.teacherName}</TableCell>
                    <TableCell className="text-muted-foreground">{asg.dueDate}</TableCell>
                    <TableCell className="text-right tabular-nums">{submissions.filter((s) => s.assignmentId === asg.id).length}</TableCell>
                    <TableCell className="text-right">
                      <ConfirmAction
                        title={`Remove “${asg.title}”?`}
                        description="This removes the assignment from every dashboard."
                        onConfirm={() => deleteAssignment(asg.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Remove ${asg.title}`} className="text-muted-foreground hover:text-destructive">
                            <Trash2 />
                          </Button>
                        }
                      />
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
