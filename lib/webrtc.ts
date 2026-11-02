"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { apiRequest } from "./supabase";

// Signaling runs over Supabase Realtime *public* broadcast, which anyone holding the
// publishable key can join. Mitigations:
//  - the channel name is an unguessable HMAC handed out only to session participants
//    by /api/sessions/[id]/signaling;
//  - every message is authenticated with a per-pair HMAC key issued by that endpoint
//    (the teacher shares one key with each student, students share none with each
//    other). A message is accepted only if its tag verifies under the key of the
//    claimed sender, so a participant or channel eavesdropper cannot impersonate
//    someone else, and messages carry recipient, timestamp and nonce against replay.
// The channel itself is still readable by anyone who learns its name (SDP/ICE
// metadata is visible, media stays DTLS-SRTP encrypted); fully private channels need
// Supabase Auth JWTs with RLS on realtime.messages, which this app does not issue.
interface SignalingConfig { channel: string; hostId: string; peers: string[]; keys: Record<string, string> }

// Google STUN servers for standard NAT traversal. Add a TURN server for restrictive networks.
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
};

type MediaFlags = { cameraOn: boolean; micOn: boolean };
interface WebRTCSignal {
  type: "offer" | "answer" | "candidate" | "join" | "leave" | "media-state";
  sessionId: string;
  senderId: string;
  to: string;
  ts: number;
  nonce: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  mediaState?: MediaFlags;
}
interface Envelope { body: string; tag: string }

export interface RemotePeer { id: string; stream: MediaStream | null; mediaState: MediaFlags; connected: boolean }

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  isInitiator?: boolean; // Typically Teacher
  isCameraOn: boolean;
  isMicOn: boolean;
}

const EMPTY_PEER: RemotePeer = { id: "", stream: null, mediaState: { cameraOn: false, micOn: false }, connected: false };
const MAX_SKEW_MS = 2 * 60 * 1000;
const encoder = new TextEncoder();
const toBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const importKey = (secret: string) => crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export function useWebRTC({ sessionId, userId, isInitiator = false, isCameraOn, isMicOn }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, RemotePeer>>({});
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [signaling, setSignaling] = useState<SignalingConfig | null>(null);

  const connections = useRef(new Map<string, { pc: RTCPeerConnection; queue: RTCIceCandidateInit[] }>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cryptoKeys = useRef(new Map<string, CryptoKey>());
  const seenNonces = useRef(new Set<string>());
  const mediaRef = useRef<MediaFlags>({ cameraOn: isCameraOn, micOn: isMicOn });
  const handleRef = useRef<(msg: WebRTCSignal) => Promise<void>>(async () => {});
  const sendRef = useRef<(to: string, signal: Pick<WebRTCSignal, "type"> & Partial<WebRTCSignal>) => Promise<void>>(async () => {});

  useEffect(() => { mediaRef.current = { cameraOn: isCameraOn, micOn: isMicOn }; }, [isCameraOn, isMicOn]);

  useEffect(() => {
    let cancelled = false;
    apiRequest<SignalingConfig>(`/api/sessions/${encodeURIComponent(sessionId)}/signaling`)
      .then(async config => {
        const imported = new Map<string, CryptoKey>();
        for (const [peer, secret] of Object.entries(config.keys || {})) imported.set(peer, await importKey(secret));
        if (cancelled) return;
        cryptoKeys.current = imported;
        setSignaling(config);
      })
      .catch(error => console.warn("Video signaling unavailable:", error));
    return () => { cancelled = true; };
  }, [sessionId]);
  const channel = signaling?.channel;
  const peerIds = signaling ? Object.keys(signaling.keys || {}).filter(id => id !== userId) : [];
  const peerKey = peerIds.join("|");

  const patchPeer = useCallback((id: string, patch: Partial<RemotePeer>) => {
    setPeers(current => ({ ...current, [id]: { ...(current[id] ?? EMPTY_PEER), ...patch, id } }));
  }, []);

  // Signed message to one peer, over the local BroadcastChannel and the Realtime socket.
  const sendTo = useCallback(async (to: string, signal: Pick<WebRTCSignal, "type"> & Partial<WebRTCSignal>) => {
    const key = cryptoKeys.current.get(to);
    if (!channel || !key) return;
    const payload: WebRTCSignal = { ...signal, sessionId, senderId: userId, to, ts: Date.now(), nonce: crypto.randomUUID() };
    const body = JSON.stringify(payload);
    const envelope: Envelope = { body, tag: toBase64(await crypto.subtle.sign("HMAC", key, encoder.encode(body))) };
    try { bcRef.current?.postMessage(envelope); } catch (e) { console.warn("BroadcastChannel error:", e); }
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ topic: `realtime:${channel}`, event: "broadcast", payload: { type: "broadcast", event: "webrtc_signal", payload: envelope }, ref: Math.random().toString(36).substring(7) }));
      } catch (e) { console.warn("WebSocket send error:", e); }
    }
  }, [sessionId, userId, channel]);
  useEffect(() => { sendRef.current = sendTo; }, [sendTo]);

  const sendAll = useCallback((signal: Pick<WebRTCSignal, "type"> & Partial<WebRTCSignal>) =>
    Promise.all(peerIds.map(id => sendRef.current(id, signal))).then(() => undefined),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [peerKey]);

  const closeConnection = useCallback((id: string) => {
    const existing = connections.current.get(id);
    if (!existing) return;
    existing.pc.onicecandidate = existing.pc.ontrack = existing.pc.onconnectionstatechange = null;
    existing.pc.close();
    connections.current.delete(id);
  }, []);

  const createConnection = useCallback((peerId: string) => {
    closeConnection(peerId);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const entry = { pc, queue: [] as RTCIceCandidateInit[] };
    connections.current.set(peerId, entry);

    const local = localStreamRef.current;
    for (const kind of ["video", "audio"] as const) {
      const track = local?.getTracks().find(t => t.kind === kind);
      if (track && local) pc.addTrack(track, local);
      else pc.addTransceiver(kind, { direction: "recvonly" });
    }
    pc.ontrack = event => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      patchPeer(peerId, { stream });
    };
    pc.onicecandidate = event => {
      if (event.candidate) void sendRef.current(peerId, { type: "candidate", candidate: event.candidate.toJSON() });
    };
    pc.onconnectionstatechange = () => {
      if (connections.current.get(peerId)?.pc !== pc) return;
      if (pc.connectionState === "connected") patchPeer(peerId, { connected: true });
      else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) patchPeer(peerId, { connected: false });
    };
    return entry;
  }, [closeConnection, patchPeer]);

  const flushCandidates = async (entry: { pc: RTCPeerConnection; queue: RTCIceCandidateInit[] }) => {
    while (entry.queue.length) {
      const candidate = entry.queue.shift();
      if (candidate) await entry.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    }
  };

  const handleSignal = useCallback(async (msg: WebRTCSignal) => {
    const peerId = msg.senderId;
    const media = mediaRef.current;
    try {
      if (msg.type === "leave") {
        closeConnection(peerId);
        patchPeer(peerId, { stream: null, connected: false });
        return;
      }
      if (msg.type === "media-state") {
        if (msg.mediaState) patchPeer(peerId, { mediaState: { cameraOn: msg.mediaState.cameraOn === true, micOn: msg.mediaState.micOn === true } });
        return;
      }
      if (msg.type === "join") {
        // The host builds a fresh connection and offers; a student answers a host join with its own join.
        void sendRef.current(peerId, { type: "media-state", mediaState: media });
        if (!isInitiator) { void sendRef.current(peerId, { type: "join" }); return; }
        const entry = createConnection(peerId);
        const offer = await entry.pc.createOffer();
        await entry.pc.setLocalDescription(offer);
        await sendRef.current(peerId, { type: "offer", sdp: offer });
        return;
      }
      if (msg.type === "offer" && !isInitiator && msg.sdp) {
        const entry = createConnection(peerId);
        await entry.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        await flushCandidates(entry);
        const answer = await entry.pc.createAnswer();
        await entry.pc.setLocalDescription(answer);
        await sendRef.current(peerId, { type: "answer", sdp: answer });
        return;
      }
      const entry = connections.current.get(peerId);
      if (!entry) return;
      if (msg.type === "answer" && isInitiator && msg.sdp) {
        await entry.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        await flushCandidates(entry);
      } else if (msg.type === "candidate" && msg.candidate) {
        if (entry.pc.remoteDescription?.type) await entry.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(err => console.warn("Error adding ICE candidate:", err));
        else entry.queue.push(msg.candidate);
      }
    } catch (err) {
      console.warn("WebRTC signaling handling error:", err);
    }
  }, [isInitiator, createConnection, closeConnection, patchPeer]);
  useEffect(() => { handleRef.current = handleSignal; }, [handleSignal]);

  // Verifies the sender's tag with the pair key before anything is acted on.
  const receive = useCallback(async (envelope: Envelope) => {
    try {
      if (!envelope || typeof envelope.body !== "string" || typeof envelope.tag !== "string") return;
      const msg = JSON.parse(envelope.body) as WebRTCSignal;
      if (!msg || msg.sessionId !== sessionId || msg.to !== userId || msg.senderId === userId) return;
      const key = cryptoKeys.current.get(msg.senderId);
      if (!key) return;
      if (!await crypto.subtle.verify("HMAC", key, fromBase64(envelope.tag), encoder.encode(envelope.body))) return;
      if (typeof msg.ts !== "number" || Math.abs(Date.now() - msg.ts) > MAX_SKEW_MS || typeof msg.nonce !== "string" || seenNonces.current.has(msg.nonce)) return;
      seenNonces.current.add(msg.nonce);
      if (seenNonces.current.size > 2000) seenNonces.current = new Set([...seenNonces.current].slice(-1000));
      await handleRef.current(msg);
    } catch { /* malformed or unverifiable messages are dropped */ }
  }, [sessionId, userId]);

  // 1. Acquire local media once. Joining waits for it so offers include our tracks.
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;
    const attempts: MediaStreamConstraints[] = [
      { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
      { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: false, audio: true },
    ];
    (async () => {
      let stream: MediaStream | null = null;
      for (const constraints of attempts) {
        try { stream = await navigator.mediaDevices.getUserMedia(constraints); break; } catch { /* try the next fallback */ }
      }
      if (isCancelled) { stream?.getTracks().forEach(t => t.stop()); return; }
      if (stream) {
        activeStream = stream;
        localStreamRef.current = stream;
        stream.getVideoTracks().forEach(t => (t.enabled = mediaRef.current.cameraOn));
        stream.getAudioTracks().forEach(t => (t.enabled = mediaRef.current.micOn));
        setLocalStream(stream);
        setHasPermissionError(false);
      } else setHasPermissionError(true);
      setMediaReady(true);
    })();
    return () => { isCancelled = true; activeStream?.getTracks().forEach(t => t.stop()); };
  }, []);

  // 2. BroadcastChannel (same browser) + Supabase Realtime socket (cross-device).
  useEffect(() => {
    if (!channel || !mediaReady) return;
    const bc = new BroadcastChannel(`onetoone_webrtc_${channel}`);
    bcRef.current = bc;
    bc.onmessage = event => { void receive(event.data); };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let ws: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    if (supabaseUrl && supabaseKey) {
      try {
        ws = new WebSocket(`${supabaseUrl.replace(/^http/, "ws")}/realtime/v1/websocket?apikey=${supabaseKey}&vsn=1.0.0`);
        wsRef.current = ws;
        ws.onopen = () => {
          ws?.send(JSON.stringify({ topic: `realtime:${channel}`, event: "phx_join", payload: { config: { broadcast: { self: false } } }, ref: "1" }));
          heartbeat = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
          }, 25000);
          // Announce presence once the channel is joined.
          setTimeout(() => { void sendAll({ type: "join" }); }, 500);
        };
        ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "broadcast" && data.payload?.event === "webrtc_signal") void receive(data.payload.payload as Envelope);
          } catch { /* ignore parse errors */ }
        };
      } catch (err) {
        console.warn("Supabase Realtime WebSocket setup failed:", err);
      }
    }
    void sendAll({ type: "join" });

    const open = connections.current;
    return () => {
      const leaving = sendAll({ type: "leave" }).catch(() => {});
      void leaving.finally(() => {
        bc.close();
        if (heartbeat) clearInterval(heartbeat);
        ws?.close();
      });
      if (bcRef.current === bc) bcRef.current = null;
      for (const id of [...open.keys()]) closeConnection(id);
    };
  }, [channel, mediaReady, receive, sendAll, closeConnection]);

  // 3. Apply and broadcast camera/mic toggles.
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = isCameraOn; });
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMicOn; });
    void sendAll({ type: "media-state", mediaState: { cameraOn: isCameraOn, micOn: isMicOn } });
  }, [isCameraOn, isMicOn, sendAll]);

  // The host sees the focused student (default: the first one with video); a student sees the host.
  const list = Object.values(peers);
  const primary = (focusedId && peers[focusedId]) || list.find(peer => peer.stream) || list[0] || null;

  return {
    localStream,
    remoteStream: primary?.stream ?? null,
    isConnected: list.some(peer => peer.connected),
    hasPermissionError,
    remoteMediaState: primary?.mediaState ?? { cameraOn: false, micOn: false },
    // Group sessions: every connected peer, and a way to choose which one `remoteStream` shows.
    remotePeers: list,
    focusedPeerId: primary?.id ?? null,
    focusPeer: setFocusedId,
  };
}
