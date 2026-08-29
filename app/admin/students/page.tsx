"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Users, Plus, Search, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminStudentsPage() {
  const { students, addStudent, updateStudent } = useLMS();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("Grade 11");
  const [subjects, setSubjects] = useState("Mathematics, Physics");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStudent({
      name,
      email,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      grade,
      subjects: subjects.split(",").map((s) => s.trim()),
      teacherId: "t1",
      teacherName: "Alex Thomas",
      overallProgress: 50,
      attendanceRate: 100,
      pendingAssignmentsCount: 0,
      status: "active",
    });

    setName("");
    setEmail("");
    setIsAddModalOpen(false);
  };

  return (
    <AppShell
      headerTitle="Student Roster Management"
      headerSubtitle="Platform-wide learner accounts and assigned 1-to-1 educators"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-700">Total Enrolled: {students.length} students</span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((s) => (
            <div
              key={s.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.grade} • {s.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full">
                  {s.status.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-600">
                Assigned 1:1 Teacher: <strong className="text-slate-900">{s.teacherName}</strong>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span>Progress: <strong className="text-indigo-600">{s.overallProgress}%</strong></span>
                <span>Attendance: <strong className="text-emerald-600">{s.attendanceRate}%</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Student Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Enroll New Student</h3>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya.patel@student.io"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
