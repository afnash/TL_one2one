"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewAssignmentPage() {
  const router = useRouter();
  const { students, subjects, createAssignment } = useLMS();

  // Form Fields
  const [title, setTitle] = useState("Quadratic Equations & Parabola Applications");
  const [subject, setSubject] = useState("Mathematics");
  const [description, setDescription] = useState(
    "Solve factorisation, quadratic formula derivations, and determine coordinates of projectile vertices."
  );
  const [dueDate, setDueDate] = useState("2026-09-02");
  const [dueTime, setDueTime] = useState("11:59 PM");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [instructions, setInstructions] = useState(
    "Show full intermediate steps on the whiteboard canvas. Clearly state values of a, b, and c."
  );

  // Target Student Selection
  const [targetType, setTargetType] = useState<"INDIVIDUAL" | "MULTIPLE" | "BROADCAST">("MULTIPLE");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(["s1", "s2"]);

  // Questions Builder
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q-1",
      number: 1,
      text: "Solve by factorisation: 2x² - 8x + 6 = 0",
      maxScore: 4,
      subject: "Mathematics",
    },
    {
      id: "q-2",
      number: 2,
      text: "Find the discriminant of x² + 4x + 5 = 0 and describe the nature of roots.",
      maxScore: 3,
      subject: "Mathematics",
    },
    {
      id: "q-3",
      number: 3,
      text: "A projectile's height is h(t) = -5t² + 20t + 25. Find the maximum height and the time it hits the ground.",
      maxScore: 5,
      subject: "Mathematics",
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
        text: `📝 Assignment: ${title} (${subject})`,
        strokeColor: "#1e293b",
        strokeWidth: 2,
        fontSize: 22,
      },
    ];

    let currentY = 110;
    questions.forEach((q, idx) => {
      elements.push({
        id: `q-card-${q.id}`,
        type: "question_card",
        x: 60,
        y: currentY,
        questionNumber: q.number,
        questionText: `${q.text}  [${q.maxScore} marks]`,
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
      text: `Solve problem #${nextNum}: `,
      maxScore: 4,
      subject,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
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

  const handlePublish = () => {
    createAssignment({
      title,
      subject,
      teacherId: "t1",
      teacherName: "Alex Thomas",
      description,
      dueDate,
      dueTime,
      difficulty,
      instructions,
      targetType,
      assignedStudentIds: targetType === "BROADCAST" ? students.map((s) => s.id) : selectedStudentIds,
      questions,
      whiteboardId: `wb-asg-${Date.now()}`,
    });

    router.push("/teacher/assignments");
  };

  return (
    <AppShell
      headerTitle="Create New Assignment"
      headerSubtitle="Set up questions directly on the infinite whiteboard canvas"
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Navigation / Switcher Tabs */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                activeTab === "details"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              1. Assignment Details & Target
            </button>
            <button
              onClick={() => setActiveTab("whiteboard")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                activeTab === "whiteboard"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Whiteboard Question Builder ({questions.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Assignment Details & Target */}
        {activeTab === "details" && (
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Overview & Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Due Time
                </label>
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Individual vs Multiple vs Broadcast Target Picker */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assign To Students
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("INDIVIDUAL")}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all",
                    targetType === "INDIVIDUAL"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold">Individual Student</p>
                  <p className="text-[11px] text-slate-500 font-normal">Select 1 student</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("MULTIPLE")}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all",
                    targetType === "MULTIPLE"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold">Multiple Students</p>
                  <p className="text-[11px] text-slate-500 font-normal">Custom selection</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("BROADCAST")}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all",
                    targetType === "BROADCAST"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-2xs"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <p className="font-bold">Broadcast to All</p>
                  <p className="text-[11px] text-slate-500 font-normal">All assigned students</p>
                </button>
              </div>

              {/* Student Checklist */}
              {targetType !== "BROADCAST" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {students.map((st) => (
                    <label
                      key={st.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        selectedStudentIds.includes(st.id)
                          ? "border-indigo-500 bg-indigo-50/40"
                          : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <input
                        type={targetType === "INDIVIDUAL" ? "radio" : "checkbox"}
                        name="student-target"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={() => {
                          if (targetType === "INDIVIDUAL") setSelectedStudentIds([st.id]);
                          else handleToggleStudent(st.id);
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-400">{st.grade}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("whiteboard")}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Next: Setup Questions on Whiteboard</span>
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Whiteboard Question Builder */}
        {activeTab === "whiteboard" && (
          <div className="space-y-6">
            {/* Questions List Editor */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Questions List ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                        placeholder="Type mathematical question or problem statement..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={q.maxScore}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { maxScore: parseInt(e.target.value, 10) || 1 })
                          }
                          className="w-12 px-2 py-1 text-xs bg-white border border-slate-200 rounded text-center font-bold text-slate-900"
                        />
                        <span className="text-slate-400 font-semibold text-[11px]">pts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Canvas Preview */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Whiteboard Canvas Preview</h3>
                  <p className="text-[11px] text-slate-400">
                    Questions are dynamically rendered as cards on the student's personal assignment canvas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Assignment to Students</span>
                </button>
              </div>

              <div className="h-[480px] w-full rounded-xl overflow-hidden border border-slate-200">
                <WhiteboardCanvas
                  initialWhiteboard={{
                    id: "wb-new-asg-preview",
                    title: `${title} (Question Canvas)`,
                    subject,
                    category: "ASSIGNMENT_QUESTION",
                    lastEdited: new Date().toISOString(),
                    elements: generateWhiteboardElements(),
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
