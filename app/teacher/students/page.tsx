"use client";

import { RosterManager } from "@/components/RosterManager";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Search,
  Plus,
  Video,
  BookOpen,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherStudentsPage() {
  const router = useRouter();
  const { students, subjects, startLiveSession } = useLMS();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "ALL" || s.subjects.includes(selectedSubject);
    const matchesStatus =
      selectedStatus === "ALL" || s.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleStartQuickSession = (studentId: string) => {
    router.push("/teacher/sessions");
  };

  return (
    <AppShell
      headerTitle="Student Directory"
      headerSubtitle="Manage individual student profiles, curriculum progress, and personalized whiteboards"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <RosterManager kind="STUDENT" />
        {/* Top Control Bar: Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Subject & Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Grade & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teacher/students/${st.id}`}
                          className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors"
                        >
                          {st.name}
                        </Link>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full",
                            st.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {st.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {st.grade} • {st.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {st.attendanceRate}% Attendance
                  </span>
                </div>

                {/* Subjects Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {st.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Overall Mastery Progress</span>
                    <span className="text-indigo-600 font-bold">{st.overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${st.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Session & Assignment info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>
                    <span>Last Session:</span>{" "}
                    <strong className="text-slate-800 font-semibold">{st.lastSessionDate || "None"}</strong>
                  </div>
                  <div>
                    <span>Next Session:</span>{" "}
                    <strong className="text-slate-800 font-semibold">{st.nextSessionTime || "TBD"}</strong>
                  </div>
                </div>

                {st.notes && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    "{st.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/teacher/students/${st.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <span>Deep Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/teacher/assignments/new`)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    title="Assign Work"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/teacher/whiteboards`)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    title="Open Whiteboards"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartQuickSession(st.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Live 1:1</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No students match your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
