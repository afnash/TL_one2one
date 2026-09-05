"use client";

import { ScheduleSession } from "@/components/session/ScheduleSession";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  Play,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherSessionsPage() {
  const router = useRouter();
  const { sessions, sessionReports, startLiveSession } = useLMS();

  const [activeTab, setActiveTab] = useState<"SCHEDULED" | "COMPLETED" | "ALL">("ALL");

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.status === activeTab;
  });

  const handleStartSession = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/teacher/session/${sessionId}`);
  };

  return (
    <AppShell
      headerTitle="Live Sessions & History"
      headerSubtitle="Manage 1-on-1 scheduled classes and inspect past session duration reports"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <ScheduleSession />
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: "All Sessions" },
              { id: "SCHEDULED", label: "Upcoming (Scheduled)" },
              { id: "COMPLETED", label: "Completed History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>


        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.map((sess) => {
            const report = sessionReports.find((r) => r.sessionId === sess.id);

            return (
              <div
                key={sess.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={sess.studentAvatar}
                      alt={sess.studentName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{sess.studentName}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
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

                    <p className="text-xs font-semibold text-slate-700">{sess.topic}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5" /> {sess.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5" /> {sess.scheduledTime}
                      </span>
                      <span>•</span>
                      <span>
                        Duration:{" "}
                        <strong className="text-slate-700">
                          {sess.actualDurationSeconds
                            ? `${Math.round(sess.actualDurationSeconds / 60)} mins (Actual)`
                            : `${sess.durationMinutes} mins`}
                        </strong>
                      </span>
                    </div>

                    {report && (
                      <p className="text-xs text-slate-600 italic pt-1">
                        Report: "{report.studentPerformanceNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {["SCHEDULED","LIVE"].includes(sess.status) ? (
                    <button
                      onClick={() => handleStartSession(sess.id)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{sess.status === "LIVE" ? "Rejoin classroom" : "Start classroom"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href={sess.whiteboardId ? `/teacher/whiteboards/${sess.whiteboardId}` : "/teacher/whiteboards"}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Saved Board</span>
                      </Link>

                      <Link
                        href={`/teacher/session/${sess.id}/report`}
                        className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Edit Report</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
