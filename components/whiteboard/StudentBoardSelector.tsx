"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import {
  ChevronDown,
  Layers,
  GraduationCap,
  BookOpen,
  PenTool,
  CheckCircle2,
  ExternalLink,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentBoardSelectorProps {
  currentWhiteboardId: string;
  onSelectBoard: (whiteboardId: string) => void;
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  isTeacherMode?: boolean;
}

export function StudentBoardSelector({
  currentWhiteboardId,
  onSelectBoard,
  selectedStudentId = "",
  onSelectStudent,
  isTeacherMode = false,
}: StudentBoardSelectorProps) {
  const { students, whiteboards, subjects, createWhiteboard } = useLMS();

  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentBoard = whiteboards.find((w) => w.id === currentWhiteboardId) || whiteboards[0];

  // Filter boards for the selected student and subject
  const studentBoards = whiteboards.filter(
    (w) =>
      (!w.studentId || w.studentId === (selectedStudentId || currentStudent?.id)) &&
      (!selectedSubject || w.subject === selectedSubject)
  );

  const handleCreateNewBoard = (category: "PRACTICE" | "MY_WORK" | "LIVE_CLASS") => {
    const title = `${selectedSubject} — ${category === "PRACTICE" ? "Practice" : category === "MY_WORK" ? "Scratchpad" : "Live Session"} (${new Date().toLocaleDateString()})`;
    const newBoard = createWhiteboard(title, selectedSubject || currentStudent?.subjects[0] || "General", category, selectedStudentId || currentStudent?.id);
    onSelectBoard(newBoard.id);
    setIsBoardDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
      {/* Teacher Student Switcher Dropdown */}
      {isTeacherMode && currentStudent && (
        <div className="relative">
          <button
            onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-300">
              <img src={currentStudent.avatar} alt={currentStudent.name} className="w-full h-full object-cover" />
            </div>
            <span>Student: <strong className="text-slate-900">{currentStudent.name}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isStudentDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Students
              </div>
              {students.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    if (onSelectStudent) onSelectStudent(st.id);
                    setIsStudentDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors",
                    st.id === selectedStudentId
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <img src={st.avatar} alt={st.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{st.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{st.grade}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.name)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              selectedSubject === sub.name
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Board Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200/60 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="max-w-[180px] truncate">{currentBoard?.title || "Select Board"}</span>
          <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
        </button>

        {isBoardDropdownOpen && (
          <div className="absolute top-full right-0 md:left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{selectedSubject} Whiteboards</span>
              <span className="text-indigo-600 font-bold">{studentBoards.length}</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 my-1">
              {studentBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBoard(b.id);
                    setIsBoardDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-left transition-colors",
                    b.id === currentWhiteboardId
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="p-1 rounded bg-slate-100 text-slate-600">
                    {b.category === "LIVE_CLASS" ? (
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    ) : b.category === "ASSIGNMENTS" ? (
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <PenTool className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate">{b.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {b.category.replace("_", " ")} • {b.elements?.length || 0} items
                    </p>
                  </div>
                </button>
              ))}

              {studentBoards.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  No whiteboards in {selectedSubject} yet.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-1.5 flex gap-1">
              <button
                onClick={() => handleCreateNewBoard("PRACTICE")}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> + New Practice Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
