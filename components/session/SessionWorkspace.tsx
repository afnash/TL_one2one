"use client";

import { useState, type ReactNode } from "react";
import { useLMS } from "@/lib/store";
import { isComputerScience } from "@/lib/coding";
import type { Session } from "@/types";
import { Button } from "@/components/ui/button";
import { CodingWorkspace } from "./CodingWorkspace";

export function SessionWorkspace({ session, children }: { session: Session; children: ReactNode }) {
  const { subjects } = useLMS();
  const [tab, setTab] = useState("whiteboard");
  const cs = isComputerScience(session.subject, subjects);
  return (
    <div className="flex h-full min-h-0 flex-col">
      {cs && (
        <div className="flex shrink-0 gap-1 border-b bg-muted/40 px-3 py-1.5" role="tablist" aria-label="Lesson workspace">
          {[["whiteboard", "Whiteboard"], ["coding", "Live coding"]].map(([value, label]) => (
            <Button key={value} size="sm" role="tab" aria-selected={tab === value} variant={tab === value ? "secondary" : "ghost"} onClick={() => setTab(value)}>
              {label}
            </Button>
          ))}
        </div>
      )}
      <div className={cs && tab === "coding" ? "hidden" : "relative min-h-0 flex-1"}>{children}</div>
      {cs && (
        <div className={tab === "coding" ? "flex h-full min-h-0 flex-1 flex-col" : "hidden"}>
          <CodingWorkspace key={session.id} session={session} />
        </div>
      )}
    </div>
  );
}
