"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Video,
  Play,
  Layers,
  BookOpen,
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  User,
  GraduationCap,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, sessions, assignments, whiteboards, materials, startLiveSession } = useLMS();

  // User details
  const displayName = user.name && user.name !== "Student" ? user.name : "Student";
  const firstName = displayName.split(" ")[0] || "Student";

  // Filter student sessions
  const studentSessions = sessions.filter(
    (s) => s.studentId === user.id || (s.studentIds && s.studentIds.includes(user.id))
  );

  const liveSession = sessions.find((s) => s.status === "LIVE");
  const nextScheduled = studentSessions
    .filter((s) => s.status === "SCHEDULED")
    .sort((a, b) => new Date(`${a.date} ${a.scheduledTime}`).getTime() - new Date(`${b.date} ${b.scheduledTime}`).getTime())[0];

  const upcomingSession = liveSession || nextScheduled;

  const handleJoinSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  const pendingAssignments = assignments;
  const studentWhiteboards = whiteboards.slice(0, 4);

  return (
    <AppShell headerTitle="Student Dashboard" headerSubtitle="Your 1:1 sessions, interactive whiteboards, and assignments">
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Top Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/70">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1:1 Learning Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Here is an overview of your live sessions, visual whiteboards, and assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/student/sessions"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>1:1 Sessions</span>
            </Link>
          </div>
        </div>

        {/* Live Session Notice Banner if teacher has scheduled or started class */}
        {upcomingSession && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className={`w-2 h-2 rounded-full bg-emerald-400 ${upcomingSession.status === "LIVE" ? "animate-ping" : ""}`} />
                <span>{upcomingSession.status === "LIVE" ? "Live Classroom In Session" : "Next Scheduled 1:1 Class"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                {upcomingSession.subject}: {upcomingSession.topic}
              </h2>
              <p className="text-xs text-slate-300">
                Educator: <strong>{upcomingSession.teacherName}</strong> • {upcomingSession.date} at {upcomingSession.scheduledTime} ({upcomingSession.durationMinutes} mins)
              </p>
            </div>
            <button
              onClick={() => handleJoinSession(upcomingSession.id)}
              className="flex items-center gap-2 px-6 py-3 bg-[#43c4d1] hover:brightness-95 text-[#0a2640] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{upcomingSession.status === "LIVE" ? "Enter Live Classroom" : "Start 1:1 Session"}</span>
            </button>
          </div>
        )}

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/student/sessions"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">1:1 Sessions</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{studentSessions.length}</strong>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/student/whiteboards"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Whiteboards</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{whiteboards.length}</strong>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/student/assignments"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{assignments.length}</strong>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                Tasks <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/student/materials"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Materials</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{materials.length}</strong>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                Browse <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Two-Column Primary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Upcoming Sessions & Interactive Whiteboards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming 1:1 Classes Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Upcoming 1:1 Sessions</h2>
                  <p className="text-xs text-slate-500">Your scheduled live interactive classrooms</p>
                </div>
                <Link
                  href="/student/sessions"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {studentSessions.length > 0 ? (
                <div className="space-y-3">
                  {studentSessions.slice(0, 3).map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {sess.subject.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{sess.topic}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-indigo-600">{sess.subject}</span>
                            <span>•</span>
                            <span>{sess.date} at {sess.scheduledTime}</span>
                            <span>•</span>
                            <span>Teacher: {sess.teacherName}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinSession(sess.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all ${
                          sess.status === "LIVE"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{sess.status === "LIVE" ? "Join Now" : "Launch"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No upcoming sessions scheduled. Ask your teacher to schedule a class.
                </div>
              )}
            </div>

            {/* Whiteboard Canvas Access Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Interactive Whiteboards</h2>
                  <p className="text-xs text-slate-500">Live whiteboard notebooks and visual working canvases</p>
                </div>
                <Link
                  href="/student/whiteboards"
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>All Canvases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentWhiteboards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/student/whiteboards?id=${board.id}`}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:shadow-xs bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                          {board.subject || "General"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {board.elements?.length || 0} items
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {board.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Last edited: {board.lastEdited || "Recent"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Homework/Assignments & Student Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Assignments Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Homework & Tasks</h3>
                  <p className="text-[11px] text-slate-500">{pendingAssignments.length} assignments assigned</p>
                </div>
                <Link
                  href="/student/assignments"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                >
                  View
                </Link>
              </div>

              {pendingAssignments.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingAssignments.slice(0, 3).map((a) => (
                    <Link
                      key={a.id}
                      href="/student/assignments"
                      className="block p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                          {a.title}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded shrink-0">
                          {a.questions?.length ? `${a.questions.reduce((sum, q) => sum + (q.maxScore || 0), 0)} pts` : "Task"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>Due: {a.dueDate || "Ongoing"}</span>
                        <span>•</span>
                        <span>{a.subject}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No pending homework assignments.
                </div>
              )}
            </div>

            {/* Study Materials Shortcut Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Study Materials</h3>
                  <p className="text-[11px] text-slate-500">Lesson handouts & worksheets</p>
                </div>
                <Link
                  href="/student/materials"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Browse
                </Link>
              </div>

              <div className="space-y-2">
                {materials.slice(0, 3).map((m) => (
                  <Link
                    key={m.id}
                    href="/student/materials"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 hover:bg-blue-50/50 text-xs group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate group-hover:text-blue-700">
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0 ml-2">
                      {m.subject}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
