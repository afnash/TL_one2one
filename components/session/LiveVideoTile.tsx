"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { MicOff, VideoOff } from "lucide-react";
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
  const showVideo = isCameraOn && !hasPermissionError;
  const initials = participantName
    .replace(/\(You\)/, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative aspect-video select-none overflow-hidden rounded-xl border bg-muted",
        className
      )}
    >
      {showVideo ? (
        <video
          ref={handleVideoRef}
          autoPlay
          playsInline
          muted={isLocalUser}
          className={cn("size-full object-cover", isLocalUser && "-scale-x-100")}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-muted-foreground">
          {fallbackAvatar ? (
            <img
              src={fallbackAvatar}
              alt={participantName}
              className={cn("rounded-full border object-cover", compact ? "size-9" : "size-14")}
            />
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground",
                compact ? "size-8 text-xs" : "size-12 text-base"
              )}
            >
              {initials}
            </div>
          )}
          {!compact && (
            <>
              <p className="max-w-[160px] truncate text-xs font-medium text-foreground">{participantName}</p>
              <span className="flex items-center gap-1 text-[11px]">
                <VideoOff className="size-3" />
                {hasPermissionError ? "Camera permission needed" : "Camera off"}
              </span>
            </>
          )}
        </div>
      )}

      {/* Name + mic strip sits on the video, so it stays dark for legibility. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
        <span className="truncate text-xs font-medium">
          {compact ? shortName : participantName}
          <span className="ml-1 text-white/70">· {roleLabel}</span>
        </span>
        {isMicOn ? (
          <span className="flex h-4 items-end gap-0.5" aria-label="Microphone on">
            <span
              className="h-2 w-0.5 origin-bottom rounded-full bg-white transition-transform duration-75"
              style={{ transform: `scaleY(${Math.max(0.4, audioLevel / 35)})` }}
            />
            <span
              className="h-3 w-0.5 origin-bottom rounded-full bg-white transition-transform duration-75"
              style={{ transform: `scaleY(${Math.max(0.3, audioLevel / 25)})` }}
            />
          </span>
        ) : (
          <MicOff className="size-3.5 shrink-0 text-red-400" aria-label="Microphone muted" />
        )}
      </div>
    </div>
  );
}
