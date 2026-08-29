"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { GraduationCap, BookOpen, Shield, ArrowRight, Sparkles, Video, Layers, PenTool, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { role, switchRole } = useLMS();

  const handleLaunch = (selectedRole: "TEACHER" | "STUDENT" | "SUPERADMIN") => {
    switchRole(selectedRole);
    if (selectedRole === "TEACHER") router.push("/teacher/dashboard");
    else if (selectedRole === "STUDENT") router.push("/student/dashboard");
    else router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            1:1
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">OneToOne</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
            LMS Platform
          </span>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero Showcase */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" /> High-Fidelity 1-to-1 Teaching Prototype
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          The ultimate 1-on-1 teaching & learning workspace.
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Experience seamless live teaching with collaborative infinite whiteboards, individual student scratchpads, fast assignment review, and automated post-session duration reports.
        </p>

        {/* 3 Role Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          {/* Teacher Card */}
          <div
            onClick={() => handleLaunch("TEACHER")}
            className="group p-6 bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Teacher Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start live 1-on-1 sessions, teach on infinite whiteboard, inspect individual student boards, create whiteboard assignments & grade submissions.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Launch Alex Thomas (Teacher)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Student Card */}
          <div
            onClick={() => handleLaunch("STUDENT")}
            className="group p-6 bg-white rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Student Space</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Join live 1-on-1 classes, access subject-wise whiteboards (Live, Homework, Practice), solve assignments on personal whiteboard & view feedback.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Launch Rahul Menon (Student)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Superadmin Card */}
          <div
            onClick={() => handleLaunch("SUPERADMIN")}
            className="group p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Superadmin Hub</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage all teachers, students, subjects, active sessions, assignment metrics, cloud storage and platform analytics.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Launch Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Collaborative Infinite Whiteboard</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Automatic Session Timer & Duration Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Multi-Student Board Switching</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200/80 text-center text-xs text-slate-400">
        OneToOne LMS — 1-to-1 Teaching & Learning Architecture. Built with Next.js, TypeScript & Tailwind CSS.
      </footer>
    </div>
  );
}
