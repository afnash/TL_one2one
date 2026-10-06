"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";
import { RoleGate } from "@/components/layout/RoleGate";

export default function AdminManagersPage() {
  return (
    <RoleGate expected="SUPERADMIN">
      <AppShell
        headerTitle="Academic & Branch Managers"
        headerSubtitle="Create and configure managers who oversee teachers and student mappings across branches"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Manage Branch Managers
            </h1>
          </div>
          <RosterManager kind="MANAGER" />
        </div>
      </AppShell>
    </RoleGate>
  );
}
