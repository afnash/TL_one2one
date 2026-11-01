"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";

export default function StudentWhiteboardsPage() {
  const { user, whiteboards, updateWhiteboardElements } = useLMS();

  const [activeBoardId, setActiveBoardId] = useState<string>("");

  const currentBoard =
    whiteboards.find((w) => w.id === activeBoardId) || whiteboards[0];

  return (
    <AppShell
      headerTitle="My whiteboards"
      headerSubtitle="Your class boards, homework and practice notes"
    >
      <div className="flex h-[calc(100vh-140px)] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-2.5">
          <StudentBoardSelector
            currentWhiteboardId={activeBoardId}
            onSelectBoard={(id) => setActiveBoardId(id)}
            selectedStudentId={user.id}
            isTeacherMode={false}
          />
          <span className="hidden text-xs text-muted-foreground sm:inline">Changes save automatically</span>
        </div>

        <div className="h-full w-full flex-1 overflow-hidden rounded-xl border bg-card">
          <WhiteboardCanvas
            key={currentBoard?.id}
            initialWhiteboard={currentBoard}
            whiteboardId={currentBoard?.id}
            roleLabel="Student"
            showTeacherTools={false}
            readOnly={!currentBoard}
            onSave={(newElements, previousElements) => {
              updateWhiteboardElements(currentBoard?.id || "", newElements, previousElements);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
