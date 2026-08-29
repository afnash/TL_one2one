"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { TrendingUp, Award, Star, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function StudentProgressPage() {
  const { sessionReports, submissions } = useLMS();

  return (
    <AppShell
      headerTitle="Curriculum Progress & Feedback"
      headerSubtitle="Detailed insights into your 1-on-1 concept mastery and session reviews"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Mastery</span>
            <p className="text-3xl font-extrabold text-indigo-600">78%</p>
            <p className="text-xs text-slate-500">Across Mathematics & Physics</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance & Punctuality</span>
            <p className="text-3xl font-extrabold text-emerald-600">96%</p>
            <p className="text-xs text-slate-500">12 total 1-on-1 sessions completed</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Homework Score</span>
            <p className="text-3xl font-extrabold text-purple-600">92%</p>
            <p className="text-xs text-slate-500">3 assignments graded & returned</p>
          </div>
        </div>

        {/* Detailed Concept Mastery */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Topic-Wise Conceptual Mastery</h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Quadratic Equations & Roots (Mathematics)</span>
                <span className="text-emerald-600 font-extrabold">95% (Mastered)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Parabola Graphing & Discriminants (Mathematics)</span>
                <span className="text-indigo-600 font-extrabold">72% (In Progress)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Newton's Laws & Incline Dynamics (Physics)</span>
                <span className="text-sky-600 font-extrabold">64% (In Progress)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: "64%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Feedback Logs */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Teacher Performance Logs & Notes</h3>

          <div className="space-y-3">
            {sessionReports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rep.topicTaught}</span>
                  <span className="text-slate-400">{rep.date} ({rep.durationMinutes} mins)</span>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "{rep.studentPerformanceNotes}"
                </p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Rating: ⭐ {rep.studentPerformanceRating} / 5</span>
                  <span>Next Lesson: <strong>{rep.nextSessionPlan}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
