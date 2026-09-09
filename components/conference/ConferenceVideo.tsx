"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface MeetingAPI {
  dispose: () => void;
  addListener: (event: string, callback: () => void) => void;
}
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => MeetingAPI;
  }
}

export function ConferenceVideo({ roomName, displayName }: { roomName: string; displayName: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading group video…");
  const [attempt, setAttempt] = useState(0);
  const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";
  useEffect(() => {
    if (!ready || !container.current || !window.JitsiMeetExternalAPI) return;
    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName, parentNode: container.current, width: "100%", height: "100%",
      userInfo: { displayName },
      configOverwrite: {
        startWithAudioMuted: true, startWithVideoMuted: true,
        disableDeepLinking: true,
        toolbarButtons: ["microphone", "camera", "desktop", "chat", "participants-pane", "tileview", "settings", "hangup", "fullscreen", "security"],
      },
    });
    const timeout = setTimeout(() => setMessage("If video does not load, retry or open the video room separately."), 15000);
    api.addListener("videoConferenceJoined", () => { clearTimeout(timeout); setMessage(""); });
    api.addListener("readyToClose", () => setMessage("You left the video call. Rejoin to connect again."));
    api.addListener("errorOccurred", () => setMessage("Video could not connect. Retry or open the video room separately."));
    return () => { clearTimeout(timeout); api.dispose(); };
  }, [ready, roomName, displayName, domain, attempt]);
  return <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 lg:min-h-0" aria-label="Group video meeting">
    <Script src={`https://${domain}/external_api.js`} strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setMessage("Video service could not load. Check your connection or open the room separately.")} />
    <div ref={container} className="min-h-[360px] flex-1" />
    <div className="space-y-2 p-3 text-xs text-slate-300">
      {message && <p role="status">{message}</p>}
      <div className="flex gap-4">
        <button className="underline" onClick={() => { if (!ready) window.location.reload(); else { setMessage("Reconnecting…"); setAttempt(value => value + 1); } }}>Rejoin video</button>
        <a className="underline" href={`https://${domain}/${encodeURIComponent(roomName)}`} target="_blank" rel="noreferrer">Open video separately</a>
      </div>
      {domain === "meet.jit.si" && <p>The host must sign in to Jitsi to start the video room. Guests can wait for the host, then join.</p>}
    </div>
  </section>;
}

