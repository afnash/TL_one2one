"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { Question, WhiteboardElement } from "@/types";
import {
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAssignmentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const {
    user,
    students,
    subjects,
    assignments,
    whiteboards,
    updateAssignment,
    saveWhiteboard,
    updateWhiteboardElements,
  } = useLMS();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const existingBoard = whiteboards.find((w) => w.id === assignment?.whiteboardId);

  const [kind, setKind] = useState<"ASSIGNMENT" | "HOMEWORK">("ASSIGNMENT");
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

  // Initialize form state when assignment loads
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
        <div className="py-20 text-center text-slate-500">
          Assignment or Homework not found.
        </div>
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

  const handleQuestionChange = (id: string, field: keyof Question, val: any) => {
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
      setSaveError("Please complete the text for all questions/tasks.");
      return;
    }

    setSaveError("");

    // Update assignment details
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
      headerTitle="Edit Assignment & Homework Tasks"
      headerSubtitle="Modify tasks, instructions, due dates, and whiteboard templates post-submission"
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assignments</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                activeTab === "details"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              Task Details & Questions
            </button>
            <button
              onClick={() => setActiveTab("whiteboard")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
                activeTab === "whiteboard"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Questions Whiteboard Canvas</span>
            </button>
          </div>
        </div>

        {saveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {isSaved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Homework and tasks updated successfully! Redirecting...</span>
          </div>
        )}

        {activeTab === "details" ? (
          <div className="space-y-6">
            {/* Card 1: Core Metadata */}
            <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Basic Info & Due Date
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assignment / Homework Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Calculus Roots & Integration Drill"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  General Instructions & Guidance
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Show working steps on the whiteboard canvas..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Card 2: Question / Task Builder */}
            <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    2. Tasks & Problems ({questions.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add or edit individual tasks and awarded marks for this assignment.
                  </p>
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Problem Task</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">
                        Task #{q.number}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600">
                          Marks:
                        </label>
                        <input
                          type="number"
                          value={q.maxScore}
                          onChange={(e) =>
                            handleQuestionChange(
                              q.id,
                              "maxScore",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-center"
                        />
                        {questions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={q.text}
                      onChange={(e) => handleQuestionChange(q.id, "text", e.target.value)}
                      placeholder="Enter the task prompt or question statement..."
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Action */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.push("/teacher/assignments")}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Assignment & Homework Updates</span>
              </button>
            </div>
          </div>
        ) : (
          /* Whiteboard Tab */
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 px-2">
              <span className="font-semibold">
                Question Board Template: <strong>{existingBoard?.title || assignment.title}</strong>
              </span>
              <span>Use Pen, Images, Shapes & Text to draw question diagrams</span>
            </div>

            <div className="h-[600px] w-full relative">
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
