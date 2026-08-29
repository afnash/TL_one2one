"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Video, Calendar, Clock, Play, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentSessionsPage() {
  const router = useRouter();
  const { sessions, startLiveSession } = useLMS();

  const handleJoin = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  return (
    <AppShell
      headerTitle="My 1-on-1 Live Sessions"
      headerSubtitle="Upcoming scheduled classes with your educator and links to past class whiteboards"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="space-y-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={sess.teacherAvatar}
                    alt={sess.teacherName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{sess.topic}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full">
                      {sess.subject}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full",
                        sess.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-indigo-50 text-indigo-700"
                      )}
                    >
                      {sess.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Instructor: <strong>{sess.teacherName}</strong>
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Calendar className="w-3.5 h-3.5" /> {sess.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5" /> {sess.scheduledTime} ({sess.durationMinutes} mins)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {sess.status === "SCHEDULED" ? (
                  <button
                    onClick={() => handleJoin(sess.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Join Class</span>
                  </button>
                ) : (
                  <Link
                    href={`/student/whiteboards?id=${sess.whiteboardId || "wb-live-math-rahul"}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Open Whiteboard</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
