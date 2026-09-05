"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardWorkspace } from "@/components/whiteboard/WhiteboardWorkspace";

export default function StudentBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell headerTitle="My Whiteboard" headerSubtitle="Keep working where you left off">
      <WhiteboardWorkspace mode="STUDENT_WORK" initialBoardId={id} className="h-[calc(100vh-140px)]" />
    </AppShell>
  );
}
