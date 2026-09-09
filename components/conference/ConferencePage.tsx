"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Copy, Plus, Users, LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl bg-slate-900 p-8 text-white">
          <Users className="mb-4 h-9 w-9 text-indigo-300" />
          <h1 className="text-3xl font-bold">One room. Everyone together.</h1>
          <p className="mt-3 max-w-xl text-slate-300">Share a conference code to bring multiple participants into a video call. The host teaches on the whiteboard while everyone watches live.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {role === "TEACHER" && <form onSubmit={create} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">Host a conference</h2>
            <label className="block text-sm font-medium">Meeting title<input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Revision workshop" className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></label>
            <button disabled={busy || !title.trim()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{busy ? "Please wait…" : "Create conference"}</button>
            <p className="text-xs text-slate-500">Your host controls stay in this browser. Keep the room code to rejoin.</p>
          </form>}
          <form onSubmit={join} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">Join a conference</h2>
            <label className="block text-sm font-medium">Conference code<input required maxLength={40} value={code} onChange={event => setCode(event.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" autoCapitalize="characters" spellCheck={false} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono uppercase" /></label>
            <button disabled={busy || !code.trim()} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Please wait…" : "Join conference"}</button>
            <p className="text-xs text-slate-500">Teachers and students can join with the same code. Only the host can edit the board.</p>
          </form>
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
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
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div><h1 className="text-xl font-bold">{room.title}</h1><p className="mt-1 text-sm text-slate-500">Hosted by {room.hostName} · {isHost ? "You control the whiteboard" : "View-only whiteboard"}</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <code className="select-all rounded-lg bg-indigo-50 px-3 py-2 font-semibold text-indigo-700">{formatConferenceCode(room.code)}</code>
        <button onClick={copy} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy code"}</button>
        <button disabled={saving} onClick={onLeave} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"><LogOut className="h-4 w-4" />Leave</button>
        {isHost && room.status === "LIVE" && <button disabled={saving || !!error} onClick={() => { if (window.confirm("End this conference for everyone? The whiteboard will become read-only.")) update("end"); }} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">End conference</button>}
      </div>
    </div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <p role="status" className="text-xs text-slate-500">{room.status === "ENDED" ? "The host ended this conference. Video is disconnected and the saved board is read-only." : saving ? "Saving host’s board…" : "Live whiteboard · syncs every 2 seconds"}</p>
    <div className={`grid gap-4 ${room.status === "LIVE" ? "lg:grid-cols-[minmax(300px,2fr)_minmax(0,3fr)]" : ""}`}>
      {room.status === "LIVE" && <ConferenceVideo roomName={room.videoRoom} displayName={user.name} />}
      <div className="h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <WhiteboardCanvas key={room.board.id} initialWhiteboard={room.board} readOnly={!isHost || room.status !== "LIVE" || !!error} showTeacherTools={isHost} roleLabel={isHost ? "Host" : "Participant"} onSave={elements => update("board", elements)} />
      </div>
    </div>
    {isHost && <p className="text-xs text-slate-500">Leaving keeps this conference open. Use End conference to close it for participants.</p>}
  </div>;
}

