"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import confetti from "canvas-confetti";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [activeWhiteboardId] = useState<string>(
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
      saveWhiteboard({ id: activeWhiteboardId, title: assignment.title + " · " + user.name, subject: assignment.subject, studentId: user.id, studentName: user.name, teacherId: assignment.teacherId, assignmentId: assignment.id, category: "ASSIGNMENT_SUBMISSION", elements: template?.elements || [], lastEdited: new Date().toISOString() });
    }
  }, [assignment?.id, currentBoard?.id]);

  const handleSubmit = () => {
    if(!assignment || !currentBoard) return;
    try {
      submitAssignment(assignment.id, user.id, activeWhiteboardId);
    } catch {
      return;
    }
    setIsSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  if (!assignment) return <div className="p-10 text-muted-foreground">Assignment not found.</div>;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/student/assignments")} aria-label="Back to assignments">
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{assignment.title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {assignment.subject} · {assignment.teacherName} · Due {assignment.dueDate}
            </p>
          </div>
        </div>

        {submission?.status === "REVIEWED" ? (
          <p className="text-sm font-medium text-foreground">
            Scored {submission.score} of {submission.maxScore}
          </p>
        ) : isSubmitted ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" />
            Submitted, waiting for review
          </p>
        ) : (
          <Button onClick={handleSubmit}>
            <Send data-icon="inline-start" />
            Submit assignment
          </Button>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "QUESTIONS" | "WORK")} className="border-b bg-card p-2 lg:hidden">
          <TabsList className="w-full">
            <TabsTrigger value="QUESTIONS">Questions</TabsTrigger>
            <TabsTrigger value="WORK">My work</TabsTrigger>
          </TabsList>
        </Tabs>

        {mobileTab === "QUESTIONS" && (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-card p-4 lg:hidden">
            {assignment.questions.map((question) => (
              <article key={question.id} className="rounded-xl border bg-background p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Question {question.number}</span>
                  <span>{question.maxScore} marks</span>
                </div>
                <p className="text-sm leading-6 text-foreground">{question.text}</p>
              </article>
            ))}
          </div>
        )}

        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-card p-4 lg:flex">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-foreground">Questions ({assignment.questions.length})</h2>
            <p className="text-xs text-muted-foreground">Solve each one directly on the whiteboard.</p>
          </div>

          <div className="flex flex-col gap-3">
            {assignment.questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-2 rounded-xl border bg-background p-3.5 text-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Question {q.number}</span>
                  <span>{q.maxScore} marks</span>
                </div>
                <p className="leading-relaxed text-foreground">{q.text}</p>
              </div>
            ))}
          </div>

          {submission?.teacherFeedback && (
            <div className="flex flex-col gap-1.5 rounded-xl border bg-secondary/50 p-4 text-sm">
              <h3 className="text-xs font-medium text-muted-foreground">Teacher feedback</h3>
              <p className="leading-relaxed text-foreground">{submission.teacherFeedback}</p>
            </div>
          )}
        </aside>

        <div className={cn("relative flex-1 flex-col overflow-hidden bg-card", mobileTab === "WORK" ? "flex" : "hidden lg:flex")}>
          <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="truncate">
              Working on <span className="font-medium text-foreground">{currentBoard?.title || "My assignment board"}</span>
            </span>
            <span className="hidden sm:inline">Saved automatically</span>
          </div>

          <div className="relative h-full w-full flex-1">
            <WhiteboardCanvas
              initialWhiteboard={currentBoard}
              whiteboardId={currentBoard?.id}
              roleLabel="Student"
              showTeacherTools={false}
              readOnly={isSubmitted || submission?.status === "SUBMITTED" || submission?.status === "REVIEWED"}
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
