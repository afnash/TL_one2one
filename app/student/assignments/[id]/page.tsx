"use client";

import React, { useState, useEffect, use } from "react";
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

  const { user, saveWhiteboard, assignments, submissions, whiteboards, submitAssignment, updateWhiteboardElements } = useLMS();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const submission = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === user.id);

  const [activeWhiteboardId, setActiveWhiteboardId] = useState<string>(
    submission?.whiteboardId || `work-${assignmentId}-${user.id}`
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    submission?.status === "SUBMITTED" || submission?.status === "REVIEWED"
  );
  const [mobileTab, setMobileTab] = useState<"QUESTIONS" | "WORK">("WORK");

  const currentBoard =
    whiteboards.find((w) => w.id === activeWhiteboardId);

  useEffect(() => {
    if (assignment && !currentBoard) {
      const template = whiteboards.find(w=>w.id===assignment.whiteboardId);
      saveWhiteboard({ id: activeWhiteboardId, title: assignment.title + " ? " + user.name, subject: assignment.subject, studentId: user.id, studentName: user.name, teacherId: assignment.teacherId, assignmentId: assignment.id, category: "ASSIGNMENT_SUBMISSION", elements: template?.elements || [], lastEdited: new Date().toISOString() });
    }
  }, [assignment?.id, currentBoard?.id]);

  const handleSubmit = () => {
    if(!assignment || !currentBoard) return;
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    submitAssignment(assignment.id, user.id, activeWhiteboardId);
    setIsSubmitted(true);
  };

  if (!assignment) return <div className="p-10">Assignment not found.</div>;

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
        <div className="grid grid-cols-2 gap-1 border-b border-slate-200 bg-white p-2 lg:hidden">
          <button
            onClick={() => setMobileTab("QUESTIONS")}
            className={cn("rounded-lg px-3 py-2 text-xs font-bold", mobileTab === "QUESTIONS" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}
          >
            Questions
          </button>
          <button
            onClick={() => setMobileTab("WORK")}
            className={cn("rounded-lg px-3 py-2 text-xs font-bold", mobileTab === "WORK" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}
          >
            My Work
          </button>
        </div>
        {mobileTab === "QUESTIONS" && (
          <div className="flex-1 space-y-3 overflow-y-auto bg-white p-4 lg:hidden">
            {assignment.questions.map((question) => (
              <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-indigo-700">
                  <span>Question {question.number}</span><span>{question.maxScore} marks</span>
                </div>
                <p className="text-sm leading-6 text-slate-800">{question.text}</p>
              </article>
            ))}
          </div>
        )}
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
        <div className={cn("flex-1 flex-col bg-white overflow-hidden relative", mobileTab === "WORK" ? "flex" : "hidden lg:flex")}>
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
              onSave={(newElements, previousElements) => {
                if (currentBoard) {
                  updateWhiteboardElements(currentBoard.id, newElements, previousElements);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
