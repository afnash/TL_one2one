"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Disclosure that animates its height so the cards below ease down instead of
// jumping. Content stays mounted so the open state keeps its scroll position.
export function ExpandableDetails({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="rounded-xl border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-xl p-4 text-left text-sm font-semibold text-primary transition-colors hover:bg-muted/50"
      >
        <ChevronRight className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-90")} />
        {label}
      </button>
      <div
        id={panelId}
        role="region"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="relative min-h-0 overflow-hidden">
          <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
