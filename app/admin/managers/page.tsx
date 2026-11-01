"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";
import { RoleGate } from "@/components/layout/RoleGate";

export default function AdminManagersPage() {
  return (
    <RoleGate expected="SUPERADMIN">
      <AppShell headerTitle="Managers">
        <div className="mx-auto max-w-6xl pb-12">
          <RosterManager kind="MANAGER" title="Managers" description="Managers oversee teachers and students across a branch." />
        </div>
      </AppShell>
    </RoleGate>
  );
}
