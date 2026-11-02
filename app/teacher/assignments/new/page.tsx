"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { Question, WhiteboardElement } from "@/types";
import { initials, EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertCircle, ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Get tomorrow formatted as YYYY-MM-DD
function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const { user, students, directory, createAssignment, createWhiteboard, saveWhiteboard } = useLMS();

  const currentTeacher = directory.teachers?.find((t) => t.id === user.id);
  const teacherSubjects = currentTeacher?.subjects?.length
    ? currentTeacher.subjects
    : (user as any).subjects?.length
    ? (user as any).subjects
    : ["Mathematics"];

  const [kind, setKind] = useState<"ASSIGNMENT" | "HOMEWORK">("ASSIGNMENT");
  const [boardElements, setBoardElements] = useState<WhiteboardElement[] | null>(null);
  const [publishError, setPublishError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields with solid smart defaults
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(teacherSubjects[0] || "Mathematics");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(getTomorrowDateStr());
  const [dueTime, setDueTime] = useState("23:59");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [instructions, setInstructions] = useState("");

  // Target Student Selection
  const [targetType, setTargetType] = useState<"INDIVIDUAL" | "MULTIPLE" | "BROADCAST">("INDIVIDUAL");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Sync subjects when loaded
  useEffect(() => {
    if (!subject && teacherSubjects.length > 0) {
      setSubject(teacherSubjects[0]);
    }
  }, [teacherSubjects, subject]);

  // Sync default student selection when students list loads
  useEffect(() => {
    if (students.length > 0 && selectedStudentIds.length === 0) {
      setSelectedStudentIds([students[0].id]);
    }
  }, [students]);

  // Questions Builder with an initial question
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}`,
      number: 1,
      text: "",
      maxScore: 5,
      subject: teacherSubjects[0] || "Mathematics",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"details" | "whiteboard">("details");

  // Generate Whiteboard Elements from Questions
  const generateWhiteboardElements = (): WhiteboardElement[] => {
    const elements: WhiteboardElement[] = [
      {
        id: "wb-header",
        type: "text",
        x: 60,
        y: 50,
        text: `📝 ${kind === "HOMEWORK" ? "Homework" : "Assignment"}: ${title || "Problem Set"} (${subject || "General"})`,
        strokeColor: "#1e293b",
        strokeWidth: 2,
        fontSize: 22,
      },
    ];

    let currentY = 110;
    questions.forEach((q) => {
      elements.push({
        id: `q-card-${q.id}`,
        type: "question_card",
        x: 60,
        y: currentY,
        questionNumber: q.number,
        questionText: `${q.text || "Solve the problem..."}  [${q.maxScore} marks]`,
        strokeColor: "#4f46e5",
        strokeWidth: 1.5,
        width: 620,
        height: 85,
      });
      currentY += 160;
    });

    return elements;
  };

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      number: nextNum,
      text: "",
      maxScore: 5,
      subject: subject || "Mathematics",
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      setQuestions([{ id: `q-${Date.now()}`, number: 1, text: "", maxScore: 5, subject }]);
      return;
    }
    setQuestions(
      questions
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, number: idx + 1 }))
    );
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleToggleStudent = (sId: string) => {
    if (selectedStudentIds.includes(sId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== sId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, sId]);
    }
  };

  const handleSelectAllStudents = () => {
    setSelectedStudentIds(students.map((s) => s.id));
  };

  const handlePublish = () => {
    setPublishError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setPublishError("Please enter an assignment title.");
      setActiveTab("details");
      return;
    }

    const currentSubject = subject || (teacherSubjects[0] ?? "Mathematics");
    if (!currentSubject) {
      setPublishError("Please choose or specify a subject.");
      setActiveTab("details");
      return;
    }

    if (!dueDate) {
      setPublishError("Please select a due date.");
      setActiveTab("details");
      return;
    }

    const effectiveTime = dueTime || "23:59";

    // Determine target students
    let targetStudentIds = selectedStudentIds;
    if (targetType === "BROADCAST") {
      targetStudentIds = students.map((s) => s.id);
    } else if (targetStudentIds.length === 0) {
      if (students.length > 0) {
        targetStudentIds = [students[0].id];
        setSelectedStudentIds(targetStudentIds);
      } else {
        setPublishError("Please select at least one student to assign to.");
        setActiveTab("details");
        return;
      }
    }

    // Filter or validate questions
    const validQuestions = questions.map((q, idx) => ({
      ...q,
      number: idx + 1,
      text: q.text.trim() ? q.text.trim() : `Problem ${idx + 1}: Solve and show working on canvas.`,
      maxScore: q.maxScore > 0 ? q.maxScore : 5,
      subject: currentSubject,
    }));

    setIsSubmitting(true);

    try {
      const board = createWhiteboard(trimmedTitle, currentSubject, "ASSIGNMENT_QUESTION");
      const generatedEls = boardElements || generateWhiteboardElements();
      saveWhiteboard({ ...board, elements: generatedEls });

      createAssignment({
        kind,
        title: trimmedTitle,
        subject: currentSubject,
        teacherId: user.id || "teacher-1",
        teacherName: user.name || "Lead Educator",
        description: description.trim() || `${kind === "HOMEWORK" ? "Homework" : "Assignment"} for ${currentSubject}`,
        dueDate,
        dueTime: effectiveTime,
        difficulty,
        instructions: instructions.trim(),
        targetType,
        assignedStudentIds: targetStudentIds,
        questions: validQuestions,
        whiteboardId: board.id,
      });

      router.push("/teacher/assignments");
    } catch (err: any) {
      setPublishError(err?.message || "Failed to create assignment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      headerTitle="New assignment"
      headerSubtitle="Set the questions, choose students and preview the question board"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-20">
        <PageHeader
          title={kind === "HOMEWORK" ? "New homework" : "New assignment"}
          description="Step 1 sets the details and students. Step 2 builds the questions and previews the board."
          action={
            <Button variant="ghost" onClick={() => router.push("/teacher/assignments")}>
              <ArrowLeft data-icon="inline-start" />
              Back to assignments
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "whiteboard")}>
          <TabsList>
            <TabsTrigger value="details">1. Details and students</TabsTrigger>
            <TabsTrigger value="whiteboard">2. Questions ({questions.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {publishError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle />
            <AlertDescription>{publishError}</AlertDescription>
          </Alert>
        )}

        {activeTab === "details" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
              <CardDescription>What it is, when it is due and who gets it.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={kind}
                    onValueChange={(v) => v && setKind(v as "ASSIGNMENT" | "HOMEWORK")}
                    className="self-start"
                  >
                    <ToggleGroupItem value="ASSIGNMENT">Assignment</ToggleGroupItem>
                    <ToggleGroupItem value="HOMEWORK">Homework</ToggleGroupItem>
                  </ToggleGroup>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="new-title">Title</FieldLabel>
                    <Input
                      id="new-title"
                      placeholder="e.g. Quadratic equations practice set"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-subject">Subject</FieldLabel>
                    <select id="new-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={selectClass}>
                      {teacherSubjects.map((sub: string) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="new-description">Overview and instructions</FieldLabel>
                  <Textarea
                    id="new-description"
                    rows={2}
                    placeholder="Context, hints or what you expect in the submission"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="new-due">Due date</FieldLabel>
                    <Input id="new-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-time">Due time</FieldLabel>
                    <Input id="new-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new-difficulty">Difficulty</FieldLabel>
                    <select
                      id="new-difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                      className={selectClass}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </Field>
                </div>

                <Separator />

                <Field>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>Assign to</FieldLabel>
                    {targetType === "MULTIPLE" && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleSelectAllStudents}>
                        Select all
                      </Button>
                    )}
                  </div>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={targetType}
                    onValueChange={(v) => {
                      if (!v) return;
                      setTargetType(v as typeof targetType);
                      if (v === "INDIVIDUAL" && selectedStudentIds.length === 0 && students[0]) {
                        setSelectedStudentIds([students[0].id]);
                      }
                    }}
                    className="self-start"
                  >
                    <ToggleGroupItem value="INDIVIDUAL">One student</ToggleGroupItem>
                    <ToggleGroupItem value="MULTIPLE">Several students</ToggleGroupItem>
                    <ToggleGroupItem value="BROADCAST">All students</ToggleGroupItem>
                  </ToggleGroup>
                </Field>

                {targetType !== "BROADCAST" &&
                  (students.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {students.map((st) => {
                        const isSelected = selectedStudentIds.includes(st.id);
                        return (
                          <label
                            key={st.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/60",
                              isSelected && "border-ring bg-secondary/50"
                            )}
                          >
                            <input
                              type={targetType === "INDIVIDUAL" ? "radio" : "checkbox"}
                              name="student-target"
                              checked={isSelected}
                              onChange={() => {
                                if (targetType === "INDIVIDUAL") setSelectedStudentIds([st.id]);
                                else handleToggleStudent(st.id);
                              }}
                              className="accent-primary"
                            />
                            <Avatar size="sm">
                              <AvatarImage src={st.avatar} alt="" />
                              <AvatarFallback>{initials(st.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 text-sm">
                              <p className="truncate font-medium text-foreground">{st.name}</p>
                              <p className="text-xs text-muted-foreground">{st.grade || "Student"}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyNote>
                      No students in your roster yet. The assignment will be available to all registered students when you publish.
                    </EmptyNote>
                  ))}
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <Button type="button" variant="outline" onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish now"}
              </Button>
              <Button type="button" onClick={() => setActiveTab("whiteboard")}>
                Next: questions
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === "whiteboard" && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
                <CardDescription>Each question becomes a card on the student&apos;s whiteboard.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 rounded-xl border bg-background p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
                      {q.number}
                    </span>
                    <Input
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                      placeholder={`Question ${q.number}, e.g. Solve 2x + 5 = 15`}
                      aria-label={`Question ${q.number} text`}
                    />
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={q.maxScore}
                        onChange={(e) => handleUpdateQuestion(q.id, { maxScore: parseInt(e.target.value, 10) || 1 })}
                        className="w-16 text-center"
                        aria-label={`Marks for question ${q.number}`}
                      />
                      <span className="text-xs text-muted-foreground">marks</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(q.id)}
                        aria-label={`Remove question ${q.number}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" className="self-start" onClick={handleAddQuestion}>
                  <Plus data-icon="inline-start" />
                  Add question
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Board preview</CardTitle>
                <CardDescription>Students solve directly on this board. You can add drawings before publishing.</CardDescription>
                <CardAction>
                  <Button type="button" onClick={handlePublish} disabled={isSubmitting}>
                    {isSubmitting ? "Publishing..." : "Publish"}
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="h-[480px] w-full overflow-hidden rounded-xl border">
                  <WhiteboardCanvas
                    onSave={(elements) => setBoardElements(elements)}
                    initialWhiteboard={{
                      id: "wb-new-asg-preview",
                      title: `${title || "New assignment"} (question board)`,
                      subject: subject || "Mathematics",
                      category: "ASSIGNMENT_QUESTION",
                      lastEdited: new Date().toISOString(),
                      elements: boardElements || generateWhiteboardElements(),
                    }}
                    showTeacherTools={true}
                    roleLabel="Teacher"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
