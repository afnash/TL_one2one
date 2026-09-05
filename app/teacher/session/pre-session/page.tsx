"use client";
import { AppShell } from "@/components/layout/AppShell";
import { ScheduleSession } from "@/components/session/ScheduleSession";
import Link from "next/link";
export default function PreSession(){return <AppShell><div className="max-w-4xl mx-auto space-y-5"><h1 className="text-2xl font-bold">Plan a live class</h1><ScheduleSession/><p>Use your meeting link for audio and video. Open the class workspace to teach on the shared board.</p><Link href="/teacher/sessions" className="text-indigo-600">View scheduled classes</Link></div></AppShell>;}
