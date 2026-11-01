"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/parts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLMS } from "@/lib/store";

export default function AdminSettingsPage() {
  const { connectionError, saving } = useLMS();
  const state = connectionError ? "Needs attention" : saving ? "Saving changes" : "Connected";

  return (
    <AppShell headerTitle="Settings">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
        <PageHeader title="Settings" description="Platform status and configuration." />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data connection</CardTitle>
            <CardDescription>{state}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Everyone signs in with an email and password set by an administrator. Administrators sign in at /manage with the username and password from the server environment.</p>
            <p>Connection and secret settings live in .env.local. See the README for database setup.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
