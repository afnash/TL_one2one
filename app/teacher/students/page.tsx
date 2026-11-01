"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";

export default function TeacherStudentsPage() {
  return (
    <AppShell headerTitle="Students">
      <div className="mx-auto max-w-6xl pb-12">
        <RosterManager kind="STUDENT" title="Students" description="Your students and their progress. Open one to see lessons and work." />
      </div>
    </AppShell>
  );
}
