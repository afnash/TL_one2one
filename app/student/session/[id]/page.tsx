"use client";

import { BoardAccess } from "@/components/session/BoardAccess";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { SessionWorkspace } from "@/components/session/SessionWorkspace";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
import { LiveVideoTile } from "@/components/session/LiveVideoTile";
import { useWebRTC } from "@/lib/webrtc";
import { formatTime } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Clock,
  ShieldCheck,
  Minimize2,
  Maximize2,
  Move,
  CheckCircle2,
  ArrowRight,
  Home,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentLiveSessionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const {
    user,
    sessions,
    whiteboards,
    activeSession,
    sessionElapsedSeconds,
    startLiveSession,
    updateSession,
    updateWhiteboardElements,
  } = useLMS();

  const currentSession = sessions.find((s) => s.id === sessionId) || activeSession;
  const isSessionEnded = currentSession ? currentSession.status === "COMPLETED" : false;
  const [countdown, setCountdown] = useState(3);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Video panel mode: "minimized" (pill) | "floating" (PiP card) | "docked" (sidebar)
  const [videoDisplayMode, setVideoDisplayMode] = useState<"minimized" | "floating" | "docked">("minimized");
  const [pipPosition, setPipPosition] = useState<"bottom-right" | "top-right" | "bottom-left" | "top-left">("bottom-right");

  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession?.whiteboardId || ""
  );

  // Auto-redirect countdown when session is closed/ended by teacher
  useEffect(() => {
    if (!isSessionEnded) return;

    if (countdown <= 0) {
      router.push("/student/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSessionEnded, countdown, router]);

  useEffect(() => {
    if (currentSession && currentSession.status === "LIVE" && !activeSession) {
      startLiveSession(sessionId);
    }
  }, [sessionId, currentSession, activeSession, startLiveSession]);

  const currentWhiteboard =
    whiteboards.find((w) => w.id === (activeWhiteboardId || currentSession?.whiteboardId));

  useEffect(() => {
    if (!currentSession || !user.id) return;
    const previous = currentSession.mediaState?.[user.id];
    if (previous?.cameraOn === isCameraOn && previous?.micOn === isMicOn) return;
    updateSession(currentSession.id, {
      mediaState: {
        ...currentSession.mediaState,
        [user.id]: { cameraOn: isCameraOn, micOn: isMicOn },
      },
    });
  }, [currentSession, isCameraOn, isMicOn, updateSession, user.id]);

  const {
    localStream,
    remoteStream,
    isConnected: isWebRTCConnected,
    remoteMediaState,
  } = useWebRTC({
    sessionId,
    userId: user.id,
    isInitiator: false,
    isCameraOn,
    isMicOn,
  });

  const teacherMedia = currentSession?.mediaState?.[currentSession?.teacherId || ""];
  const isTeacherCameraOn = teacherMedia?.cameraOn === true || remoteMediaState.cameraOn;

  const handleLeaveSession = () => {
    if (window.confirm("Are you sure you want to leave the live classroom?")) {
      router.push("/student/dashboard");
    }
  };

  const cyclePipPosition = () => {
    setPipPosition((prev) => {
      if (prev === "bottom-right") return "bottom-left";
      if (prev === "bottom-left") return "top-right";
      if (prev === "top-right") return "top-left";
      return "bottom-right";
    });
  };

  if (!currentSession) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Session not found.</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Streamlined Student Classroom Header (Compact 46px height) */}
      <header className="h-11 sm:h-12 px-3 sm:px-4 glass-dark flex items-center justify-between shrink-0 z-30 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-extrabold tracking-wide uppercase">1:1 Live</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
              Educator: {currentSession.teacherName}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
              {currentSession.subject}
            </span>
            <span className="text-[11px] text-slate-400 hidden lg:inline max-w-sm truncate">
              {currentSession.topic}
            </span>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-white/10 rounded-lg font-mono text-xs font-bold text-emerald-400">
          <Clock className="w-3 h-3" />
          <span>{formatTime(sessionElapsedSeconds)}</span>
        </div>

        {/* Right: Camera Minimize & Leave Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsMicOn((value) => !value)}
            className={cn("rounded-lg p-1.5 transition-colors", isMicOn ? "bg-slate-900/80 text-white hover:bg-slate-800" : "bg-rose-600 text-white")}
            title={isMicOn ? "Mute microphone" : "Unmute microphone"}
            aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => setIsCameraOn((value) => !value)}
            className={cn("rounded-lg p-1.5 transition-colors", isCameraOn ? "bg-slate-900/80 text-white hover:bg-slate-800" : "bg-rose-600 text-white")}
            title={isCameraOn ? "Turn camera off" : "Turn camera on"}
            aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
          >
            {isCameraOn ? <VideoIcon className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
          </button>

          {/* Video Display Mode Toggle */}
          <button
            onClick={() =>
              setVideoDisplayMode((prev) =>
                prev === "docked" ? "minimized" : prev === "minimized" ? "floating" : "docked"
              )
            }
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border",
              videoDisplayMode === "docked"
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-400/40"
                : videoDisplayMode === "floating"
                ? "bg-emerald-600/20 text-emerald-300 border-emerald-400/30"
                : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
            )}
            title={
              videoDisplayMode === "minimized"
                ? "Video: Minimized (Click to expand floating PiP)"
                : videoDisplayMode === "floating"
                ? "Video: Floating PiP (Click to dock sidebar)"
                : "Video: Docked Sidebar (Click to minimize)"
            }
          >
            {videoDisplayMode === "docked" ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span className="hidden md:inline">Docked</span>
              </>
            ) : videoDisplayMode === "floating" ? (
              <>
                <Maximize2 className="w-3 h-3" />
                <span className="hidden md:inline">Floating</span>
              </>
            ) : (
              <>
                <VideoIcon className="w-3 h-3" />
                <span className="hidden md:inline">Video Min</span>
              </>
            )}
          </button>

          <button
            onClick={handleLeaveSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
          >
            <PhoneOff className="w-3 h-3" />
            <span className="hidden sm:inline">Leave Room</span>
          </button>
        </div>
      </header>

      <BoardAccess sessionId={sessionId} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Video Panel (When DOCKED) */}
        {videoDisplayMode === "docked" && (
          <div className="w-full md:w-72 lg:w-80 bg-slate-950/85 border-r border-white/10 flex flex-col p-3 gap-3 shrink-0 overflow-y-auto z-20 backdrop-blur-md animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teacher stream</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVideoDisplayMode("floating")}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Switch to floating PiP"
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setVideoDisplayMode("minimized")}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Minimize video to small pill"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Teacher Stream */}
            <LiveVideoTile
              participantName={currentSession.teacherName}
              roleLabel="Teacher"
              isLocalUser={false}
              isCameraOn={isTeacherCameraOn}
              isMicOn={teacherMedia?.micOn || remoteMediaState.micOn}
              fallbackAvatar={currentSession.teacherAvatar}
              stream={remoteStream}
            />

            {/* Student (You) Live Webcam Tile */}
            <LiveVideoTile
              participantName={`${user.name} (You)`}
              roleLabel="Student"
              isLocalUser={true}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              fallbackAvatar={user.avatar || currentSession.studentAvatar}
              stream={localStream}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-white/10 rounded-xl shadow-md">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white animate-pulse"
                )}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isCameraOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white animate-pulse"
                )}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isCameraOn ? <VideoIcon className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Right: Collaborative Infinite Canvas */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="flex-1 min-h-0 w-full relative">
            <SessionWorkspace session={currentSession}>
              <WhiteboardCanvas
                readOnly={
                  currentWhiteboard?.category === "LIVE_CLASS" &&
                  (currentSession.status !== "LIVE" ||
                    ((currentSession.studentIds?.length || 1) > 1 &&
                      !currentSession.writerIds?.includes(user.id)))
                }
                key={activeWhiteboardId}
                initialWhiteboard={currentWhiteboard}
                whiteboardId={activeWhiteboardId}
                roleLabel="Student"
                showTeacherTools={false}
                onSave={(newElements, previousElements) => {
                  updateWhiteboardElements(currentWhiteboard?.id || "", newElements, previousElements);
                }}
              />
            </SessionWorkspace>

            {/* 1. FLOATING VIDEO POP-UP ON BOARD (When Floating Mode) */}
            {videoDisplayMode === "floating" && (
              <div
                className={cn(
                  "absolute z-40 p-2.5 glass-dark rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-2 animate-in zoom-in-95 duration-150 backdrop-blur-xl w-64 sm:w-72",
                  pipPosition === "bottom-right" && "bottom-4 right-4",
                  pipPosition === "top-right" && "top-14 right-4",
                  pipPosition === "bottom-left" && "bottom-4 left-4",
                  pipPosition === "top-left" && "top-14 left-4"
                )}
              >
                {/* Pop-up Drag / Control Bar */}
                <div className="flex items-center justify-between px-1 py-0.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentSession.teacherName}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={cyclePipPosition}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Move pop-up corner"
                    >
                      <Move className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setVideoDisplayMode("minimized")}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Minimize to compact pill"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setVideoDisplayMode("docked")}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Dock camera back to side panel"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Stacked Video Feeds */}
                <div className="grid grid-cols-2 gap-1.5">
                  <LiveVideoTile
                    participantName={currentSession.teacherName}
                    roleLabel="Teacher"
                    isLocalUser={false}
                    isCameraOn={isTeacherCameraOn}
                    isMicOn={teacherMedia?.micOn || remoteMediaState.micOn}
                    fallbackAvatar={currentSession.teacherAvatar}
                    stream={remoteStream}
                    compact={true}
                    className="aspect-video rounded-xl"
                  />
                  <LiveVideoTile
                    participantName="You"
                    roleLabel="Student"
                    isLocalUser={true}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    fallbackAvatar={user.avatar || currentSession.studentAvatar}
                    stream={localStream}
                    compact={true}
                    className="aspect-video rounded-xl"
                  />
                </div>

                {/* Compact Controls */}
                <div className="flex items-center justify-around px-2 py-1 bg-slate-900/90 rounded-xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-all",
                      isMicOn ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-rose-500 bg-rose-500/10"
                    )}
                    title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                  >
                    {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-all",
                      isCameraOn ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-rose-500 bg-rose-500/10"
                    )}
                    title={isCameraOn ? "Turn Cam Off" : "Turn Cam On"}
                  >
                    {isCameraOn ? <VideoIcon className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* 2. ULTRA-COMPACT MINIMIZED VIDEO PILL (When Minimized Mode) */}
            {videoDisplayMode === "minimized" && (
              <div
                className={cn(
                  "absolute z-40 flex items-center gap-2 p-1.5 px-2.5 glass-dark rounded-full shadow-lg border border-white/20 backdrop-blur-md text-xs transition-all",
                  pipPosition === "bottom-right" && "bottom-4 right-4",
                  pipPosition === "top-right" && "top-14 right-4",
                  pipPosition === "bottom-left" && "bottom-4 left-4",
                  pipPosition === "top-left" && "top-14 left-4"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-white/30 shrink-0">
                    <img src={currentSession.teacherAvatar} alt={currentSession.teacherName} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold text-white text-[11px] max-w-[80px] truncate">{currentSession.teacherName}</span>
                </div>

                <div className="flex items-center gap-1 border-l border-white/20 pl-1.5">
                  {teacherMedia?.micOn ? (
                    <Mic className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-rose-400" />
                  )}

                  {isTeacherCameraOn && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-bold">
                      Cam ON
                    </span>
                  )}

                  <button
                    onClick={cyclePipPosition}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Move position"
                  >
                    <Move className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setVideoDisplayMode("floating")}
                    className="p-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
                    title="Expand video pop-up"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Ended Notification Modal Overlay */}
      {isSessionEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-2xl shadow-indigo-950/60 ring-1 ring-white/10">
            {/* Top decorative glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-48 rounded-full bg-indigo-500/20 blur-2xl" />

            {/* Icon */}
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>

            {/* Title & Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>1:1 Classroom Concluded</span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Session Has Ended
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Your educator has closed this live session. Your learning progress and whiteboard notes have been saved.
            </p>

            {/* Countdown Badge */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-xs font-medium text-slate-400 mb-2">
                Going to home screen in
              </p>
              <div className="flex items-center justify-center gap-2 font-mono text-2xl font-black text-indigo-400">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-white animate-pulse">
                  {countdown}
                </span>
                <span className="text-sm font-sans font-medium text-slate-400">
                  {countdown === 1 ? "second" : "seconds"}...
                </span>
              </div>
            </div>

            {/* Direct Action Button */}
            <button
              onClick={() => router.push("/student/dashboard")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Go to Home Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
