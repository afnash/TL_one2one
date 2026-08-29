"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  FileBarChart,
  Calendar,
  Clock,
  Star,
  User,
  ArrowRight,
  TrendingUp,
  Download,
} from "lucide-react";

export default function TeacherReportsPage() {
  const { sessionReports } = useLMS();

  return (
    <AppShell
      headerTitle="Academic & Session Reports"
      headerSubtitle="Complete historical logs of 1-to-1 live lessons, student comprehension ratings, and next session plans"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-4">
          {sessionReports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <FileBarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{rep.topicTaught}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                        {rep.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Student: <strong className="text-slate-800">{rep.studentName}</strong> • Educator: <strong>Alex Thomas</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rep.studentPerformanceRating} / 5</span>
                  </span>
                </div>
              </div>

              {/* Time & Duration Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px]">Date</span>
                  <p className="font-bold text-slate-800">{rep.date}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Time Window</span>
                  <p className="font-bold text-slate-800">{rep.startTime} - {rep.endTime}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Calculated Duration</span>
                  <p className="font-bold text-emerald-600">{rep.durationMinutes} minutes</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Assignment Given</span>
                  <p className="font-semibold text-slate-700 truncate">{rep.assignmentGiven || "None"}</p>
                </div>
              </div>

              {/* Topics & Feedback */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Subtopics Covered: </span>
                  <span className="text-slate-600">{rep.topicsCovered.join(" • ")}</span>
                </div>
                <p className="text-slate-600 leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900">Student Evaluation: </strong>
                  {rep.studentPerformanceNotes}
                </p>
                {rep.nextSessionPlan && (
                  <p className="text-slate-600 text-xs">
                    <strong className="text-slate-800">Next Planned Lesson: </strong>
                    {rep.nextSessionPlan}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
