"use client";

import { SubjectProgress } from "@/components/SubjectProgress";
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
  Play,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, sessions, assignments, submissions, startLiveSession } = useLMS();

  const upcomingSession = sessions.find((s) => s.status === "LIVE") || sessions.find((s) => s.status === "SCHEDULED");
  const reviewedSubmissions = submissions.filter((s) => s.status === "REVIEWED");
  const latestFeedback = reviewedSubmissions[0];

  const handleJoinSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-10 pb-16">
        {/* Prominent Hero Glass Card: Next Live 1-on-1 Class */}
        {upcomingSession && (
          <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-white/10 backdrop-blur-xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next 1-on-1 Live Class</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
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
                  <Clock className="w-3.5 h-3.5" /> {upcomingSession.date} at {upcomingSession.scheduledTime} ({upcomingSession.durationMinutes} mins)
                </span>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <button
                onClick={() => handleJoinSession(upcomingSession.id)}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-indigo-500/40 transition-all group active:scale-95"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Join Live Classroom</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Spacious Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div
            onClick={() => router.push("/student/sessions")}
            className="glass-card-interactive p-6 rounded-3xl cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-xs">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Join Live Class</h3>
                <p className="text-xs text-slate-500 mt-1">{upcomingSession ? `1-on-1 with ${upcomingSession.teacherName}` : "No session scheduled"}</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Enter Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => router.push("/student/assignments")}
            className="glass-card-interactive p-6 rounded-3xl cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">My Homework</h3>
                <p className="text-xs text-slate-500 mt-1">{assignments.length} assigned</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Open Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => router.push("/student/whiteboards")}
            className="glass-card-interactive p-6 rounded-3xl cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Whiteboards</h3>
                <p className="text-xs text-slate-500 mt-1">Math & Physics Boards</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Open Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => router.push("/student/materials")}
            className="glass-card-interactive p-6 rounded-3xl cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Study Materials</h3>
                <p className="text-xs text-slate-500 mt-1">Formula sheets & videos</p>
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Browse Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Middle Section: Progress & Latest Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Progress Glass Card */}
          <div className="glass-card p-7 rounded-3xl space-y-4">
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

            <SubjectProgress />
          </div>

          {/* Feedback Glass Card */}
          <div className="glass-card p-7 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Latest Teacher Marking & Feedback</span>
            </h3>

            {latestFeedback ? (
              <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">{latestFeedback.assignmentTitle}</span>
                  <span className="font-bold text-indigo-700">
                    Score: {latestFeedback.score} / {latestFeedback.maxScore}
                  </span>
                </div>
                <p className="text-slate-700 italic leading-relaxed">
                  "{latestFeedback.teacherFeedback}"
                </p>
                <div className="pt-2 border-t border-indigo-200/50 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Reviewed by your educator</span>
                  <Link
                    href={`/student/assignments/${latestFeedback.assignmentId}`}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Open Graded Canvas →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400">
                No recent reviewed submissions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
