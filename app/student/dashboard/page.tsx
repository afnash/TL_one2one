"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { SofiaStudentLayout } from "@/components/layout/SofiaStudentLayout";
import { INITIAL_COURSES } from "@/lib/sofia-data";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Video,
  Play,
  Bookmark,
  Layers,
  Sparkles,
  Award,
  X,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentOverviewPage() {
  const router = useRouter();
  const { user, sessions, assignments, startLiveSession } = useLMS();
  const [activeCourseModal, setActiveCourseModal] = useState<string | null>(null);

  // Determine user name
  const displayName = user.name && user.name !== "Student" ? user.name : "Ruvais";
  const firstName = displayName.split(" ")[0] || "Ruvais";

  const upcomingSession =
    sessions.find((s) => s.status === "LIVE") ||
    sessions.find((s) => s.status === "SCHEDULED");

  const handleJoinSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  const selectedCourse = INITIAL_COURSES.find((c) => c.id === activeCourseModal);

  return (
    <SofiaStudentLayout activeTab="overview">
      <div className="space-y-10 pb-16">
        {/* Top Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-[#15803d]">
              Good afternoon, {firstName}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
              Pick up where you left off.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Your assigned courses, progress, and next activity are kept together here.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs self-start">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            <span>5 completed</span>
          </div>
        </div>

        {/* Live Session Notice Banner if teacher has scheduled or started class */}
        {upcomingSession && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>1-on-1 Live Classroom Ready</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {upcomingSession.subject}: {upcomingSession.topic}
              </h2>
              <p className="text-xs text-slate-300">
                Educator: <strong>{upcomingSession.teacherName}</strong> • {upcomingSession.scheduledTime} ({upcomingSession.durationMinutes} mins)
              </p>
            </div>
            <button
              onClick={() => handleJoinSession(upcomingSession.id)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#43c4d1] hover:brightness-95 text-[#0a2640] font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Join Live Classroom</span>
            </button>
          </div>
        )}

        {/* Main Grid: Hero Continue Card + Learning Progress Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Hero Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Green label */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#15803d]">
                <BookOpen className="w-4 h-4" />
                <span>Continue learning</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c1e33] tracking-tight leading-tight">
                Map AI agent value and risk in GraphSpace
              </h2>

              {/* Sub-track */}
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                AI Agents for Managers
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>How Agents Plan, Act, and Improve</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>20 min</span>
                </div>
              </div>
            </div>

            {/* Green Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setActiveCourseModal("course-ai-agents")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all active:scale-95"
              >
                <span>Resume activity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Stats Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-[#0c1e33]">
                  Learning progress
                </h3>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0c1e33]">
                  28%
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Required activities across your courses.
              </p>

              {/* Green Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#15803d] rounded-full transition-all duration-500"
                  style={{ width: "28%" }}
                />
              </div>
            </div>

            {/* Bottom 3-Column Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-left">
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-[#0c1e33]">2</p>
                <p className="text-[11px] font-medium text-slate-500">Courses</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-[#0c1e33]">0</p>
                <p className="text-[11px] font-medium text-slate-500">Points</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-extrabold text-[#0c1e33]">0</p>
                <p className="text-[11px] font-medium text-slate-500">Badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Your Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0c1e33] tracking-tight">
                Your courses
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Continue an active course or start a new one.
              </p>
            </div>

            <Link
              href="/student/courses"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0c1e33] hover:text-[#43c4d1] transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Multivariable Modelling Workshop */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#0c1e33] leading-snug">
                    Multivariable Modelling Workshop
                  </h3>
                  <div className="w-9 h-9 rounded-full bg-[#e0f7fa] text-[#00838f] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  Business Mathematics Skill Path
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>0 activities</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Self-paced</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Course progress</span>
                    <span className="font-semibold text-slate-700">0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#43c4d1] rounded-full w-0" />
                  </div>
                </div>
              </div>

              {/* Cyan Action Button */}
              <button
                onClick={() => setActiveCourseModal("course-multivariable-modelling")}
                className="w-full flex items-center justify-between px-5 py-3 bg-[#43c4d1] hover:brightness-95 text-[#0a2640] font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                <span>Start course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: AI Agents for Managers */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#0c1e33] leading-snug">
                    AI Agents for Managers
                  </h3>
                  <div className="w-9 h-9 rounded-full bg-[#e0f7fa] text-[#00838f] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500">
                  AI for Management
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>18 activities</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>245 min</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Course progress</span>
                    <span className="font-semibold text-slate-700">28%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#15803d] rounded-full transition-all duration-500"
                      style={{ width: "28%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Cyan Action Button */}
              <button
                onClick={() => setActiveCourseModal("course-ai-agents")}
                className="w-full flex items-center justify-between px-5 py-3 bg-[#43c4d1] hover:brightness-95 text-[#0a2640] font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                <span>Continue course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tutoring & Learning Hub Links */}
        <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/student/assignments"
            className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-[#43c4d1] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Homework & Tasks
                </p>
                <p className="text-[11px] text-slate-500">{assignments.length} assigned</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/student/whiteboards"
            className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-[#43c4d1] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                  Whiteboard Canvas
                </p>
                <p className="text-[11px] text-slate-500">Interactive Math & Physics</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/student/opportunities"
            className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-[#43c4d1] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#e0f7fa] text-[#00838f] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#00838f]">
                  Opportunities Hub
                </p>
                <p className="text-[11px] text-slate-500">Explore community roles</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </Link>
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#15803d]">
                  {selectedCourse.track}
                </span>
                <h3 className="text-2xl font-extrabold text-[#0c1e33] mt-1">
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedCourse.description}
            </p>

            {selectedCourse.currentActivity && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803d]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Current Module</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedCourse.currentActivity}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{selectedCourse.currentActivityModule}</span>
                  <span>•</span>
                  <span>{selectedCourse.currentActivityDuration}</span>
                </div>
              </div>
            )}

            {selectedCourse.skills && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Competencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                href="/student/whiteboards"
                onClick={() => setActiveCourseModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#43c4d1] hover:brightness-95 text-[#0a2640] text-xs font-bold transition-colors"
              >
                Open Study Canvas →
              </Link>
            </div>
          </div>
        </div>
      )}
    </SofiaStudentLayout>
  );
}
