"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { AccountSecurityForm } from "@/components/AccountSecurityForm";
import { PageHeader } from "@/components/dashboard/parts";
import { ProfileCard } from "@/components/settings/ProfileCard";

export default function ManagerSettingsPage() {
  const { user, updateManager } = useLMS();

  return (
    <AppShell headerTitle="Settings">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
        <PageHeader title="Settings" description="Your profile and sign-in details." />
        <ProfileCard
          key={user.id}
          name={user.name}
          roleLabel="Manager"
          phone={user.phone}
          onSave={({ name, phone }) => updateManager(user.id, { name, phone })}
        />
        <AccountSecurityForm key={user.email} email={user.email} />
      </div>
    </AppShell>
  );
}
