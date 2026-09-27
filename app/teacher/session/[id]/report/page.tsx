"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SessionReportForm } from "@/components/session/SessionReportForm";
import { useLMS } from "@/lib/store";

export default function SessionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { sessions, sessionReports, loading, connectionError } = useLMS();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!loading && !connectionError) setReady(true);
  }, [loading, connectionError]);
  const session = sessions.find(s => s.id === id);
  return <AppShell headerTitle="End Session Report" headerSubtitle="Record the lesson, student progress, and next steps">
    <div className="mx-auto max-w-5xl">
      {ready && (session ? <SessionReportForm key={session.id} session={session} existing={sessionReports.find(r => r.sessionId === id)} />
        : <p className="p-8 text-slate-500">Session not found.</p>)}
    </div>
  </AppShell>;
}
