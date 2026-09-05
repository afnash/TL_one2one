"use client";
import { AppShell } from "@/components/layout/AppShell";
import { RosterManager } from "@/components/RosterManager";
export default function Page(){return <AppShell><div className="max-w-6xl mx-auto space-y-5"><h1 className="text-2xl font-bold">Manage students</h1><RosterManager kind="STUDENT"/></div></AppShell>;}
