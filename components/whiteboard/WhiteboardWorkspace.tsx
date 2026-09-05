"use client";

import { useMemo, useState } from "react";
import { useLMS } from "@/lib/store";
import { cn } from "@/lib/utils";
import { StudentBoardSelector } from "./StudentBoardSelector";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

export type WhiteboardWorkspaceMode =
  | "LIVE_CLASS"
  | "STUDENT_WORK"
  | "ASSIGNMENT_CREATION"
  | "ASSIGNMENT_REVIEW";

interface WhiteboardWorkspaceProps {
  mode: WhiteboardWorkspaceMode;
  initialBoardId?: string;
  studentId?: string;
  className?: string;
  showSelector?: boolean;
}

export function WhiteboardWorkspace({
  mode,
  initialBoardId,
  studentId = "",
  className,
  showSelector = true,
}: WhiteboardWorkspaceProps) {
  const { role, whiteboards, updateWhiteboardElements } = useLMS();
  const fallbackBoard = whiteboards.find((board) => board.studentId === studentId) ?? whiteboards[0];
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [activeBoardId, setActiveBoardId] = useState(initialBoardId ?? fallbackBoard?.id ?? "");

  const activeBoard = useMemo(
    () => whiteboards.find((board) => board.id === activeBoardId) ?? (initialBoardId ? undefined : fallbackBoard),
    [activeBoardId, fallbackBoard, whiteboards]
  );

  const isTeacher = role === "TEACHER" || role === "SUPERADMIN";
  const showTeacherTools = mode === "ASSIGNMENT_REVIEW" || (isTeacher && mode !== "STUDENT_WORK");

  if (!activeBoard) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">No whiteboard available.</div>;
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      {showSelector && (
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
          <StudentBoardSelector
            currentWhiteboardId={activeBoard.id}
            onSelectBoard={setActiveBoardId}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            isTeacherMode={isTeacher}
          />
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">Shared board ? syncs every 2 seconds</span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <WhiteboardCanvas
          key={activeBoard.id}
          initialWhiteboard={activeBoard}
          whiteboardId={activeBoard.id}
          roleLabel={isTeacher ? "Teacher" : "Student"}
          showTeacherTools={showTeacherTools}
          onSave={(elements, previous) => updateWhiteboardElements(activeBoard.id, elements, previous)}
        />
      </div>
    </div>
  );
}
