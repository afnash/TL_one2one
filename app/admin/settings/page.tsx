"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useLMS } from "@/lib/store";
export default function Settings(){const {connectionError,saving}=useLMS();return <AppShell><section className="max-w-3xl mx-auto bg-white border rounded-2xl p-8 space-y-4"><h1 className="text-2xl font-bold">Workspace settings</h1><p>Storage connection: {connectionError?"Needs attention":saving?"Saving changes":"Connected"}</p><p>Student and teacher access currently uses role and profile selection. Administrators sign in through /manage.</p><p className="text-slate-500 text-sm">Connection settings are configured in the environment. See README.md for database setup and the temporary access model.</p></section></AppShell>;}
