"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/parts";
import { ScheduleSession } from "@/components/session/ScheduleSession";

export default function PreSession() {
  return (
    <AppShell headerTitle="Plan a lesson">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 pb-16">
        <PageHeader title="Plan a lesson" description="Use your meeting link for audio and video, then open the lesson workspace to teach on the shared board." />
        <ScheduleSession />
        <Link href="/teacher/sessions" className="text-sm text-primary hover:underline">
          View scheduled lessons
        </Link>
      </div>
    </AppShell>
  );
}
