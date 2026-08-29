"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Video, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSessionsPage() {
  const { sessions } = useLMS();

  return (
    <AppShell
      headerTitle="Live Sessions & Class Audit"
      headerSubtitle="Platform-wide monitoring of 1-to-1 live rooms and duration records"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{sess.topic}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                    {sess.subject}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full",
                      sess.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700"
                    )}
                  >
                    {sess.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Teacher: <strong>{sess.teacherName}</strong> ↔ Student: <strong>{sess.studentName}</strong>
                </p>
              </div>

              <div className="text-xs text-slate-500 text-right">
                <p className="font-medium">{sess.date} at {sess.scheduledTime}</p>
                <p className="text-[11px] text-slate-400">Duration: {sess.durationMinutes} mins</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
