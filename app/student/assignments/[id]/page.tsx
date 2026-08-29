"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentAssignmentWorkspacePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const { assignments, submissions, whiteboards, submitAssignment, updateWhiteboardElements } = useLMS();

  const assignment = assignments.find((a) => a.id === assignmentId) || assignments[0];
  const submission = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === "s1");

  const [activeWhiteboardId, setActiveWhiteboardId] = useState<string>(
    submission?.whiteboardId || "wb-rahul-math-hw"
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    submission?.status === "SUBMITTED" || submission?.status === "REVIEWED"
  );

  const currentBoard =
    whiteboards.find((w) => w.id === activeWhiteboardId) || whiteboards[1];

  const handleSubmit = () => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    submitAssignment(assignment.id, "s1", activeWhiteboardId);
    setIsSubmitted(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans select-none">
      {/* Non-Video Assignment Workspace Header */}
      <header className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/assignments")}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900">{assignment.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {assignment.subject}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Instructor: <strong>{assignment.teacherName}</strong> • Due: {assignment.dueDate}
            </p>
          </div>
        </div>

        {/* Right Status & Submit Button */}
        <div className="flex items-center gap-2">
          {submission?.status === "REVIEWED" ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Score: {submission.score} / {submission.maxScore} (Reviewed)</span>
            </div>
          ) : isSubmitted ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Submitted • Awaiting Teacher Review</span>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Assignment</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Questions Navigator Bar */}
        <div className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Problems to Solve ({assignment.questions.length})
            </h3>
            <p className="text-xs text-slate-500">
              Solve each problem directly on the whiteboard canvas.
            </p>
          </div>

          <div className="space-y-3">
            {assignment.questions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600">Question {q.number}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                    {q.maxScore} marks
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{q.text}</p>
              </div>
            ))}
          </div>

          {submission?.teacherFeedback && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Educator Comments
              </span>
              <p className="text-indigo-900 italic leading-relaxed">
                "{submission.teacherFeedback}"
              </p>
            </div>
          )}
        </div>

        {/* Center: Student Interactive Solution Whiteboard */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Solution Scratchpad: <strong>{currentBoard?.title || "My Assignment Canvas"}</strong>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Canvas automatically saved. Use Pen, Shapes, Text & Export tools.
            </span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <WhiteboardCanvas
              initialWhiteboard={currentBoard}
              whiteboardId={currentBoard?.id}
              roleLabel="Student"
              showTeacherTools={false}
              onSave={(newElements) => {
                if (currentBoard) {
                  updateWhiteboardElements(currentBoard.id, newElements);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
