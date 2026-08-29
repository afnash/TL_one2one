"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Video,
  BookOpen,
  Layers,
  FolderOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, sessions, assignments, submissions, whiteboards, startLiveSession } = useLMS();

  // Find upcoming live session
  const upcomingSession = sessions.find((s) => s.status === "SCHEDULED") || sessions[0];
  const pendingAssignments = assignments.length;
  const reviewedSubmissions = submissions.filter((s) => s.status === "REVIEWED");
  const latestFeedback = reviewedSubmissions[0];

  const handleJoinSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Prominent Upcoming 1-to-1 Live Class Card */}
        {upcomingSession && (
          <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next 1-on-1 Session</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {upcomingSession.subject}: {upcomingSession.topic}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-indigo-400">
                    <img
                      src={upcomingSession.teacherAvatar}
                      alt={upcomingSession.teacherName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>Educator: <strong>{upcomingSession.teacherName}</strong></span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Today at {upcomingSession.scheduledTime} ({upcomingSession.durationMinutes} mins)
                </span>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <button
                onClick={() => handleJoinSession(upcomingSession.id)}
                className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all group"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Join Live Classroom</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Join Live Class */}
          <div
            onClick={() => handleJoinSession("sess-101")}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Join Live Class</h3>
                <p className="text-xs text-slate-500 mt-0.5">1-on-1 with Alex Thomas</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Enter Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: My Assignments */}
          <div
            onClick={() => router.push("/student/assignments")}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Assignments</h3>
                <p className="text-xs text-slate-500 mt-0.5">1 Pending • 1 Due Today</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>View Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: My Whiteboards */}
          <div
            onClick={() => router.push("/student/whiteboards")}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Whiteboards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Math & Physics Scratchpads</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Open Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Study Materials */}
          <div
            onClick={() => router.push("/student/materials")}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Study Materials</h3>
                <p className="text-xs text-slate-500 mt-0.5">Formulas, Notes & Videos</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Browse</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Middle Section: Progress & Latest Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Mastery Progress */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>My Curriculum Mastery</span>
              </h3>
              <Link
                href="/student/progress"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Full report →
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Mathematics (Algebra & Calculus)</span>
                  <span className="text-indigo-600">78%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Physics (Mechanics & Vectors)</span>
                  <span className="text-sky-600">64%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full" style={{ width: "64%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Teacher Feedback Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Latest Teacher Review & Marking</span>
            </h3>

            {latestFeedback ? (
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">{latestFeedback.assignmentTitle}</span>
                  <span className="font-bold text-indigo-700">
                    Score: {latestFeedback.score} / {latestFeedback.maxScore} (92%)
                  </span>
                </div>
                <p className="text-slate-700 italic leading-relaxed">
                  "{latestFeedback.teacherFeedback}"
                </p>
                <div className="pt-2 border-t border-indigo-200/50 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Feedback from Alex Thomas</span>
                  <Link
                    href={`/student/assignments/${latestFeedback.assignmentId}`}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Open Graded Canvas →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400">
                No recent reviewed submissions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
