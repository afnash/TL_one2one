"use client";

import { useLMS } from "@/lib/store";
import { Hand, Video, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

export function BoardAccess({ sessionId }: { sessionId: string }) {
  const { user, role, sessions, students, updateSession } = useLMS();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const ids = session.studentIds || [session.studentId];
  const raised = session.raisedHands || [];
  const writers = session.writerIds || [];

  // If 1-to-1 session without raised hands or meeting link, we can keep it minimal
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1 bg-slate-900/95 border-b border-white/10 text-white text-xs shrink-0 z-20">
      <div className="flex items-center gap-2 flex-wrap">
        {session.meetingLink && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Video className="w-3 h-3" />
            <span>Open video meeting</span>
          </a>
        )}

        {role === "STUDENT" ? (
          <div className="flex items-center gap-2">
            <button
              disabled={session.status !== "LIVE"}
              onClick={() =>
                updateSession(session.id, {
                  raisedHands: raised.includes(user.id)
                    ? raised.filter((id) => id !== user.id)
                    : [...raised, user.id],
                })
              }
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors",
                raised.includes(user.id)
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30"
                  : "bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700"
              )}
            >
              <Hand className="w-3 h-3" />
              <span>{raised.includes(user.id) ? "Lower hand" : "Raise hand to write"}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              {ids.length === 1 || writers.includes(user.id)
                ? "Writing enabled"
                : "View mode • ask teacher for writing access"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {ids.map((id) => {
              const st = students.find((s) => s.id === id);
              const isRaised = raised.includes(id);
              const canWrite = writers.includes(id);
              return (
                <div key={id} className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/10">
                  <span className="text-[11px] font-medium text-slate-200">
                    {st?.name || "Student"}
                    {isRaised && <span className="text-amber-400 font-bold ml-1">✋</span>}
                  </span>
                  <button
                    onClick={() =>
                      updateSession(session.id, {
                        writerIds: canWrite
                          ? writers.filter((w) => w !== id)
                          : [...writers, id],
                        raisedHands: raised.filter((w) => w !== id),
                      })
                    }
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                      canWrite
                        ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    )}
                  >
                    {canWrite ? "Revoke" : "Allow"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Live 1:1 Class Session</span>
      </div>
    </div>
  );
}
