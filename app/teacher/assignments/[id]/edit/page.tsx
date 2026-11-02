"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { EmptyNote, PageHeader } from "@/components/dashboard/parts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types";
import { AlertCircle, ArrowLeft, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAssignmentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const { students, subjects, assignments, whiteboards, updateAssignment, updateWhiteboardElements } = useLMS();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const existingBoard = whiteboards.find((w) => w.id === assignment?.whiteboardId);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [instructions, setInstructions] = useState("");
  const [targetType, setTargetType] = useState<"INDIVIDUAL" | "MULTIPLE" | "BROADCAST">("INDIVIDUAL");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "whiteboard">("details");
  const [saveError, setSaveError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setSubject(assignment.subject);
      setDescription(assignment.description || "");
      setDueDate(assignment.dueDate || "");
      setDifficulty(assignment.difficulty || "Medium");
      setInstructions(assignment.instructions || "");
      setTargetType(assignment.targetType || "INDIVIDUAL");
      setSelectedStudentIds(assignment.assignedStudentIds || []);
      setQuestions(assignment.questions || []);
    }
  }, [assignment]);

  if (!assignment) {
    return (
      <AppShell>
        <EmptyNote>Assignment or homework not found.</EmptyNote>
      </AppShell>
    );
  }

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}-${nextNum}`,
        number: nextNum,
        text: "",
        maxScore: 5,
        subject: subject || "General",
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return;
    const filtered = questions.filter((q) => q.id !== id);
    const renumbered = filtered.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));
    setQuestions(renumbered);
  };

  const handleQuestionChange = <K extends keyof Question>(id: string, field: K, val: Question[K]) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const handleSaveAssignment = () => {
    if (!title.trim()) {
      setSaveError("Please enter an assignment title.");
      return;
    }

    if (questions.some((q) => !q.text.trim())) {
      setSaveError("Please complete the text for all questions.");
      return;
    }

    setSaveError("");

    updateAssignment(assignmentId, {
      title: title.trim(),
      subject,
      description: description.trim(),
      dueDate,
      difficulty,
      instructions: instructions.trim(),
      targetType,
      assignedStudentIds: selectedStudentIds,
      questions,
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push("/teacher/assignments");
    }, 600);
  };

  return (
    <AppShell
      headerTitle="Edit assignment"
      headerSubtitle="Change questions, instructions, due date and the question board"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-20">
        <PageHeader
          title={assignment.title}
          description={`${students.length ? `${selectedStudentIds.length} assigned` : "No students yet"} · ${questions.length} ${questions.length === 1 ? "question" : "questions"}`}
          action={
            <Button variant="ghost" onClick={() => router.push("/teacher/assignments")}>
              <ArrowLeft data-icon="inline-start" />
              Back to assignments
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "whiteboard")}>
          <TabsList>
            <TabsTrigger value="details">Details and questions</TabsTrigger>
            <TabsTrigger value="whiteboard">Question board</TabsTrigger>
          </TabsList>
        </Tabs>

        {saveError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {isSaved && (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>Changes saved. Going back to assignments.</AlertDescription>
          </Alert>
        )}

        {activeTab === "details" ? (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basics</CardTitle>
                <CardDescription>Title, subject, due date and instructions.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="asg-title">Title</FieldLabel>
                      <Input
                        id="asg-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Quadratic equations practice"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="asg-subject">Subject</FieldLabel>
                      <select id="asg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={selectClass}>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="asg-due">Due date</FieldLabel>
                      <Input id="asg-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="asg-difficulty">Difficulty</FieldLabel>
                      <select
                        id="asg-difficulty"
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

                  <Field>
                    <FieldLabel htmlFor="asg-instructions">Instructions</FieldLabel>
                    <Textarea
                      id="asg-instructions"
                      rows={3}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Show your working on the whiteboard."
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="asg-description">Overview</FieldLabel>
                    <Textarea
                      id="asg-description"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
                <CardDescription>Edit the prompts and the marks each one is worth.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {questions.map((q) => (
                  <div key={q.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">Question {q.number}</span>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`marks-${q.id}`} className="text-xs text-muted-foreground">
                          Marks
                        </label>
                        <Input
                          id={`marks-${q.id}`}
                          type="number"
                          value={q.maxScore}
                          onChange={(e) => handleQuestionChange(q.id, "maxScore", parseInt(e.target.value, 10) || 1)}
                          className="h-8 w-16 text-center"
                        />
                        {questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveQuestion(q.id)}
                            aria-label={`Remove question ${q.number}`}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      rows={2}
                      value={q.text}
                      onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
                      placeholder="Type the question"
                      aria-label={`Question ${q.number} text`}
                    />
                  </div>
                ))}
                <Button variant="outline" className="self-start" onClick={handleAddQuestion}>
                  <Plus data-icon="inline-start" />
                  Add question
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/teacher/assignments")}>
                Cancel
              </Button>
              <Button onClick={handleSaveAssignment}>
                <Save data-icon="inline-start" />
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{existingBoard?.title || assignment.title}</CardTitle>
              <CardDescription>Draw diagrams or add images with the pen, shape and text tools.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[600px] w-full overflow-hidden rounded-xl border">
                <WhiteboardCanvas
                  initialWhiteboard={existingBoard}
                  whiteboardId={existingBoard?.id}
                  roleLabel="Teacher"
                  showTeacherTools={true}
                  onSave={(newElements, previousElements) => {
                    if (existingBoard) {
                      updateWhiteboardElements(existingBoard.id, newElements, previousElements);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
