"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { Question, WhiteboardElement } from "@/types";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Get tomorrow formatted as YYYY-MM-DD
function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const { user, students, subjects, createAssignment, createWhiteboard, saveWhiteboard } = useLMS();

  const [kind, setKind] = useState<"ASSIGNMENT" | "HOMEWORK">("ASSIGNMENT");
  const [boardElements, setBoardElements] = useState<WhiteboardElement[] | null>(null);
  const [publishError, setPublishError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields with solid smart defaults
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.name || "Mathematics");
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
    if (!subject && subjects.length > 0) {
      setSubject(subjects[0].name);
    }
  }, [subjects, subject]);

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
      subject: subjects[0]?.name || "Mathematics",
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

    const currentSubject = subject || (subjects[0]?.name ?? "Mathematics");
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
      headerTitle="Create New Assignment & Homework"
      headerSubtitle="Set up questions, assign directly to students, and generate an interactive whiteboard canvas"
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Top bar with back and tab switches */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                activeTab === "details"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              1. Assignment Details & Students
            </button>
            <button
              onClick={() => setActiveTab("whiteboard")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all",
                activeTab === "whiteboard"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Whiteboard Questions ({questions.length})</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {publishError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{publishError}</span>
          </div>
        )}

        {/* Tab 1: Assignment Details & Target */}
        {activeTab === "details" && (
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKind("ASSIGNMENT")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      kind === "ASSIGNMENT"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind("HOMEWORK")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      kind === "HOMEWORK"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    Homework
                  </button>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Step 1 of 2 • Basic Information
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quadratic Equations Practice Set"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {subjects.length > 0 ? (
                    subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Overview & Instructions
              </label>
              <textarea
                rows={2}
                placeholder="Give your students any context, hints, or submission expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 leading-relaxed placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Individual vs Multiple vs Broadcast Target Picker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Assign To Students <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select individual students or broadcast to the entire roster
                  </p>
                </div>

                {targetType === "MULTIPLE" && (
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Select All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("INDIVIDUAL");
                    if (selectedStudentIds.length === 0 && students[0]) {
                      setSelectedStudentIds([students[0].id]);
                    }
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left text-xs transition-all",
                    targetType === "INDIVIDUAL"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Individual Student
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Select 1 specific student
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("MULTIPLE")}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left text-xs transition-all",
                    targetType === "MULTIPLE"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Multiple Students
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Custom group selection
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("BROADCAST")}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left text-xs transition-all",
                    targetType === "BROADCAST"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Broadcast to All
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    All students in your roster
                  </p>
                </button>
              </div>

              {/* Student Checklist */}
              {targetType !== "BROADCAST" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {students.length > 0 ? (
                    students.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all",
                            isSelected
                              ? "border-indigo-500 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
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
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <img
                            src={st.avatar || "/icon.jpg"}
                            alt={st.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div className="text-xs">
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[10px] text-slate-500">{st.grade || "Student"}</p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
                      No active students found in your roster. The assignment will be available to all registered students upon publishing.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Publishing..." : "Publish Assignment Now"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("whiteboard")}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Next: Customize Whiteboard Questions</span>
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Whiteboard Question Builder */}
        {activeTab === "whiteboard" && (
          <div className="space-y-6">
            {/* Questions List Editor */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Questions List ({questions.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Each question will be rendered as an interactive problem card on the student's canvas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {q.number}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                        placeholder={`Question ${q.number}: Enter problem statement (e.g., Solve 2x + 5 = 15)`}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={q.maxScore}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { maxScore: parseInt(e.target.value, 10) || 1 })
                          }
                          className="w-14 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                        />
                        <span className="text-slate-400 font-semibold text-[11px]">pts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Canvas Preview */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Whiteboard Canvas Preview</h3>
                  <p className="text-[11px] text-slate-400">
                    Students will see this layout and solve directly on their interactive whiteboard
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? "Publishing..." : "Publish Assignment"}</span>
                </button>
              </div>

              <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                <WhiteboardCanvas
                  onSave={(elements) => setBoardElements(elements)}
                  initialWhiteboard={{
                    id: "wb-new-asg-preview",
                    title: `${title || "New Assignment"} (Question Canvas)`,
                    subject: subject || "Mathematics",
                    category: "ASSIGNMENT_QUESTION",
                    lastEdited: new Date().toISOString(),
                    elements: boardElements || generateWhiteboardElements(),
                  }}
                  showTeacherTools={true}
                  roleLabel="Teacher"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
