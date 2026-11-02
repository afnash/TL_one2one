"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLMS } from "@/lib/store";
import {
  ChevronDown,
  Layers,
  GraduationCap,
  BookOpen,
  PenTool,
  Plus,
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
    const title = `${selectedSubject || "General"} · ${category === "PRACTICE" ? "Practice" : category === "MY_WORK" ? "Scratchpad" : "Live Session"} (${new Date().toLocaleDateString()})`;
    const newBoard = createWhiteboard(title, selectedSubject || currentStudent?.subjects[0] || "General", category, selectedStudentId || currentStudent?.id);
    onSelectBoard(newBoard.id);
    setIsBoardDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-1.5 p-0.5 bg-card border rounded-lg ">
      {/* Teacher Student Switcher Dropdown */}
      {isTeacherMode && currentStudent && (
        <div className="relative">
          <button
            onClick={() => {
              setIsStudentDropdownOpen(!isStudentDropdownOpen);
              setIsBoardDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md bg-background hover:bg-muted text-foreground border transition-colors"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-input shrink-0">
              <img src={currentStudent.avatar} alt={currentStudent.name} className="w-full h-full object-cover" />
            </div>
            <span className="truncate max-w-[100px] sm:max-w-[130px]">
              <strong className="text-foreground font-semibold">{currentStudent.name}</strong>
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          </button>

          {isStudentDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-popover border rounded-xl shadow-md z-50 p-1 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground">
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
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <img src={st.avatar} alt={st.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{st.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{st.grade}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(selectedSubject === sub.name ? "" : sub.name)}
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium rounded transition-all",
              selectedSubject === sub.name
                ? "bg-white text-primary  font-semibold"
                : "text-muted-foreground hover:text-foreground"
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
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md bg-secondary hover:bg-secondary/70 text-secondary-foreground border border-transparent transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="max-w-[140px] sm:max-w-[180px] truncate">{currentBoard?.title || "Select Board"}</span>
          <ChevronDown className="w-3 h-3 text-primary shrink-0" />
        </button>

        {isBoardDropdownOpen && (
          <div className="absolute top-full right-0 md:left-0 mt-1 w-72 bg-popover border rounded-xl shadow-md z-50 p-1.5 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground flex items-center justify-between">
              <span>{selectedSubject || "All"} Whiteboards</span>
              <span className="text-muted-foreground">{studentBoards.length}</span>
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
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="shrink-0">
                    {b.category === "LIVE_CLASS" ? (
                      <GraduationCap className="w-3 h-3 text-primary" />
                    ) : b.category === "ASSIGNMENTS" ? (
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <PenTool className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate text-xs">{b.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {b.category.replace("_", " ")} • {b.elements?.length || 0} items
                    </p>
                  </div>
                </button>
              ))}

              {studentBoards.length === 0 && (
                <div className="py-3 text-center text-xs text-muted-foreground">
                  No whiteboards in {selectedSubject || "this filter"} yet.
                </div>
              )}
            </div>

            <div className="border-t border-border pt-1 flex gap-1">
              <button
                onClick={() => handleCreateNewBoard("PRACTICE")}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs font-semibold text-primary hover:bg-muted rounded-lg transition-colors"
              >
                <Plus className="size-3" /> New practice board
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
