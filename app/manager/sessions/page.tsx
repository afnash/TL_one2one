"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Video, Calendar, Clock, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagerSessionsPage() {
  const { user, sessions, directory } = useLMS();

  const myTeachers = directory.teachers.filter(
    (t) => t.managerId === user.id || (!t.managerId && user.role === "SUPERADMIN")
  );
  const myTeacherIds = myTeachers.map((t) => t.id);

  const myStudents = directory.students.filter(
    (s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId)
  );
  const myStudentIds = myStudents.map((s) => s.id);

  const teamSessions = sessions.filter(
    (s) => myTeacherIds.includes(s.teacherId) || myStudentIds.includes(s.studentId)
  );

  return (
    <AppShell
      headerTitle="Department Sessions"
      headerSubtitle="Real-time monitoring of live classroom sessions across your assigned faculty"
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Classroom Monitoring</h1>
            <p className="text-xs text-slate-500">
              Track 1-to-1 session attendance, durations, and live teaching delivery.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
            {teamSessions.length} total sessions
          </span>
        </div>

        <div className="space-y-3">
          {teamSessions.length > 0 ? (
            teamSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{sess.topic}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                      {sess.subject}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                        sess.status === "LIVE"
                          ? "bg-emerald-500 text-white animate-pulse"
                          : sess.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {sess.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Faculty: <strong className="text-slate-800">{sess.teacherName}</strong> ↔ Student: <strong className="text-slate-800">{sess.studentName}</strong>
                  </p>
                </div>

                <div className="text-xs text-slate-500 text-left md:text-right">
                  <p className="font-semibold text-slate-800">{sess.date} at {sess.scheduledTime || sess.time || "Scheduled"}</p>
                  <p className="text-[11px] text-slate-400">
                    {sess.actualDurationSeconds
                      ? `${Math.round(sess.actualDurationSeconds / 60)} mins taught`
                      : `${sess.durationMinutes || 60} mins scheduled`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No sessions scheduled for your department team yet.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
