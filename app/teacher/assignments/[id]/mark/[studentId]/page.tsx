"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { AlertCircle, ArrowLeft, CheckCircle2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

    const newTotal = Object.values(updated).reduce((acc, item) => acc + item.marks, 0);
    setTotalScore(newTotal);
  };

  const handleSaveAndReturn = () => {
    if (!submission || totalScore < 0 || totalScore > maxScore) return;
    gradeSubmission(submission.id, totalScore, feedback, questionMarks);
    router.push("/teacher/assignments");
  };

  if (!assignment || !student || !submission) {
    return <div className="p-10 text-muted-foreground">No submission found for this student and assignment.</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/teacher/assignments")} aria-label="Back to assignments">
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{assignment.title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {student.name} · Submitted {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={handleSaveAndReturn}>
          <Send data-icon="inline-start" />
          Return review to student
        </Button>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-card p-4 lg:flex">
          <h2 className="text-sm font-medium text-foreground">Questions</h2>
          <div className="flex flex-col gap-3">
            {assignment.questions.map((q) => {
              const qState = questionMarks[q.id] || { status: "correct", marks: q.maxScore };
              return (
                <div key={q.id} className="flex flex-col gap-2 rounded-xl border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Question {q.number}</span>
                    <span className="tabular-nums">
                      {qState.marks} / {q.maxScore}
                    </span>
                  </div>
                  <p className="text-foreground">{q.text}</p>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    value={qState.status}
                    onValueChange={(v) => v && handleSetQuestionStatus(q.id, v as "correct" | "partial" | "incorrect", q.maxScore)}
                    className="w-full"
                    aria-label={`Mark for question ${q.number}`}
                  >
                    <ToggleGroupItem value="correct" className="flex-1">
                      <CheckCircle2 />
                      Right
                    </ToggleGroupItem>
                    <ToggleGroupItem value="partial" className="flex-1">
                      <AlertCircle />
                      Part
                    </ToggleGroupItem>
                    <ToggleGroupItem value="incorrect" className="flex-1">
                      <XCircle />
                      Wrong
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-card">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="truncate">
              Student work: <span className="font-medium text-foreground">{studentWhiteboard?.title || "Submission board"}</span>
            </span>
            <span className="hidden sm:inline">Use the pen, stamps and text tools to annotate the solution.</span>
          </div>
          <div className="relative h-full w-full flex-1">
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

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t bg-card p-4 md:w-80 md:border-t-0 md:border-l">
          <h2 className="text-sm font-medium text-foreground">Marks and feedback</h2>

          <div className="flex flex-col gap-2 rounded-xl border bg-background p-4">
            <label htmlFor="total-score" className="text-xs font-medium text-muted-foreground">
              Total score
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="total-score"
                type="number"
                value={totalScore}
                onChange={(e) => setTotalScore(parseInt(e.target.value, 10) || 0)}
                className="h-10 w-20 text-center text-lg font-semibold"
              />
              <span className="text-sm text-muted-foreground">of {maxScore}</span>
              <span className="ml-auto text-sm font-medium tabular-nums text-foreground">
                {maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback" className="text-xs font-medium text-muted-foreground">
              Feedback for the student
            </label>
            <Textarea
              id="feedback"
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well, and what to work on next"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setTotalScore(maxScore);
              setFeedback("Perfect solution! All factorisations, steps, and roots verified cleanly.");
            }}
          >
            Award full marks
          </Button>
        </aside>
      </div>
    </div>
  );
}
