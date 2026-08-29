"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Video,
  BookOpen,
  Layers,
  Calendar,
  Clock,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeacherStudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const router = useRouter();

  const {
    students,
    whiteboards,
    assignments,
    submissions,
    materials,
    sessions,
    sessionReports,
    startLiveSession,
  } = useLMS();

  const student = students.find((s) => s.id === studentId) || students[0];

  const [activeTab, setActiveTab] = useState<
    "overview" | "whiteboards" | "assignments" | "materials" | "sessions" | "progress"
  >("overview");

  // Filter student-specific items
  const studentWhiteboards = whiteboards.filter((w) => w.studentId === student.id);
  const studentSubmissions = submissions.filter((s) => s.studentId === student.id);
  const studentSessions = sessions.filter((s) => s.studentId === student.id);
  const studentReports = sessionReports.filter((r) => r.studentId === student.id);

  const handleStartSession = () => {
    const sessId = `sess-${Date.now()}`;
    startLiveSession(sessId);
    router.push(`/teacher/session/${sessId}`);
  };

  return (
    <AppShell
      headerTitle={student.name}
      headerSubtitle={`${student.grade} • 1-on-1 Academic Profile`}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Student Profile Header Card */}
        <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-xs">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900">
                    {student.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {student.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {student.grade} • {student.email} • Assigned Educator: <strong>Alex Thomas</strong>
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {student.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleStartSession}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Start Live Session</span>
              </button>

              <button
                onClick={() => router.push("/teacher/assignments/new")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Assign Work</span>
              </button>

              <button
                onClick={() => router.push("/teacher/whiteboards")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open Boards</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Curriculum Progress</span>
              <p className="text-xl font-black text-indigo-600 mt-0.5">{student.overallProgress}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Attendance Rate</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{student.attendanceRate}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Completed Sessions</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{studentSessions.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Pending Homework</span>
              <p className="text-xl font-black text-amber-600 mt-0.5">{student.pendingAssignmentsCount}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "whiteboards", label: `Whiteboards (${studentWhiteboards.length})` },
            { id: "assignments", label: `Assignments (${studentSubmissions.length})` },
            { id: "materials", label: "Materials" },
            { id: "sessions", label: `Sessions (${studentSessions.length})` },
            { id: "progress", label: "Mastery Progress" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Teacher Notes */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Educator Observations & Plan
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {student.notes || "Consistently active during live whiteboard sessions. Solid foundational algebra algebra."}
                </p>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-indigo-900">Next Milestone:</span>
                  <p className="text-indigo-700">Master quadratic formula roots and parabolic trajectory word problems.</p>
                </div>
              </div>

              {/* Subject Performance Breakdown */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Subject Progress Breakdown
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Mathematics</span>
                      <span className="text-indigo-600 font-bold">78%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Physics</span>
                      <span className="text-sky-600 font-bold">64%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full" style={{ width: "64%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports Timeline */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent 1-to-1 Session Reports
              </h3>
              <div className="space-y-3">
                {studentReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rep.topicTaught}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded">
                          {rep.subject}
                        </span>
                      </div>
                      <span className="text-slate-400 font-medium">{rep.date} ({rep.durationMinutes} mins)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rep.studentPerformanceNotes}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>Rating: ⭐ {rep.studentPerformanceRating}/5</span>
                      <span>Next: <strong>{rep.nextSessionPlan}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Whiteboards */}
        {activeTab === "whiteboards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentWhiteboards.map((b) => (
              <div
                key={b.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                      {b.category.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-slate-400">{b.elements.length} items</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                  <p className="text-xs text-slate-500">{b.subject}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Edited: {new Date(b.lastEdited).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/teacher/whiteboards?id=${b.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Open Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {studentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{sub.assignmentTitle}</h4>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                        sub.status === "REVIEWED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {sub.subject} • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                  {sub.score !== undefined && (
                    <p className="text-xs font-bold text-indigo-600">
                      Score: {sub.score} / {sub.maxScore} ({Math.round((sub.score / sub.maxScore) * 100)}%)
                    </p>
                  )}
                </div>

                <Link
                  href={`/teacher/assignments/${sub.assignmentId}/mark/${student.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors"
                >
                  <span>Review & Mark Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Materials */}
        {activeTab === "materials" && (
          <div className="space-y-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {m.subject} • {m.type} • {m.size}
                  </p>
                </div>
                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Sessions */}
        {activeTab === "sessions" && (
          <div className="space-y-3">
            {studentSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{sess.topic}</h4>
                  <p className="text-[11px] text-slate-400">
                    {sess.subject} • {sess.date} ({sess.durationMinutes} mins)
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                  {sess.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Progress */}
        {activeTab === "progress" && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Curriculum Mastery Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Quadratic Equations & Roots</span>
                  <span className="font-bold text-emerald-600">95% (Mastered)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Parabola Transformations & Graphing</span>
                  <span className="font-bold text-indigo-600">70% (In Progress)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Kinematics & Vector Equations (Physics)</span>
                  <span className="font-bold text-amber-600">62% (Needs Reinforcement)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "62%" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
