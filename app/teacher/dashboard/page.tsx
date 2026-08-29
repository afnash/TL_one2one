"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Video,
  BookOpen,
  FolderUp,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Play,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, sessions, students, assignments, submissions, startLiveSession } = useLMS();

  // Upcoming sessions
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");
  const recentCompletedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const handleStartSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/teacher/session/${sessionId}`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* 3 Prominent Quick Action Cards (As per Design Reference) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </h2>
            <span className="text-xs text-slate-400 font-medium">1-to-1 Teaching Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Start Live Session */}
            <div
              onClick={() => handleStartSession("sess-101")}
              className="group relative p-6 bg-gradient-to-br from-indigo-50/90 via-white to-white rounded-2xl border-2 border-indigo-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Start a Live Session
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Teach one-on-one with shared infinite whiteboard and instant video.
                  </p>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between text-xs font-bold text-indigo-600 border-t border-indigo-100/60 mt-4">
                <span>Start Session with Rahul</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Assignments */}
            <div
              onClick={() => router.push("/teacher/assignments/new")}
              className="group relative p-6 bg-gradient-to-br from-emerald-50/80 via-white to-white rounded-2xl border-2 border-emerald-200/80 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Assignments & Homework
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Create questions directly on whiteboard and review student work.
                  </p>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between text-xs font-bold text-emerald-600 border-t border-emerald-100/60 mt-4">
                <span>Create Assignment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Upload Study Materials */}
            <div
              onClick={() => router.push("/teacher/materials")}
              className="group relative p-6 bg-gradient-to-br from-amber-50/80 via-white to-white rounded-2xl border-2 border-amber-200/80 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <FolderUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Upload Study Materials
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Upload notes, formula sheets, video explanations and reference links.
                  </p>
                </div>
              </div>
              <div className="pt-5 flex items-center justify-between text-xs font-bold text-amber-600 border-t border-amber-100/60 mt-4">
                <span>Manage Resources</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Today's Sessions & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's 1-on-1 Sessions (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Today's Sessions</h2>
              </div>
              <Link
                href="/teacher/sessions"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all sessions →
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={sess.studentAvatar}
                        alt={sess.studentName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {sess.studentName}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                          {sess.subject}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {sess.topic}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sess.scheduledTime}
                        </span>
                        <span>•</span>
                        <span>{sess.durationMinutes} mins scheduled</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/teacher/students/${sess.studentId}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      View Student
                    </Link>
                    <button
                      onClick={() => handleStartSession(sess.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs hover:shadow transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Session
                    </button>
                  </div>
                </div>
              ))}

              {upcomingSessions.length === 0 && (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No more live sessions scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Summary Widget (1 Column) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Session Insights
            </h2>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Assigned Students</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{students.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Pending Reviews</p>
                  <p className="text-xl font-extrabold text-indigo-600 mt-1">
                    {submissions.filter((s) => s.status === "SUBMITTED").length}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Avg. 1-on-1 Duration</span>
                  <span className="font-semibold text-slate-800">52 mins</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Completed Sessions</span>
                  <span className="font-semibold text-slate-800">148 total</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Student Satisfaction</span>
                  <span className="font-semibold text-emerald-600">4.95 / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Students Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">My Students</h2>
            </div>
            <Link
              href="/teacher/students"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all {students.length} students →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {students.map((st) => (
              <div
                key={st.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                      <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full">
                      {st.grade}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">{st.name}</h3>
                  <p className="text-xs text-slate-500">{st.subjects.join(" • ")}</p>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Curriculum Progress</span>
                      <span className="font-bold text-slate-900">{st.overallProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${st.overallProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Next Session: <strong className="text-slate-800">{st.nextSessionTime || "Not scheduled"}</strong>
                  </div>
                </div>

                <div className="pt-3 mt-3 flex items-center gap-1.5 border-t border-slate-100">
                  <Link
                    href={`/teacher/students/${st.id}`}
                    className="flex-1 text-center py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                  >
                    Open Student
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Rahul Menon submitted <strong>Quadratic Equations Mastery</strong>
                </p>
                <p className="text-[11px] text-slate-400">Mathematics • 10 mins ago</p>
              </div>
              <Link
                href="/teacher/assignments"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Review →
              </Link>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Session report completed for <strong>Arjun Kumar</strong> (52 mins)
                </p>
                <p className="text-[11px] text-slate-400">Calculus Integration • Yesterday</p>
              </div>
              <Link
                href="/teacher/reports"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View Report →
              </Link>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="p-1.5 rounded-md bg-amber-100 text-amber-700">
                <FolderUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">
                  Uploaded new resource: <strong>Quadratic Functions & Parabola Properties</strong>
                </p>
                <p className="text-[11px] text-slate-400">PDF • 2.4 MB • 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
