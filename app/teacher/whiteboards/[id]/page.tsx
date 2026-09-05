"use client";

import { use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardWorkspace } from "@/components/whiteboard/WhiteboardWorkspace";

export default function TeacherBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell headerTitle="Whiteboard Workspace" headerSubtitle="Student-centred subject board with Supabase saving">
      <WhiteboardWorkspace mode="ASSIGNMENT_REVIEW" initialBoardId={id} className="h-[calc(100vh-140px)]" />
    </AppShell>
  );
}
