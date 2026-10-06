"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Google STUN servers for standard NAT traversal
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
};

interface WebRTCSignal {
  type: "offer" | "answer" | "candidate" | "join" | "leave" | "media-state";
  sessionId: string;
  senderId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  mediaState?: { cameraOn: boolean; micOn: boolean };
}

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  isInitiator?: boolean; // Typically Teacher
  isCameraOn: boolean;
  isMicOn: boolean;
}

export function useWebRTC({
  sessionId,
  userId,
  isInitiator = false,
  isCameraOn,
  isMicOn,
}: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [remoteMediaState, setRemoteMediaState] = useState<{ cameraOn: boolean; micOn: boolean }>({
    cameraOn: false,
    micOn: false,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const isMakingOffer = useRef(false);

  // Send signaling message via BroadcastChannel (local tabs) and Supabase Realtime WebSocket (cross-device)
  const sendSignal = useCallback((signal: Omit<WebRTCSignal, "sessionId" | "senderId">) => {
    const payload: WebRTCSignal = {
      ...signal,
      sessionId,
      senderId: userId,
    };

    // 1. Send via local BroadcastChannel (instant for tabs on same browser/device)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(payload);
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }

    // 2. Send via Supabase Realtime WebSocket (for remote cross-device peers)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            topic: `realtime:session_${sessionId}`,
            event: "broadcast",
            payload: {
              type: "broadcast",
              event: "webrtc_signal",
              payload,
            },
            ref: Math.random().toString(36).substring(7),
          })
        );
      } catch (e) {
        console.warn("WebSocket send error:", e);
      }
    }
  }, [sessionId, userId]);

  // Create and configure RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      return pcRef.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        setRemoteStream(stream);
      }
    };

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Connection state logging
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setIsConnected(true);
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        setIsConnected(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setIsConnected(true);
      }
    };

    return pc;
  }, [sendSignal]);

  // Handle incoming signaling message
  const handleSignal = useCallback(async (msg: WebRTCSignal) => {
    // Ignore messages not meant for this session or messages sent by ourselves
    if (msg.sessionId !== sessionId || msg.senderId === userId) return;

    let pc = pcRef.current;
    if (!pc) {
      pc = createPeerConnection();
    }

    try {
      if (msg.type === "join") {
        // A peer just joined. If we have local stream, send our current media state and initiate offer if we are initiator
        sendSignal({
          type: "media-state",
          mediaState: { cameraOn: isCameraOn, micOn: isMicOn },
        });

        if (isInitiator) {
          isMakingOffer.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: "offer", sdp: offer });
          isMakingOffer.current = false;
        }
      } else if (msg.type === "media-state" && msg.mediaState) {
        setRemoteMediaState(msg.mediaState);
      } else if (msg.type === "offer" && msg.sdp) {
        const offerDesc = new RTCSessionDescription(msg.sdp);
        await pc.setRemoteDescription(offerDesc);

        // Process any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const cand = iceCandidatesQueue.current.shift();
          if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sdp: answer });
      } else if (msg.type === "answer" && msg.sdp) {
        const answerDesc = new RTCSessionDescription(msg.sdp);
        await pc.setRemoteDescription(answerDesc);

        // Process any queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const cand = iceCandidatesQueue.current.shift();
          if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }
      } else if (msg.type === "candidate" && msg.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch((err) => {
            console.warn("Error adding ICE candidate:", err);
          });
        } else {
          iceCandidatesQueue.current.push(msg.candidate);
        }
      } else if (msg.type === "leave") {
        setRemoteStream(null);
        setIsConnected(false);
      }
    } catch (err) {
      console.warn("WebRTC signaling handling error:", err);
    }
  }, [sessionId, userId, isInitiator, isCameraOn, isMicOn, createPeerConnection, sendSignal]);

  // 1. Acquire Local Media Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    async function initMedia() {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false,
            });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
          }
        }

        if (isCancelled) {
          stream?.getTracks().forEach((t) => t.stop());
          return;
        }

        if (stream) {
          activeStream = stream;
          localStreamRef.current = stream;
          setLocalStream(stream);
          setHasPermissionError(false);

          // Apply initial track mute/enabled states
          stream.getVideoTracks().forEach((t) => (t.enabled = isCameraOn));
          stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));

          // Attach tracks to existing PeerConnection if any
          const pc = pcRef.current;
          if (pc) {
            const senders = pc.getSenders();
            stream.getTracks().forEach((track) => {
              const sender = senders.find((s) => s.track?.kind === track.kind);
              if (sender) {
                sender.replaceTrack(track).catch(() => {});
              } else {
                pc.addTrack(track, stream!);
              }
            });
          }

          // Announce ourselves to any existing peer in the session
          sendSignal({ type: "join" });
        }
      } catch (err) {
        console.warn("Cannot acquire media:", err);
        setHasPermissionError(true);
      }
    }

    void initMedia();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [sendSignal]);

  // 2. Setup BroadcastChannel & Supabase Realtime WebSocket
  useEffect(() => {
    // A. BroadcastChannel for fast local same-device tabs
    const bc = new BroadcastChannel(`onetoone_webrtc_${sessionId}`);
    broadcastChannelRef.current = bc;
    bc.onmessage = (event) => {
      if (event.data) {
        void handleSignal(event.data);
      }
    };

    // B. Supabase Realtime WebSocket for cross-device peer signaling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    if (supabaseUrl && supabaseKey) {
      try {
        const wsUrl = supabaseUrl
          .replace(/^https:\/\//, "wss://")
          .replace(/^http:\/\//, "ws://");
        ws = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${supabaseKey}&vsn=1.0.0`);
        wsRef.current = ws;

        ws.onopen = () => {
          // Join the session channel
          const topic = `realtime:session_${sessionId}`;
          ws?.send(
            JSON.stringify({
              topic,
              event: "phx_join",
              payload: { config: { broadcast: { self: false } } },
              ref: "1",
            })
          );

          // Heartbeat every 25 seconds
          heartbeatInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
            }
          }, 25000);

          // Announce presence over WebSocket
          sendSignal({ type: "join" });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "broadcast" && data.payload?.event === "webrtc_signal") {
              const signal = data.payload.payload as WebRTCSignal;
              if (signal) {
                void handleSignal(signal);
              }
            }
          } catch {
            // Ignore parse errors
          }
        };
      } catch (err) {
        console.warn("Supabase Realtime WebSocket setup failed:", err);
      }
    }

    // Announce join immediately on BroadcastChannel
    sendSignal({ type: "join" });

    return () => {
      sendSignal({ type: "leave" });
      bc.close();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (ws) {
        ws.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [sessionId, handleSignal, sendSignal]);

  // 3. Sync track enabled state and broadcast to peer when user clicks camera/mic toggle
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = isCameraOn;
      });
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMicOn;
      });
    }

    sendSignal({
      type: "media-state",
      mediaState: { cameraOn: isCameraOn, micOn: isMicOn },
    });
  }, [isCameraOn, isMicOn, sendSignal]);

  return {
    localStream,
    remoteStream,
    isConnected,
    hasPermissionError,
    remoteMediaState,
  };
}
