"use client";

import React from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  GraduationCap,
  Video,
  BookOpen,
  FolderOpen,
  TrendingUp,
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { teachers, students, sessions, assignments, materials } = useLMS();

  return (
    <AppShell
      headerTitle="Superadmin Dashboard"
      headerSubtitle="Platform-wide 1-to-1 education analytics, user management, and system metrics"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Teachers</span>
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{teachers.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">100% active roster</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Students</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{students.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">1:1 paired</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Live Classes</span>
              <Video className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{sessions.length}</p>
            <p className="text-[11px] text-indigo-600 font-semibold">1-on-1 sessions</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{assignments.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Active homework</p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Cloud Storage</span>
              <HardDrive className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">54.2 MB</p>
            <p className="text-[11px] text-slate-500 font-medium">{materials.length} resources</p>
          </div>
        </div>

        {/* Charts & Activity Representation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sessions & Engagement Trends */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>1-on-1 Teaching Volume (Weekly)</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">Past 7 days</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {[
                { day: "Mon", sessions: 4, height: "60%" },
                { day: "Tue", sessions: 6, height: "85%" },
                { day: "Wed", sessions: 3, height: "45%" },
                { day: "Thu", sessions: 5, height: "70%" },
                { day: "Fri", sessions: 7, height: "100%" },
                { day: "Sat", sessions: 4, height: "60%" },
                { day: "Sun", sessions: 2, height: "30%" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-indigo-600">{bar.sessions}</span>
                  <div
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-lg transition-all"
                    style={{ height: bar.height }}
                  />
                  <span className="text-[11px] font-medium text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Active Subject Distribution</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Mathematics</span>
                  <span className="text-indigo-600">45%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Physics</span>
                  <span className="text-sky-600">30%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Chemistry & Computer Science</span>
                  <span className="text-purple-600">25%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/teachers"
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Manage Teachers</h4>
              <p className="text-xs text-slate-500 mt-0.5">{teachers.length} active instructors</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </Link>

          <Link
            href="/admin/students"
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-emerald-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Manage Students</h4>
              <p className="text-xs text-slate-500 mt-0.5">{students.length} enrolled learners</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </Link>

          <Link
            href="/admin/subjects"
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-purple-400 hover:shadow-sm transition-all flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Curriculum & Subjects</h4>
              <p className="text-xs text-slate-500 mt-0.5">4 active core disciplines</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
