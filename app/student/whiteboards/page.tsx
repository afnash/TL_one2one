"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
import {
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  Download,
} from "lucide-react";

export default function StudentWhiteboardsPage() {
  const { whiteboards, updateWhiteboardElements } = useLMS();

  const [activeBoardId, setActiveBoardId] = useState<string>("wb-rahul-math-practice");

  const currentBoard =
    whiteboards.find((w) => w.id === activeBoardId) || whiteboards[0];

  return (
    <AppShell
      headerTitle="My Subject Whiteboards"
      headerSubtitle="Access your live class boards, homework, practice notes, and exported PDFs"
    >
      <div className="h-[calc(100vh-140px)] flex flex-col space-y-3">
        {/* Top Board Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <StudentBoardSelector
            currentWhiteboardId={activeBoardId}
            onSelectBoard={(id) => setActiveBoardId(id)}
            selectedStudentId="s1"
            isTeacherMode={false}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Continuous Work Supported
            </span>
          </div>
        </div>

        {/* Interactive Infinite Canvas */}
        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <WhiteboardCanvas
            key={activeBoardId}
            initialWhiteboard={currentBoard}
            whiteboardId={activeBoardId}
            roleLabel="Student"
            showTeacherTools={false}
            onSave={(newElements) => {
              updateWhiteboardElements(activeBoardId, newElements);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
