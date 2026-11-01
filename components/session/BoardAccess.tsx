"use client";

import { useLMS } from "@/lib/store";
import { Hand, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeResourceUrl } from "@/lib/supabase";

export function BoardAccess({ sessionId }: { sessionId: string }) {
  const { user, role, sessions, students, updateSession } = useLMS();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const ids = session.studentIds || [session.studentId];
  const raised = session.raisedHands || [];
  const writers = session.writerIds || [];
  const meetingLink = safeResourceUrl(session.meetingLink || "");
  const handRaised = raised.includes(user.id);

  return (
    <div className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b bg-muted/40 px-3 py-1.5 text-xs">
      {meetingLink && (
        <Button size="xs" asChild>
          <a href={meetingLink} target="_blank" rel="noopener noreferrer">
            <Video data-icon="inline-start" />
            Open video meeting
          </a>
        </Button>
      )}

      {role === "STUDENT" ? (
        <>
          <Button
            size="xs"
            variant={handRaised ? "secondary" : "outline"}
            disabled={session.status !== "LIVE"}
            onClick={() =>
              updateSession(session.id, {
                raisedHands: handRaised ? raised.filter((id) => id !== user.id) : [...raised, user.id],
              })
            }
          >
            <Hand data-icon="inline-start" />
            {handRaised ? "Lower hand" : "Raise hand to write"}
          </Button>
          <span className="text-muted-foreground">
            {ids.length === 1 || writers.includes(user.id)
              ? "Writing enabled"
              : "View only. Ask the teacher for writing access."}
          </span>
        </>
      ) : (
        ids.map((id) => {
          const st = students.find((s) => s.id === id);
          const isRaised = raised.includes(id);
          const canWrite = writers.includes(id);
          return (
            <div key={id} className="flex items-center gap-2 rounded-lg border bg-card py-0.5 pr-0.5 pl-2.5">
              <span className="font-medium text-foreground">
                {st?.name || "Student"}
                {isRaised && <Hand className="ml-1 inline size-3 text-amber-500" aria-label="Hand raised" />}
              </span>
              <Button
                size="xs"
                variant={canWrite ? "destructive" : "secondary"}
                onClick={() =>
                  updateSession(session.id, {
                    writerIds: canWrite ? writers.filter((w) => w !== id) : [...writers, id],
                    raisedHands: raised.filter((w) => w !== id),
                  })
                }
              >
                {canWrite ? "Revoke writing" : "Allow writing"}
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}
