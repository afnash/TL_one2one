"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  FileCheck,
  Search,
  Filter,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const { assignments, submissions, students } = useLMS();

  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  return (
    <AppShell
      headerTitle="Assignments & Homework"
      headerSubtitle="Create questions on whiteboard, assign to 1-to-1 students, and review submissions"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2">
            {["ALL", "PENDING_REVIEW", "COMPLETED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
                  selectedFilter === tab
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab === "ALL"
                  ? "All Assignments"
                  : tab === "PENDING_REVIEW"
                  ? "Pending Review"
                  : "Completed"}
              </button>
            ))}
          </div>

          <Link
            href="/teacher/assignments/new"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((asg) => {
            const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
            const pendingReviews = asgSubmissions.filter((s) => s.status === "SUBMITTED");

            return (
              <div
                key={asg.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{asg.kind === "HOMEWORK" ? "Homework: " : ""}{asg.title}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                        {asg.subject}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full",
                          asg.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700"
                            : asg.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        )}
                      >
                        {asg.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{asg.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5" /> Due: {asg.dueDate} at {asg.dueTime}
                      </span>
                      <span>•</span>
                      <span>{asg.questions.length} questions on canvas</span>
                      <span>•</span>
                      <span>
                        Target:{" "}
                        <strong className="text-slate-700">
                          {asg.targetType === "BROADCAST"
                            ? "All Students"
                            : `${asg.assignedStudentIds.length} Student(s)`}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Submissions count badge & Edit Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {pendingReviews.length > 0 && (
                      <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl animate-pulse">
                        {pendingReviews.length} To Mark
                      </span>
                    )}
                    <Link
                      href={`/teacher/assignments/${asg.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-colors shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit Tasks & Board</span>
                    </Link>
                  </div>
                </div>

                {/* Submissions Roster */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Student Submissions & Status
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {asgSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{sub.studentName}</p>
                            <p className="text-[10px] text-slate-400">
                              {sub.status === "REVIEWED"
                                ? `Score: ${sub.score}/${sub.maxScore}`
                                : "Awaiting Review"}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/teacher/assignments/${asg.id}/mark/${sub.studentId}`}
                          className={cn(
                            "px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1",
                            sub.status === "REVIEWED"
                              ? "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
                          )}
                        >
                          <span>{sub.status === "REVIEWED" ? "Edit Marks" : "Mark"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}

                    {asgSubmissions.length === 0 && (
                      <div className="text-xs text-slate-400 italic py-1">
                        No submissions yet from assigned students.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
