"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { FolderOpen, FileText, Video, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentMaterialsPage() {
  const { materials, subjects } = useLMS();
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  const filteredMaterials = materials.filter((m) =>
    selectedSubject === "ALL" ? true : m.subject === selectedSubject
  );

  return (
    <AppShell
      headerTitle="Study Materials & Notes"
      headerSubtitle="Access revision notes, video lectures, and formula sheets assigned by your teacher"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
          <button
            onClick={() => setSelectedSubject("ALL")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
              selectedSubject === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All Resources ({materials.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.name)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
                selectedSubject === sub.name
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    {m.type === "VIDEO" ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                    {m.type} • {m.size}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                  <span className="text-[11px] font-semibold text-indigo-600">{m.subject}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Uploaded: {m.uploadDate}
                </span>

                <button
                  onClick={() => alert(`Downloading "${m.title}"`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
