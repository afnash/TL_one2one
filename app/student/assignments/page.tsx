"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAssignmentsPage() {
  const { assignments, submissions } = useLMS();

  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "REVIEWED">("ALL");

  return (
    <AppShell
      headerTitle="My Assignments & Homework"
      headerSubtitle="Solve problems on your dedicated whiteboard canvas and view teacher reviews"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          {[
            { id: "ALL", label: "All Tasks" },
            { id: "PENDING", label: "Pending Work" },
            { id: "REVIEWED", label: "Reviewed & Graded" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assignment Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((asg) => {
            const submission = submissions.find((s) => s.assignmentId === asg.id);
            const isReviewed = submission?.status === "REVIEWED";
            const isSubmitted = submission?.status === "SUBMITTED";

            if (activeTab === "PENDING" && (isReviewed || isSubmitted)) return null;
            if (activeTab === "REVIEWED" && !isReviewed) return null;

            return (
              <div
                key={asg.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                      {asg.subject}
                    </span>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 text-[10px] font-bold rounded-full",
                        isReviewed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isSubmitted
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {isReviewed
                        ? `Reviewed: ${submission.score}/${submission.maxScore}`
                        : isSubmitted
                        ? "Submitted (In Review)"
                        : "Pending Work"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Calendar className="w-3.5 h-3.5" /> Due: {asg.dueDate}
                    </span>
                    <span>•</span>
                    <span>{asg.questions.length} questions on canvas</span>
                  </div>

                  {isReviewed && submission?.teacherFeedback && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-emerald-900">Teacher Feedback:</span>
                      <p className="text-emerald-800 italic">"{submission.teacherFeedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Instructor: <strong>{asg.teacherName}</strong>
                  </span>

                  <Link
                    href={`/student/assignments/${asg.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
                  >
                    <span>{isReviewed ? "View Graded Canvas" : isSubmitted ? "View Submission" : "Solve on Whiteboard"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
