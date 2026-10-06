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
  FolderOpen, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  KeyRound
} from "lucide-react";

export default function AdminDashboardPage() {
  const { directory, teachers, students, managers, sessions, assignments, submissions, materials } = useLMS();

  const totalTeachers = directory.teachers?.length || teachers.length;
  const totalStudents = directory.students?.length || students.length;
  const totalManagers = directory.managers?.length || managers.length;
  const liveSessions = sessions.filter((s) => s.status === "LIVE");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const unassignedStudents = students.filter((s) => !s.teacherId);
  const unassignedTeachers = teachers.filter((t) => !t.managerId);

  // Past 7 days activity
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const date = d.toISOString().split("T")[0];
    return {
      date,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: sessions.filter((s) => s.date === date && s.status === "COMPLETED").length,
    };
  });
  const maxWeeklyCount = Math.max(1, ...week.map((d) => d.count));
  const subjects = Array.from(new Set(sessions.map((s) => s.subject))).filter(Boolean);

  return (
    <AppShell headerTitle="Super Admin" headerSubtitle="Manage institutional managers, faculty, students, and curriculum">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Quick Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Control Center</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Overview</h1>
            <p className="text-xs text-slate-500">
              Add managers, teachers, students, and manage role-based allocations across the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/credentials"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/80 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>User Credentials</span>
            </Link>

            <Link
              href="/admin/managers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Manager</span>
            </Link>

            <Link
              href="/admin/teachers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Teacher</span>
            </Link>

            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </Link>
          </div>
        </div>

        {/* Primary Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/managers"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Managers</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{totalManagers}</strong>
              <span className="text-xs font-semibold text-purple-600 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/admin/teachers"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Teachers</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{totalTeachers}</strong>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/admin/students"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Students</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</strong>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/admin/sessions"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all"
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
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    {liveSessions.length} Live
                  </span>
                ) : (
                  sessions.length
                )}
              </strong>
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                View <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Attention Alerts / Unassigned Roster Banners */}
        {(unassignedStudents.length > 0 || unassignedTeachers.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unassignedStudents.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-amber-900">
                      {unassignedStudents.length} Students Awaiting Teacher Assignment
                    </h2>
                    <p className="text-[11px] text-amber-700">
                      Assign students to faculty to schedule live sessions.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/students"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
                >
                  Assign
                </Link>
              </div>
            )}

            {unassignedTeachers.length > 0 && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-purple-900">
                      {unassignedTeachers.length} Teachers Without Assigned Manager
                    </h2>
                    <p className="text-[11px] text-purple-700">
                      Assign faculty to departmental managers for team oversight.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/teachers"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
                >
                  Assign
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Charts & Learning Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Completed Classes Bar Graph */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Completed Classes</h2>
                <p className="text-xs text-slate-400">Class activity over the last 7 days</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {completedSessions.length} total
              </span>
            </div>

            <div className="h-44 flex gap-3 items-end pt-4">
              {week.map((d) => (
                <div key={d.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">{d.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 hover:brightness-110"
                    style={{ height: `${Math.max(8, (d.count / maxWeeklyCount) * 120)}px` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Vital Stats */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Academic Delivery</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Total Teaching Time</span>
                </div>
                <strong className="text-sm font-extrabold text-slate-900">
                  {Math.floor(completedSessions.reduce((n, s) => n + (s.actualDurationSeconds || 0), 0) / 3600)} hrs
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Graded Submissions</span>
                </div>
                <strong className="text-sm font-extrabold text-slate-900">
                  {submissions.filter((s) => s.status === "REVIEWED").length} / {submissions.length}
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  <span>Learning Materials</span>
                </div>
                <strong className="text-sm font-extrabold text-slate-900">
                  {materials.length} resources
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Subject Tracks</span>
                </div>
                <strong className="text-sm font-extrabold text-slate-900">
                  {subjects.length} active
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Classes by Subject</h2>
            <span className="text-xs font-semibold text-slate-400">Total subjects: {subjects.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.length > 0 ? (
              subjects.map((name) => {
                const count = sessions.filter((s) => s.subject === name).length;
                return (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800">{name}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {count} {count === 1 ? "class" : "classes"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs py-4 col-span-3 text-center">
                Subject statistics will appear once live sessions are scheduled.
              </p>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
