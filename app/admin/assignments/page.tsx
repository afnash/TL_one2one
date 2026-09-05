"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { BookOpen, Calendar, Users } from "lucide-react";

export default function AdminAssignmentsPage() {
  const { assignments, submissions, deleteAssignment } = useLMS();

  return (
    <AppShell
      headerTitle="Assignment Activity"
      headerSubtitle="Platform-wide homework assignments and review completion metrics"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-4">
          {assignments.map((asg) => {
            const subs = submissions.filter((s) => s.assignmentId === asg.id);
            return (
              <div
                key={asg.id}
                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{asg.title}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                        {asg.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Created by Educator: <strong>{asg.teacherName}</strong> • Due: {asg.dueDate}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-xl text-slate-700">
                    {subs.length} Submissions <button onClick={()=>{if(confirm("Remove this assignment from the dashboard?"))deleteAssignment(asg.id);}} className="ml-3 text-red-600">Remove</button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
