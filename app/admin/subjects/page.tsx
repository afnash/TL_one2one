"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { BookMarked, Plus, Layers, CheckCircle2 } from "lucide-react";

export default function AdminSubjectsPage() {
  const { subjects } = useLMS();

  return (
    <AppShell
      headerTitle="Curriculum & Subjects"
      headerSubtitle="Define subjects, active learning tracks, and core topic modules"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{sub.name}</h3>
                    <p className="text-xs text-slate-500">{sub.studentCount} active learners</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600">{sub.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Core Topics ({sub.topics.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sub.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
