"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Copy, Plus, LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/dashboard/parts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { useLMS } from "@/lib/store";
import { conferenceRPC, formatConferenceCode, hostStorageKey, normalizeConferenceCode, type Conference } from "@/lib/conference";
import type { WhiteboardElement } from "@/types";
import { ConferenceVideo } from "./ConferenceVideo";

export function ConferencePage() {
  const { user, role } = useLMS();
  const [room, setRoom] = useState<Conference | null>(null);
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCode(localStorage.getItem(`onetoone_last_conference_${user.id}`) || "");
  }, [user.id]);
  const enter = (conference: Conference, credential: string) => {
    localStorage.setItem(`onetoone_last_conference_${user.id}`, conference.code);
    setToken(credential); setRoom(conference);
  };
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || role !== "TEACHER" || !user.id) return;
    setBusy(true); setError("");
    try {
      const credential = crypto.randomUUID();
      // Check storage before creating a room whose host credential must survive reloads.
      localStorage.setItem(`onetoone_pending_conference_${user.id}`, credential);
      const conference = await conferenceRPC<Conference>("create", { p_teacher_id: user.id, p_title: title.trim(), p_host_token: credential });
      localStorage.setItem(hostStorageKey(user.id, conference.code), credential);
      enter(conference, credential);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create conference."); }
    finally { setBusy(false); }
  };
  const join = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const normalized = normalizeConferenceCode(code);
    if (!/^[A-F0-9]{16}$/.test(normalized)) { setError("Enter the 16-character code shared by your host."); return; }
    setBusy(true); setError("");
    try {
      const conference = await conferenceRPC<Conference>("read", { p_code: normalized });
      if (conference.status !== "LIVE") throw new Error("This conference has ended. Ask the host for a new code.");
      const credential = conference.hostId === user.id && role === "TEACHER" ? localStorage.getItem(hostStorageKey(user.id, normalized)) || "" : "";
      enter(conference, credential);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to join conference."); }
    finally { setBusy(false); }
  };
  return <AppShell headerTitle="Conference" headerSubtitle="Group video meetings with a host-led live whiteboard">
    {room ? <ConferenceRoom key={room.code} initialRoom={room} hostToken={token} onLeave={() => setRoom(null)} /> :
      <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
        <PageHeader title="Conference" description="Share a code to bring several people into one video call. The host teaches on the whiteboard while everyone watches live." />
        <div className="grid gap-5 md:grid-cols-2">
          {role === "TEACHER" && (
            <Section title="Host a conference">
              <form onSubmit={create} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="conf-title">Meeting title</Label>
                  <Input id="conf-title" required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Revision workshop" />
                </div>
                <Button disabled={busy || !title.trim()} className="self-start"><Plus data-icon="inline-start" />{busy ? "Please wait…" : "Create conference"}</Button>
                <p className="text-xs text-muted-foreground">Your host controls stay in this browser. Keep the room code to rejoin.</p>
              </form>
            </Section>
          )}
          <Section title="Join a conference">
            <form onSubmit={join} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="conf-code">Conference code</Label>
                <Input id="conf-code" required maxLength={40} value={code} onChange={event => setCode(event.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" autoCapitalize="characters" spellCheck={false} className="font-mono uppercase" />
              </div>
              <Button type="submit" variant={role === "TEACHER" ? "outline" : "default"} disabled={busy || !code.trim()} className="self-start">{busy ? "Please wait…" : "Join conference"}</Button>
              <p className="text-xs text-muted-foreground">Teachers and students can join with the same code. Only the host can edit the board.</p>
            </form>
          </Section>
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      </div>}
  </AppShell>;
}

function ConferenceRoom({ initialRoom, hostToken, onLeave }: { initialRoom: Conference; hostToken: string; onLeave: () => void }) {
  const { user, role } = useLMS();
  const [room, setRoom] = useState(initialRoom);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const revision = useRef(initialRoom.revision);
  const pending = useRef(0);
  const generation = useRef(0);
  const failed = useRef(false);
  const queue = useRef(Promise.resolve());
  const mounted = useRef(true);
  const isHost = !!hostToken && user.id === room.hostId && role === "TEACHER";
  useEffect(() => {
    mounted.current = true;
    let active = true;
    let fetching = false;
    const refresh = async () => {
      if (pending.current || failed.current || fetching) return;
      fetching = true;
      const version = generation.current;
      try {
        const next = await conferenceRPC<Conference>("read", { p_code: initialRoom.code });
        if (active && !pending.current && generation.current === version) {
          revision.current = next.revision;
          setRoom(previous => previous.revision === next.revision ? previous : next);
          setError("");
        }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Conference sync failed."); }
      finally { fetching = false; }
    };
    void refresh();
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 2000);
    return () => { active = false; mounted.current = false; clearInterval(timer); };
  }, [initialRoom.code]);
  const update = (action: "board" | "end", elements?: WhiteboardElement[]) => {
    if (!isHost || room.status !== "LIVE" || failed.current) return;
    generation.current++; pending.current++; setSaving(true);
    if (elements) setRoom(previous => ({ ...previous, board: { ...previous.board, elements } }));
    queue.current = queue.current.then(async () => {
      if (failed.current) return;
      const next = await conferenceRPC<Conference>("update", {
        p_code: room.code, p_host_token: hostToken, p_revision: revision.current, p_action: action, p_elements: elements || null,
      });
      revision.current = next.revision;
      if (mounted.current && pending.current === 1) { setRoom(next); setError(""); }
    }).catch(cause => {
      failed.current = true;
      if (mounted.current) setError(`${cause instanceof Error ? cause.message : "Board save failed."} Download the board before reloading to retry.`);
    }).finally(() => { pending.current--; if (mounted.current) setSaving(pending.current > 0); });
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(formatConferenceCode(room.code)); setCopied(true); }
    catch { setError("Could not copy automatically. Select and copy the code above."); }
  };
  return <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div><h1 className="text-xl font-semibold">{room.title}</h1><p className="mt-1 text-sm text-muted-foreground">Hosted by {room.hostName} · {isHost ? "You control the whiteboard" : "View-only whiteboard"}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="select-all rounded-lg bg-secondary px-3 py-2 font-semibold text-secondary-foreground">{formatConferenceCode(room.code)}</code>
        <Button variant="outline" onClick={copy}><Copy data-icon="inline-start" />{copied ? "Copied" : "Copy code"}</Button>
        <Button variant="outline" disabled={saving} onClick={onLeave}><LogOut data-icon="inline-start" />Leave</Button>
        {isHost && room.status === "LIVE" && (
          <ConfirmAction
            trigger={<Button variant="destructive" disabled={saving || !!error}>End conference</Button>}
            title="End this conference for everyone?"
            description="The whiteboard becomes read-only and video disconnects for all participants."
            confirmLabel="End conference"
            onConfirm={() => update("end")}
          />
        )}
      </div>
    </div>
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    <p role="status" className="text-xs text-muted-foreground">{room.status === "ENDED" ? "The host ended this conference. Video is disconnected and the saved board is read-only." : saving ? "Saving host’s board…" : "Live whiteboard · syncs every 2 seconds"}</p>
    <div className={`grid gap-4 ${room.status === "LIVE" ? "lg:grid-cols-[minmax(300px,2fr)_minmax(0,3fr)]" : ""}`}>
      {room.status === "LIVE" && <ConferenceVideo roomName={room.videoRoom} displayName={user.name} />}
      <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-xl border bg-card">
        <WhiteboardCanvas key={room.board.id} initialWhiteboard={room.board} readOnly={!isHost || room.status !== "LIVE" || !!error} showTeacherTools={isHost} roleLabel={isHost ? "Host" : "Participant"} onSave={elements => update("board", elements)} />
      </div>
    </div>
    {isHost && <p className="text-xs text-muted-foreground">Leaving keeps this conference open. Use End conference to close it for participants.</p>}
  </div>;
}

