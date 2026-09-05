"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Send,
  Star,
  Layers,
  Sparkles,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string; studentId: string }>;
}

export default function TeacherMarkingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id: assignmentId, studentId } = resolvedParams;
  const router = useRouter();

  const {
    assignments,
    submissions,
    students,
    whiteboards,
    gradeSubmission,
    updateWhiteboardElements,
  } = useLMS();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const student = students.find((s) => s.id === studentId);

  const submission =
    submissions.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );
  const studentWhiteboard = whiteboards.find(w => w.id === submission?.whiteboardId);

  // Grading State
  const [totalScore, setTotalScore] = useState<number>(submission?.score || 0);
  const [maxScore] = useState<number>(submission?.maxScore || 0);
  const [feedback, setFeedback] = useState<string>(
    submission?.teacherFeedback || ""
  );

  const [questionMarks, setQuestionMarks] = useState<
    Record<string, { status: "correct" | "incorrect" | "partial"; marks: number; comment?: string }>
  >(
    submission?.questionMarks || {}
  );

  const handleSetQuestionStatus = (
    qId: string,
    status: "correct" | "incorrect" | "partial",
    maxPts: number
  ) => {
    const pts = status === "correct" ? maxPts : status === "partial" ? Math.round(maxPts * 0.7) : 0;
    const updated = {
      ...questionMarks,
      [qId]: { ...questionMarks[qId], status, marks: pts },
    };
    setQuestionMarks(updated);

    // Recalculate total score
    const newTotal = Object.values(updated).reduce((acc, item) => acc + item.marks, 0);
    setTotalScore(newTotal);
  };

  const handleSaveAndReturn = () => {
    if (!submission || totalScore < 0 || totalScore > maxScore) return;
    gradeSubmission(submission.id, totalScore, feedback, questionMarks);
    router.push("/teacher/assignments");
  };

  if (!assignment || !student || !submission) return <div className="p-10">No submission found for this student and assignment.</div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans select-none">
      {/* Header Bar */}
      <header className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{assignment.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Marking Console
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Student: <strong>{student.name}</strong> • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAndReturn}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Return Review to Student</span>
          </button>
        </div>
      </header>

      {/* 3-Column Layout: Left (Questions), Center (Canvas), Right (Marking Panel) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Questions Navigator */}
        <div className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assignment Questions
          </h3>

          <div className="space-y-3">
            {assignment.questions.map((q) => {
              const qState = questionMarks[q.id] || { status: "correct", marks: q.maxScore };
              return (
                <div
                  key={q.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">Question {q.number}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {qState.marks} / {q.maxScore} pts
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">{q.text}</p>

                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => handleSetQuestionStatus(q.id, "correct", q.maxScore)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-colors",
                        qState.status === "correct"
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50"
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Correct</span>
                    </button>

                    <button
                      onClick={() => handleSetQuestionStatus(q.id, "partial", q.maxScore)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-colors",
                        qState.status === "partial"
                          ? "bg-amber-500 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-amber-50"
                      )}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>Partial</span>
                    </button>

                    <button
                      onClick={() => handleSetQuestionStatus(q.id, "incorrect", q.maxScore)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-bold transition-colors",
                        qState.status === "incorrect"
                          ? "bg-rose-600 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-rose-50"
                      )}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Incorrect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Student Solution Whiteboard Canvas with Live Annotation */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Student Canvas: <strong>{studentWhiteboard?.title || "Submission Board"}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Use Pen, Stamps (✓, ✗, !), and Text to annotate directly on the student's solution.
            </span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <WhiteboardCanvas
              initialWhiteboard={studentWhiteboard}
              whiteboardId={studentWhiteboard?.id}
              roleLabel="Teacher"
              showTeacherTools={true}
              onSave={(newElements, previousElements) => {
                if (studentWhiteboard) {
                  updateWhiteboardElements(studentWhiteboard.id, newElements, previousElements);
                }
              }}
            />
          </div>
        </div>

        {/* Right: Rubric & Marking Console Panel */}
        <div className="w-full md:w-80 lg:w-88 bg-white border-l border-slate-200 flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Marking & Feedback Panel
          </h3>

          {/* Total Score Box */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-indigo-900">Total Awarded Score</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={totalScore}
                onChange={(e) => setTotalScore(parseInt(e.target.value, 10) || 0)}
                className="w-20 px-3 py-1.5 text-xl font-extrabold bg-white border border-indigo-300 rounded-xl text-center text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-bold text-indigo-700">/ {maxScore} points</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-indigo-200/80 text-indigo-900 rounded-full">
                {Math.round((totalScore / maxScore) * 100)}%
              </span>
            </div>
          </div>

          {/* Detailed Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Personalized Teacher Feedback
            </label>
            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Quick Grading Action Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setTotalScore(maxScore);
                setFeedback("Perfect solution! All factorisations, steps, and roots verified cleanly.");
              }}
              className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
            >
              Award Full Marks (100%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
