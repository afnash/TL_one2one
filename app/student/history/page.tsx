"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { History, FileText, Calendar, Clock, Layers, Star } from "lucide-react";

export default function StudentHistoryPage() {
  const { sessionReports, sessions } = useLMS();

  return (
    <AppShell
      headerTitle="Learning History & Saved Boards"
      headerSubtitle="Complete archive of past 1-on-1 sessions, lesson reports, and interactive whiteboards"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-4">
          {sessionReports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{rep.topicTaught}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                      {rep.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rep.date} • {rep.startTime} - {rep.endTime} ({rep.durationMinutes} mins)
                  </p>
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Evaluation: {rep.studentPerformanceRating} / 5</span>
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <p className="text-slate-700 leading-relaxed italic">
                  "{rep.studentPerformanceNotes}"
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Assignment: <strong>{rep.assignmentGiven || "None"}</strong></span>
                  <span>Next Lesson: <strong>{rep.nextSessionPlan}</strong></span>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/student/whiteboards"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Session Whiteboard</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
