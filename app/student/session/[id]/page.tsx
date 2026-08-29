"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
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
  Layers,
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
    sessions,
    whiteboards,
    activeSession,
    sessionElapsedSeconds,
    startLiveSession,
    updateWhiteboardElements,
  } = useLMS();

  const currentSession =
    sessions.find((s) => s.id === sessionId) ||
    activeSession || {
      id: sessionId,
      teacherId: "t1",
      teacherName: "Alex Thomas",
      teacherAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      studentId: "s1",
      studentName: "Rahul Menon",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      subject: "Mathematics",
      topic: "Quadratic Equations — Roots & Factorisation",
      date: new Date().toISOString().split("T")[0],
      scheduledTime: "04:00 PM",
      durationMinutes: 60,
      status: "LIVE" as const,
      whiteboardId: "wb-live-math-rahul",
    };

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession.whiteboardId || "wb-live-math-rahul"
  );

  useEffect(() => {
    if (!activeSession) {
      startLiveSession(sessionId);
    }
  }, [sessionId, activeSession, startLiveSession]);

  const currentWhiteboard =
    whiteboards.find((w) => w.id === activeWhiteboardId) || whiteboards[0];

  const handleLeaveSession = () => {
    if (window.confirm("Are you sure you want to leave the live classroom?")) {
      router.push("/student/dashboard");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Student Classroom Header */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">1:1 LIVE CLASS</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              Educator: {currentSession.teacherName}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentSession.subject}
            </span>
            <span className="text-xs text-slate-400 hidden md:inline truncate max-w-xs">
              {currentSession.topic}
            </span>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
            <Circle className="w-2.5 h-2.5 fill-rose-500 animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(sessionElapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Leave Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLeaveSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Class</span>
          </button>
        </div>
      </header>

      {/* Main Classroom Split Screen */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Video Tiles (Teacher & Student) */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col p-3 gap-3 shrink-0 overflow-y-auto">
          {/* Teacher Tile (Prominent) */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
              <img
                src={currentSession.teacherAvatar}
                alt={currentSession.teacherName}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-md">
                <div className="w-1 h-3 bg-emerald-400 audio-bar rounded-full" />
                <div className="w-1 h-4 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.2s" }} />
                <div className="w-1 h-2 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>

            <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>{currentSession.teacherName}</span>
              <span className="text-[10px] text-indigo-400">Teacher</span>
            </div>

            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded text-[10px] font-bold text-emerald-400">
              HD 60fps
            </div>
          </div>

          {/* Student Tile (Self) */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
            {isCameraOn ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                <img
                  src={currentSession.studentAvatar}
                  alt={currentSession.studentName}
                  className="w-full h-full object-cover opacity-90"
                />
                {isMicOn && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-md">
                    <div className="w-1 h-2 bg-emerald-400 audio-bar rounded-full" />
                    <div className="w-1 h-3.5 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.3s" }} />
                    <div className="w-1 h-1.5 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.1s" }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold mb-2">
                  RM
                </div>
                <span className="text-xs">Camera Off</span>
              </div>
            )}

            <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>You (Rahul Menon)</span>
              <span className="text-[10px] text-emerald-400">Student</span>
            </div>
          </div>

          {/* Media Control Bar */}
          <div className="flex items-center justify-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                isMicOn ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-rose-600 text-white"
              )}
              title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                isCameraOn ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-rose-600 text-white"
              )}
              title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isCameraOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right: Collaborative Infinite Whiteboard Canvas */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <StudentBoardSelector
              currentWhiteboardId={activeWhiteboardId}
              onSelectBoard={(id) => setActiveWhiteboardId(id)}
              selectedStudentId="s1"
              isTeacherMode={false}
            />

            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Shared Live Board
            </span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <WhiteboardCanvas
              key={activeWhiteboardId}
              initialWhiteboard={currentWhiteboard}
              whiteboardId={activeWhiteboardId}
              roleLabel="Student"
              showTeacherTools={false}
              onSave={(newElements) => {
                updateWhiteboardElements(activeWhiteboardId, newElements);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
