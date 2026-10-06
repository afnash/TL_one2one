"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useLMS } from "@/lib/store";
import { 
  Building2, 
  GraduationCap, 
  Users, 
  Video, 
  BookOpen, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Calendar,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function ManagerDashboardPage() {
  const { user, directory, sessions, assignments, submissions } = useLMS();

  // Scoped list of teachers and students managed by this manager
  const myTeachers = directory.teachers.filter(
    (t) => t.managerId === user.id || (!t.managerId && user.role === "SUPERADMIN")
  );
  const myTeacherIds = myTeachers.map((t) => t.id);

  const myStudents = directory.students.filter(
    (s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId)
  );
  const myStudentIds = myStudents.map((s) => s.id);

  const mySessions = sessions.filter(
    (s) => myTeacherIds.includes(s.teacherId) || myStudentIds.includes(s.studentId)
  );

  const liveSessions = mySessions.filter((s) => s.status === "LIVE");
  const upcomingSessions = mySessions.filter((s) => s.status === "SCHEDULED");
  const completedSessions = mySessions.filter((s) => s.status === "COMPLETED");

  const unassignedStudentsInScope = myStudents.filter((s) => !s.teacherId);

  return (
    <AppShell headerTitle="Manager Portal" headerSubtitle={`Department oversight and faculty allocation for ${user.name}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Manager Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200/70 text-purple-700 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Department Manager Control Center</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-slate-500">
              Manage your assigned teachers, enroll students, and oversee live classroom delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/manager/teachers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Teacher</span>
            </Link>

            <Link
              href="/manager/students"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add & Assign Student</span>
            </Link>
          </div>
        </div>

        {/* Manager Scope KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/manager/teachers"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Assigned Teachers</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{myTeachers.length}</strong>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/manager/students"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Assigned Students</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{myStudents.length}</strong>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                Assign <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/manager/sessions"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Live & Scheduled</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">
                {liveSessions.length > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {liveSessions.length} Live
                  </span>
                ) : (
                  mySessions.length
                )}
              </strong>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                Track <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Hours</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">
                {Math.floor(completedSessions.reduce((acc, s) => acc + (s.actualDurationSeconds || 0), 0) / 3600)} hrs
              </strong>
              <span className="text-xs font-semibold text-purple-600">
                {completedSessions.length} classes
              </span>
            </div>
          </div>
        </div>

        {/* Unassigned Warning Banner */}
        {unassignedStudentsInScope.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-amber-900">
                  {unassignedStudentsInScope.length} Students Need Teacher Assignment
                </h2>
                <p className="text-[11px] text-amber-700">
                  Assign these students to your department teachers so classes can be scheduled.
                </p>
              </div>
            </div>
            <Link
              href="/manager/students"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
            >
              Assign Now
            </Link>
          </div>
        )}

        {/* Two-Column Grid: Faculty Roster Mapping + Team Live/Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Department Faculty List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Assigned Faculty Team</h2>
                <p className="text-xs text-slate-400">Teachers in your departmental group</p>
              </div>
              <Link
                href="/manager/teachers"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all ({myTeachers.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {myTeachers.length > 0 ? (
                myTeachers.map((teacher) => {
                  const teacherStudents = myStudents.filter((s) => s.teacherId === teacher.id);
                  return (
                    <div key={teacher.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200/60 overflow-hidden shrink-0 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          {teacher.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{teacher.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {teacher.subjects?.join(", ") || "General"} • {teacher.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {teacherStudents.length} {teacherStudents.length === 1 ? "student" : "students"}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${teacher.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No teachers assigned to your group yet. Click &quot;Add Teacher&quot; above to get started.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming & Live Classes in Team */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Live & Upcoming Classes</h2>
                <p className="text-xs text-slate-400">Sessions scheduled by your team</p>
              </div>
              <Link
                href="/manager/sessions"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                All sessions <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {mySessions.filter((s) => s.status === "LIVE" || s.status === "SCHEDULED").length > 0 ? (
                mySessions
                  .filter((s) => s.status === "LIVE" || s.status === "SCHEDULED")
                  .slice(0, 5)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {session.status === "LIVE" ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-extrabold text-[9px] animate-pulse">
                              LIVE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold text-[9px]">
                              {session.scheduledTime || session.time || "Scheduled"}
                            </span>
                          )}
                          <span className="font-bold text-slate-900 truncate">{session.subject}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {session.teacherName} ➔ {session.studentName}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {session.date || "Today"}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active or upcoming classes scheduled in your department.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
