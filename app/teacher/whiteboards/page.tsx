"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
import {
  Layers,
  Plus,
  Search,
  FileDown,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherWhiteboardsPage() {
  const { whiteboards, students, updateWhiteboardElements } = useLMS();

  const [activeBoardId, setActiveBoardId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const currentBoard =
    whiteboards.find((w) => w.id === activeBoardId) || whiteboards[0];

  return (
    <AppShell
      headerTitle="Subject & Student Whiteboards"
      headerSubtitle="Inspect, create, and annotate subject-specific whiteboards for each 1-to-1 student"
    >
      <div className="h-[calc(100vh-140px)] flex flex-col space-y-3">
        {/* Top Board Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <StudentBoardSelector
            currentWhiteboardId={activeBoardId}
            onSelectBoard={(id) => setActiveBoardId(id)}
            selectedStudentId={selectedStudentId}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            isTeacherMode={true}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Canvas Auto-saved
            </span>
          </div>
        </div>

        {/* Interactive Infinite Whiteboard */}
        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <WhiteboardCanvas
            key={currentBoard?.id}
            initialWhiteboard={currentBoard}
            whiteboardId={currentBoard?.id}
            roleLabel="Teacher"
            showTeacherTools={true}
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
