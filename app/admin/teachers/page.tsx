"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { GraduationCap, Plus, Search, Star, Users, Video, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTeachersPage() {
  const { teachers, addTeacher, updateTeacher } = useLMS();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjects, setSubjects] = useState("Mathematics, Physics");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTeacher({
      name,
      email,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      subjects: subjects.split(",").map((s) => s.trim()),
      rating: 4.9,
      totalStudents: 0,
      status: "active",
    });

    setName("");
    setEmail("");
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: "active" | "away" | "offline") => {
    updateTeacher(id, {
      status: currentStatus === "active" ? "offline" : "active",
    });
  };

  return (
    <AppShell
      headerTitle="Educators Directory"
      headerSubtitle="Manage certified 1-to-1 teachers, review ratings, and assign students"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-700">Total Teachers: {teachers.length}</span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Educator</span>
          </button>
        </div>

        {/* Teachers Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{t.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{t.email}</p>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold rounded-full",
                    t.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {t.status.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {t.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-2.5 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400">Assigned Students</span>
                  <p className="font-bold text-slate-800">{t.totalStudents}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Total 1:1 Sessions</span>
                  <p className="font-bold text-slate-800">{t.totalSessions}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Rating</span>
                  <p className="font-bold text-amber-600">⭐ {t.rating}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Joined: {t.joinedDate}</span>
                <button
                  onClick={() => handleToggleStatus(t.id, t.status)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                >
                  {t.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Teacher Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add New Educator</h3>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Robert Chen"
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
                    placeholder="robert.chen@edulearn.io"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subjects (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
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
                    Add Educator
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
