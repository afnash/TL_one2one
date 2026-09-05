"use client";

import React, { useRef, useEffect, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, ShieldCheck, AlertCircle } from "lucide-react";
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
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Request actual camera & microphone for local user
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrame: number;

    async function initMedia() {
      if (!isLocalUser) return;

      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        activeStream = userMedia;
        setLocalStream(userMedia);
        setHasPermissionError(false);

        if (videoRef.current) {
          videoRef.current.srcObject = userMedia;
        }

        // Set up real audio level detection
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
          console.warn("Audio meter context setup:", audioErr);
        }
      } catch (err) {
        console.warn("Real webcam/mic not accessible:", err);
        setHasPermissionError(true);
      }
    }

    initMedia();

    return () => {
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
    const s = stream || localStream;
    if (s) {
      s.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn;
      });
      s.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isCameraOn, isMicOn, stream, localStream]);

  // If remote stream passed
  useEffect(() => {
    if (!isLocalUser && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isLocalUser, stream]);

  // Format short name for compact mode
  const shortName = isLocalUser ? "You" : participantName.split(" ")[0];

  return (
    <div
      className={cn(
        "relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-lg group select-none",
        compact && "rounded-xl border-white/15 shadow-md",
        className
      )}
    >
      {/* Real Video Element */}
      {isCameraOn && !hasPermissionError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocalUser} // Mute self to prevent feedback loop
          className="w-full h-full object-cover transform -scale-x-100" // Mirror local stream
        />
      ) : (
        /* Fallback Avatar */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-300 p-2 text-center">
          {fallbackAvatar ? (
            <div
              className={cn(
                "relative rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-lg",
                compact ? "w-9 h-9" : "w-16 h-16 mb-2"
              )}
            >
              <img src={fallbackAvatar} alt={participantName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white font-bold",
                compact ? "w-8 h-8 text-xs" : "w-14 h-14 text-lg mb-2"
              )}
            >
              {participantName.split(" ").map((n) => n[0]).join("")}
            </div>
          )}

          {!compact && (
            <>
              <p className="text-xs font-semibold text-slate-200 mt-1">{participantName}</p>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <VideoOff className="w-3 h-3 text-slate-500" />
                {!isLocalUser && !stream ? "Use the meeting link for video" : hasPermissionError ? "Camera Permission Needed" : "Camera Muted"}
              </span>
            </>
          )}
        </div>
      )}

      {/* COMPACT PI-P OVERLAY: Single subtle bottom bar with zero clutter */}
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
        /* DEFAULT DOCKED SIDEBAR OVERLAY: Clean, well-spaced header & footer */
        <>
          {/* Top Header Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-950/75 backdrop-blur-md rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-sm">
            <span>{participantName}</span>
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase",
                roleLabel === "Teacher"
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                  : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
              )}
            >
              {roleLabel}
            </span>
          </div>

          {/* Top Right Status */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {!isMicOn && (
              <div className="p-1 rounded-lg bg-rose-500/90 text-white shadow-sm">
                <MicOff className="w-3 h-3" />
              </div>
            )}
            <div className="px-2 py-0.5 bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-bold text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real Cam</span>
            </div>
          </div>

          {/* Bottom Audio Visualizer Bar */}
          {isMicOn && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-slate-950/75 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10">
              <div
                className="w-1.5 h-3 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ transform: `scaleY(${Math.max(0.4, audioLevel / 35)})` }}
              />
              <div
                className="w-1.5 h-4 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ transform: `scaleY(${Math.max(0.3, audioLevel / 25)})` }}
              />
              <div
                className="w-1.5 h-2.5 bg-emerald-400 rounded-full transition-all duration-75"
                style={{ transform: `scaleY(${Math.max(0.5, audioLevel / 40)})` }}
              />
              <span className="text-[9px] text-emerald-300 font-bold ml-1">Live Audio</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
