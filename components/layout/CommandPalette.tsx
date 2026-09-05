"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  Search,
  Users,
  Video,
  Layers,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const {
    role,
    students,
    teachers,
    sessions,
    assignments,
    whiteboards,
    materials,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  } = useLMS();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase();

  // Search across entities
  const matchingStudents = students.filter(
    (s) => s.name.toLowerCase().includes(q) || s.subjects.some((sub) => sub.toLowerCase().includes(q))
  );

  const matchingAssignments = assignments.filter(
    (a) => a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q)
  );

  const matchingSessions = sessions.filter(
    (s) => s.studentName.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q)
  );

  const matchingWhiteboards = whiteboards.filter(
    (w) => w.title.toLowerCase().includes(q) || w.subject.toLowerCase().includes(q)
  );

  const matchingMaterials = materials.filter(
    (m) => m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)
  );

  const handleNavigate = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, assignments, live sessions, whiteboards, materials..."
            className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 hover:bg-slate-200 rounded-md text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="px-2 pb-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Quick Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {role === "TEACHER" ? (
                  <>
                    <button
                      onClick={() => handleNavigate("/teacher/sessions")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-indigo-50/70 text-slate-700 text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Open live sessions</p>
                        <p className="text-[11px] text-slate-500">Live 1-to-1 Classroom</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate("/teacher/assignments/new")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-indigo-50/70 text-slate-700 text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Create New Assignment</p>
                        <p className="text-[11px] text-slate-500">With Whiteboard questions</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigate("/student/sessions")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-indigo-50/70 text-slate-700 text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Join Live Class</p>
                        <p className="text-[11px] text-slate-500">Your scheduled classes</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate("/student/whiteboards")}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-indigo-50/70 text-slate-700 text-left transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Open Whiteboards</p>
                        <p className="text-[11px] text-slate-500">Practice and Homework</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Students */}
          {matchingStudents.length > 0 && (
            <div>
              <p className="px-2 pb-1 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Students ({matchingStudents.length})
              </p>
              <div className="space-y-1">
                {matchingStudents.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleNavigate(`/teacher/students/${st.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-slate-900">{st.name}</span>
                        <span className="text-slate-400 ml-2">{st.grade} • {st.subjects.join(", ")}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-600 flex items-center gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {matchingAssignments.length > 0 && (
            <div>
              <p className="px-2 pb-1 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Assignments ({matchingAssignments.length})
              </p>
              <div className="space-y-1">
                {matchingAssignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      handleNavigate(
                        role === "TEACHER" ? `/teacher/assignments` : `/student/assignments/${a.id}`
                      )
                    }
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{a.title}</span>
                        <span className="text-slate-400 ml-2">{a.subject} • Due: {a.dueDate}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {a.questions.length} questions
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Whiteboards */}
          {matchingWhiteboards.length > 0 && (
            <div>
              <p className="px-2 pb-1 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Whiteboards ({matchingWhiteboards.length})
              </p>
              <div className="space-y-1">
                {matchingWhiteboards.map((w) => (
                  <button
                    key={w.id}
                    onClick={() =>
                      handleNavigate(
                        role === "TEACHER" ? `/teacher/whiteboards` : `/student/whiteboards`
                      )
                    }
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{w.title}</span>
                        <span className="text-slate-400 ml-2">{w.subject}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">{w.category.replace("_", " ")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {query &&
            matchingStudents.length === 0 &&
            matchingAssignments.length === 0 &&
            matchingWhiteboards.length === 0 &&
            matchingMaterials.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No matches found for "{query}"</p>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or Tab</span>
          <span>Antigravity 1-to-1 LMS</span>
        </div>
      </div>
    </div>
  );
}
