"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveVideoTileProps {
  participantName: string;
  roleLabel: "Teacher" | "Student";
  isLocalUser?: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  fallbackAvatar?: string;
  stream?: MediaStream | null;
  className?: string;
  compact?: boolean;
}

export function LiveVideoTile({
  participantName,
  roleLabel,
  isLocalUser = false,
  isMicOn,
  isCameraOn,
  fallbackAvatar,
  stream,
  className,
  compact = false,
}: LiveVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState("");
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Request actual camera & microphone for local user
  useEffect(() => {
    if (!isLocalUser) return;

    let activeStream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrame: number;
    let isCancelled = false;

    async function initMedia() {
      try {
        let userMedia: MediaStream | null = null;
        try {
          userMedia = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
        } catch (fullErr) {
          // If both video+audio failed, try video only
          try {
            userMedia = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false,
            });
          } catch (videoErr) {
            // If video only failed, try audio only
            userMedia = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
          }
        }

        if (isCancelled) {
          userMedia?.getTracks().forEach((t) => t.stop());
          return;
        }

        if (userMedia) {
          activeStream = userMedia;
          setLocalStream(userMedia);
          setHasPermissionError(false);
          setPermissionErrorMsg("");

          // Set initial track states
          userMedia.getVideoTracks().forEach((t) => (t.enabled = isCameraOn));
          userMedia.getAudioTracks().forEach((t) => (t.enabled = isMicOn));

          // Set up real audio level detection if audio tracks exist
          if (userMedia.getAudioTracks().length > 0) {
            try {
              audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const source = audioContext.createMediaStreamSource(userMedia);
              analyser = audioContext.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateAudioLevel = () => {
                if (analyser && isMicOn) {
                  analyser.getByteFrequencyData(dataArray);
                  const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                  setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
                } else {
                  setAudioLevel(0);
                }
                animFrame = requestAnimationFrame(updateAudioLevel);
              };
              updateAudioLevel();
            } catch (audioErr) {
              console.warn("Audio meter setup:", audioErr);
            }
          }
        }
      } catch (err) {
        console.warn("Real webcam/mic not accessible:", err);
        setHasPermissionError(true);
        setPermissionErrorMsg(err instanceof Error ? err.message : "Camera access denied");
      }
    }

    void initMedia();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
  }, [isLocalUser]);

  // Handle stream tracks toggle
  useEffect(() => {
    const s = isLocalUser ? localStream : stream;
    if (s) {
      s.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn;
      });
      s.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isCameraOn, isMicOn, stream, localStream, isLocalUser]);

  const activeMedia = isLocalUser ? localStream : stream;

  // Video Ref callback to guarantee immediate video stream attachment upon DOM mount
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && activeMedia) {
      if (node.srcObject !== activeMedia) {
        node.srcObject = activeMedia;
      }
      node.play().catch((e) => {
        console.log("Autoplay:", e);
      });
    }
  }, [activeMedia]);

  // Sync stream to video element when activeMedia or camera state updates
  useEffect(() => {
    if (videoRef.current && activeMedia) {
      if (videoRef.current.srcObject !== activeMedia) {
        videoRef.current.srcObject = activeMedia;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [activeMedia, isCameraOn]);

  // Format short name for compact mode
  const shortName = isLocalUser ? "You" : participantName.split(" ")[0];

  return (
    <div
      className={cn(
        "relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-lg group select-none transition-all",
        compact && "rounded-xl border-white/15 shadow-md",
        className
      )}
    >
      {/* Real Video Element */}
      {isCameraOn && !hasPermissionError ? (
        <video
          ref={handleVideoRef}
          autoPlay
          playsInline
          muted={isLocalUser} // Mute self to prevent feedback loop
          className={cn(
            "w-full h-full object-cover",
            isLocalUser && "transform -scale-x-100" // Mirror only local webcam
          )}
        />
      ) : (
        /* Fallback Avatar */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-300 p-2 text-center">
          {fallbackAvatar ? (
            <div
              className={cn(
                "relative rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-lg",
                compact ? "w-9 h-9" : "w-14 h-14 mb-1.5"
              )}
            >
              <img src={fallbackAvatar} alt={participantName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white font-bold",
                compact ? "w-8 h-8 text-xs" : "w-12 h-12 text-base mb-1.5"
              )}
            >
              {participantName.split(" ").map((n) => n[0]).join("")}
            </div>
          )}

          {!compact && (
            <>
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">{participantName}</p>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <VideoOff className="w-3 h-3 text-slate-500" />
                {hasPermissionError ? "Camera Permission Needed" : "Camera Off"}
              </span>
            </>
          )}
        </div>
      )}

      {/* COMPACT / FLOATING OVERLAY */}
      {compact ? (
        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-none">
          {/* Name & Role */}
          <div className="flex items-center gap-1 truncate max-w-[80%]">
            <span className="text-[11px] font-bold text-white tracking-tight truncate drop-shadow-sm">
              {shortName}
            </span>
            <span
              className={cn(
                "text-[8px] px-1 py-0.2 rounded font-extrabold uppercase shrink-0",
                roleLabel === "Teacher"
                  ? "bg-indigo-500/80 text-white"
                  : "bg-emerald-500/80 text-white"
              )}
            >
              {roleLabel[0]}
            </span>
          </div>

          {/* Audio Indicator */}
          <div className="flex items-center gap-1 shrink-0">
            {isMicOn ? (
              <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                <div
                  className="w-1 h-2 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ transform: `scaleY(${Math.max(0.4, audioLevel / 35)})` }}
                />
                <div
                  className="w-1 h-3 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ transform: `scaleY(${Math.max(0.3, audioLevel / 25)})` }}
                />
              </div>
            ) : (
              <div className="p-0.5 rounded bg-rose-600/90 text-white">
                <MicOff className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DOCKED SIDEBAR OVERLAY */
        <>
          {/* Top Header Badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-sm">
            <span className="truncate max-w-[100px]">{participantName}</span>
            <span
              className={cn(
                "text-[8px] px-1 py-0.2 rounded font-extrabold uppercase",
                roleLabel === "Teacher"
                  ? "bg-indigo-500/40 text-indigo-300 border border-indigo-500/40"
                  : "bg-emerald-500/40 text-emerald-300 border border-emerald-500/40"
              )}
            >
              {roleLabel}
            </span>
          </div>

          {/* Top Right Status */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {!isMicOn && (
              <div className="p-1 rounded-md bg-rose-600/90 text-white shadow-sm" title="Microphone muted">
                <MicOff className="w-2.5 h-2.5" />
              </div>
            )}
            {isCameraOn && !hasPermissionError && (
              <div className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-md text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>

          {/* Bottom Audio Visualizer Bar */}
          {isMicOn && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
              <div
                className="w-1 h-2 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ transform: `scaleY(${Math.max(0.4, audioLevel / 35)})` }}
              />
              <div
                className="w-1 h-3 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ transform: `scaleY(${Math.max(0.3, audioLevel / 25)})` }}
              />
              <span className="text-[8px] text-emerald-300 font-bold ml-0.5">Audio</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
