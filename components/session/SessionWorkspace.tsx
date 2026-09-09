"use client";

import { useState, type ReactNode } from "react";
import { useLMS } from "@/lib/store";
import { isComputerScience } from "@/lib/coding";
import type { Session } from "@/types";
import { CodingWorkspace } from "./CodingWorkspace";

export function SessionWorkspace({ session, children }: { session: Session; children: ReactNode }) {
  const { subjects } = useLMS();
  const [tab, setTab] = useState("whiteboard");
  const cs = isComputerScience(session.subject, subjects);
  return <div className="flex h-full min-h-0 flex-col">
    {cs && <div className="flex shrink-0 gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2" aria-label="Class workspace">
      {[["whiteboard", "Whiteboard"], ["coding", "Live coding"]].map(([value, label]) => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}>{label}</button>)}
    </div>}
    <div className={`${cs && tab === "coding" ? "hidden" : "flex-1 min-h-0 relative"}`}>{children}</div>
    {cs && <div className={tab === "coding" ? "flex-1 min-h-0" : "hidden"}><CodingWorkspace key={session.id} session={session} /></div>}
  </div>;
}
