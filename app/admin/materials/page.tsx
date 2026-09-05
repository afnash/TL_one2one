"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { FolderOpen, FileText, Video, HardDrive } from "lucide-react";

export default function AdminMaterialsPage() {
  const { materials, deleteStudyMaterial } = useLMS();

  return (
    <AppShell
      headerTitle="Storage & Cloud Assets"
      headerSubtitle="Resource repository management and distribution"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Platform Storage Allocation</h3>
              <p className="text-xs text-slate-500">{(materials.reduce((n,m)=>n+(m.sizeBytes||0),0)/1048576).toFixed(2)} MB uploaded</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div
              key={m.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  {m.type === "VIDEO" ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                  {m.size}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                <p className="text-xs text-indigo-600 font-semibold">{m.subject}</p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p><div className="flex gap-4 text-sm text-indigo-600"><a href={m.url} target="_blank" rel="noreferrer">Open resource</a><button onClick={()=>{if(confirm("Remove this resource from the library?"))deleteStudyMaterial(m.id);}}>Remove</button></div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
