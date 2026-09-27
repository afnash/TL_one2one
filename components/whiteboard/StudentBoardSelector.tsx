"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLMS } from "@/lib/store";
import {
  ChevronDown,
  Layers,
  GraduationCap,
  BookOpen,
  PenTool,
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

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsStudentDropdownOpen(false);
        setIsBoardDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentBoard = whiteboards.find((w) => w.id === currentWhiteboardId) || whiteboards[0];

  // Filter boards for the selected student and subject
  const studentBoards = whiteboards.filter(
    (w) =>
      (!w.studentId || w.studentId === (selectedStudentId || currentStudent?.id)) &&
      (!selectedSubject || w.subject === selectedSubject)
  );

  const handleCreateNewBoard = (category: "PRACTICE" | "MY_WORK" | "LIVE_CLASS") => {
    const title = `${selectedSubject || "General"} — ${category === "PRACTICE" ? "Practice" : category === "MY_WORK" ? "Scratchpad" : "Live Session"} (${new Date().toLocaleDateString()})`;
    const newBoard = createWhiteboard(title, selectedSubject || currentStudent?.subjects[0] || "General", category, selectedStudentId || currentStudent?.id);
    onSelectBoard(newBoard.id);
    setIsBoardDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-1.5 p-0.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
      {/* Teacher Student Switcher Dropdown */}
      {isTeacherMode && currentStudent && (
        <div className="relative">
          <button
            onClick={() => {
              setIsStudentDropdownOpen(!isStudentDropdownOpen);
              setIsBoardDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-300 shrink-0">
              <img src={currentStudent.avatar} alt={currentStudent.name} className="w-full h-full object-cover" />
            </div>
            <span className="truncate max-w-[100px] sm:max-w-[130px]">
              <strong className="text-slate-900 font-semibold">{currentStudent.name}</strong>
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isStudentDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                    "w-full flex items-center justify-between px-2 py-1 text-xs rounded-lg text-left transition-colors",
                    st.id === selectedStudentId
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <img src={st.avatar} alt={st.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{st.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{st.grade}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-md">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(selectedSubject === sub.name ? "" : sub.name)}
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium rounded transition-all",
              selectedSubject === sub.name
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
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
          onClick={() => {
            setIsBoardDropdownOpen(!isBoardDropdownOpen);
            setIsStudentDropdownOpen(false);
          }}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200/60 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="max-w-[140px] sm:max-w-[180px] truncate">{currentBoard?.title || "Select Board"}</span>
          <ChevronDown className="w-3 h-3 text-indigo-400 shrink-0" />
        </button>

        {isBoardDropdownOpen && (
          <div className="absolute top-full right-0 md:left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{selectedSubject || "All"} Whiteboards</span>
              <span className="text-indigo-600 font-bold">{studentBoards.length}</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 my-1">
              {studentBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBoard(b.id);
                    setIsBoardDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg text-left transition-colors",
                    b.id === currentWhiteboardId
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="p-1 rounded bg-slate-100 text-slate-600 shrink-0">
                    {b.category === "LIVE_CLASS" ? (
                      <GraduationCap className="w-3 h-3 text-indigo-600" />
                    ) : b.category === "ASSIGNMENTS" ? (
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <PenTool className="w-3 h-3 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate text-xs">{b.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {b.category.replace("_", " ")} • {b.elements?.length || 0} items
                    </p>
                  </div>
                </button>
              ))}

              {studentBoards.length === 0 && (
                <div className="py-3 text-center text-xs text-slate-400">
                  No whiteboards in {selectedSubject || "this filter"} yet.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-1 flex gap-1">
              <button
                onClick={() => handleCreateNewBoard("PRACTICE")}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" /> + New Practice Board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
