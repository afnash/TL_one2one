"use client";

import React from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { AccountSecurityForm } from "@/components/AccountSecurityForm";
import { PageHeader } from "@/components/dashboard/parts";
import { ProfileCard } from "@/components/settings/ProfileCard";

export default function StudentSettingsPage() {
  const { user, updateStudent } = useLMS();

  return (
    <AppShell headerTitle="Settings">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
        <PageHeader title="Settings" description="Your profile and sign-in details." />
        <ProfileCard
          key={user.id}
          name={user.name}
          roleLabel="Student"
          phone={user.phone}
          onSave={({ name, phone }) => updateStudent(user.id, { name, phone })}
        />
        <AccountSecurityForm key={user.email} email={user.email} />
      </div>
    </AppShell>
  );
}
