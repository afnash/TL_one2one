"use client";

import { BoardAccess } from "@/components/session/BoardAccess";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { SessionWorkspace } from "@/components/session/SessionWorkspace";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
import { LiveVideoTile } from "@/components/session/LiveVideoTile";
import { formatTime } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Clock,
  Circle,
  ShieldCheck,
  Sparkles,
  BookOpen,
  GraduationCap,
  Minimize2,
  Maximize2,
  Move,
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
    updateWhiteboardElements,
  } = useLMS();

  const currentSession = sessions.find((s) => s.id === sessionId) || activeSession;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVideoPanelMinimized, setIsVideoPanelMinimized] = useState(false);
  const [pipPosition, setPipPosition] = useState<"bottom-right" | "top-right" | "bottom-left">("bottom-right");

  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession?.whiteboardId || ""
  );

  useEffect(() => {
    if (currentSession && currentSession.status === "LIVE" && !activeSession) {
      startLiveSession(sessionId);
    }
  }, [sessionId, currentSession, activeSession, startLiveSession]);

  const currentWhiteboard =
    whiteboards.find((w) => w.id === (activeWhiteboardId || currentSession?.whiteboardId));

  const handleLeaveSession = () => {
    if (window.confirm("Are you sure you want to leave the live classroom?")) {
      router.push("/student/dashboard");
    }
  };

  if (!currentSession) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Session not found.</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Student Classroom Header (Glassmorphic) */}
      <header className="h-16 px-5 glass-dark flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-extrabold tracking-wide uppercase">1:1 Live</span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-sm font-bold text-white tracking-tight">
              Educator: {currentSession.teacherName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentSession.subject}
            </span>
            <span className="text-xs text-slate-400 hidden lg:inline max-w-sm truncate">
              {currentSession.topic}
            </span>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl font-mono text-xs font-bold text-emerald-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(sessionElapsedSeconds)}</span>
        </div>

        {/* Right: Camera Minimize & Leave Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsVideoPanelMinimized(!isVideoPanelMinimized)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
              isVideoPanelMinimized
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-400/40 hover:bg-indigo-600/40"
                : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
            )}
            title={isVideoPanelMinimized ? "Dock Video to Sidebar" : "Float Camera on Canvas"}
          >
            {isVideoPanelMinimized ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dock Video</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Float Video (PiP)</span>
              </>
            )}
          </button>

          <button
            onClick={handleLeaveSession}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </div>
      </header>
      <BoardAccess sessionId={sessionId} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Video Panel (When not minimized) */}
        {!isVideoPanelMinimized && (
          <div className="w-full md:w-84 lg:w-92 bg-slate-950/80 border-r border-white/10 flex flex-col p-4 gap-4 shrink-0 overflow-y-auto z-10 backdrop-blur-md animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Device preview</span>
              <button
                onClick={() => setIsVideoPanelMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimize video to floating board pop-up"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Teacher Stream */}
            <LiveVideoTile
              participantName={currentSession.teacherName}
              roleLabel="Teacher"
              isLocalUser={false}
              isCameraOn={true}
              isMicOn={true}
              fallbackAvatar={currentSession.teacherAvatar}
            />

            {/* Student Self Stream (Real Camera) */}
            <LiveVideoTile
              participantName={`You (${currentSession.studentName})`}
              roleLabel="Student"
              isLocalUser={true}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              fallbackAvatar={currentSession.studentAvatar}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-2.5 p-2 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-sm",
                  isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white animate-pulse"
                )}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-sm",
                  isCameraOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-rose-600 text-white animate-pulse"
                )}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isCameraOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Right: Collaborative Infinite Canvas */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-3 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <StudentBoardSelector
              currentWhiteboardId={activeWhiteboardId}
              onSelectBoard={(id) => setActiveWhiteboardId(id)}
              selectedStudentId={user.id}
              isTeacherMode={false}
            />

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Shared Live Canvas
            </span>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <SessionWorkspace session={currentSession}>
              <WhiteboardCanvas
                    readOnly={currentWhiteboard?.category === "LIVE_CLASS" && (currentSession.status !== "LIVE" || ((currentSession.studentIds?.length || 1) > 1 && !currentSession.writerIds?.includes(user.id)))}
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

            {/* FLOATING VIDEO CAMERA POP-UP ON BOARD (When Minimized) */}
            {isVideoPanelMinimized && (
              <div
                className={cn(
                  "absolute z-40 p-3 glass-dark rounded-3xl shadow-2xl border border-white/20 flex flex-col gap-2.5 animate-in zoom-in-95 duration-150 backdrop-blur-xl",
                  pipPosition === "bottom-right" && "bottom-6 right-6 w-80 sm:w-92",
                  pipPosition === "top-right" && "top-20 right-6 w-80 sm:w-92",
                  pipPosition === "bottom-left" && "bottom-6 left-6 w-80 sm:w-92"
                )}
              >
                {/* Pop-up Drag / Control Bar */}
                <div className="flex items-center justify-between px-1.5 py-0.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live 1:1 Camera Pop-up</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setPipPosition((prev) =>
                          prev === "bottom-right"
                            ? "top-right"
                            : prev === "top-right"
                            ? "bottom-left"
                            : "bottom-right"
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Move pop-up position"
                    >
                      <Move className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsVideoPanelMinimized(false)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Dock camera back to side panel"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Compact Stacked Video Feeds */}
                <div className="grid grid-cols-2 gap-2.5">
                  <LiveVideoTile
                    participantName={currentSession.teacherName}
                    roleLabel="Teacher"
                    isLocalUser={false}
                    isCameraOn={true}
                    isMicOn={true}
                    fallbackAvatar={currentSession.teacherAvatar}
                    compact={true}
                    className="aspect-video rounded-2xl"
                  />
                  <LiveVideoTile
                    participantName={user.name + " (You)"}
                    roleLabel="Student"
                    isLocalUser={true}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    fallbackAvatar={currentSession.studentAvatar}
                    compact={true}
                    className="aspect-video rounded-2xl"
                  />
                </div>

                {/* Compact Controls */}
                <div className="flex items-center justify-around px-3 py-1.5 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={cn(
                      "p-2 rounded-xl text-xs transition-all",
                      isMicOn ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-rose-500 bg-rose-500/10"
                    )}
                    title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={cn(
                      "p-2 rounded-xl text-xs transition-all",
                      isCameraOn ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-rose-500 bg-rose-500/10"
                    )}
                    title={isCameraOn ? "Turn Cam Off" : "Turn Cam On"}
                  >
                    {isCameraOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
