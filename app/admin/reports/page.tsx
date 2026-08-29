"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { FileBarChart, Star, TrendingUp } from "lucide-react";

export default function AdminReportsPage() {
  const { sessionReports } = useLMS();

  return (
    <AppShell
      headerTitle="Platform Audit & Reports"
      headerSubtitle="Aggregated educator logs, session ratings, and teaching hours"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-4">
          {sessionReports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{rep.topicTaught}</h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong>{rep.studentName}</strong> • {rep.date} ({rep.durationMinutes} mins)
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rep.studentPerformanceRating} / 5</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl">
                "{rep.studentPerformanceNotes}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
