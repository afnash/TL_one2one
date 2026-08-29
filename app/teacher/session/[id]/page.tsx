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
  ScreenShare,
  PhoneOff,
  Layers,
  Sparkles,
  Users,
  Settings,
  Maximize2,
  CheckCircle2,
  Clock,
  Circle,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeacherLiveSessionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const {
    sessions,
    students,
    whiteboards,
    activeSession,
    sessionElapsedSeconds,
    startLiveSession,
    endLiveSession,
    updateWhiteboardElements,
  } = useLMS();

  // Find or initialize session
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

  // State for live session media controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isStudentBoardsDrawerOpen, setIsStudentBoardsDrawerOpen] = useState(false);

  // Selected student & whiteboard inside the classroom
  const [selectedStudentId, setSelectedStudentId] = useState(currentSession.studentId || "s1");
  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession.whiteboardId || "wb-live-math-rahul"
  );

  // Auto-start timer if not already running
  useEffect(() => {
    if (!activeSession) {
      startLiveSession(sessionId);
    }
  }, [sessionId, activeSession, startLiveSession]);

  const currentWhiteboard =
    whiteboards.find((w) => w.id === activeWhiteboardId) || whiteboards[0];

  const studentObj =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // End Session flow
  const handleEndSession = () => {
    if (
      window.confirm(
        "Are you sure you want to end this live session and proceed to the Session Report?"
      )
    ) {
      const summary = endLiveSession(sessionId);
      router.push(`/teacher/session/${sessionId}/report`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1-to-1 Live Classroom Header */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        {/* Left: Student info & topic */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">1:1 LIVE CLASS</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {studentObj.name}
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

        {/* Center: Live Timer & Recording Indicator */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
            <Circle className="w-2.5 h-2.5 fill-rose-500 animate-ping" />
            <span>REC</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(sessionElapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Student Boards Drawer Toggle & End Session Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudentBoardsDrawerOpen(!isStudentBoardsDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Student Boards</span>
          </button>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left / Top: Mock Video Area (Teacher Camera + Student Camera) */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col p-3 gap-3 shrink-0 overflow-y-auto">
          {/* Teacher Video Tile */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md group">
            {isCameraOn ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                <img
                  src={currentSession.teacherAvatar}
                  alt={currentSession.teacherName}
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Simulated active speaker wave */}
                {isMicOn && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-md">
                    <div className="w-1 h-3 bg-emerald-400 audio-bar rounded-full" />
                    <div className="w-1 h-4 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1 h-2 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.4s" }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold mb-2">
                  AT
                </div>
                <span className="text-xs">Camera Off</span>
              </div>
            )}

            {/* Name Tag */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>You (Alex Thomas)</span>
              <span className="text-[10px] text-indigo-400">Teacher</span>
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1">
              {!isMicOn && (
                <div className="p-1 rounded bg-rose-500/80 text-white">
                  <MicOff className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Student Video Tile */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
              <img
                src={studentObj.avatar}
                alt={studentObj.name}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-slate-950/70 backdrop-blur-xs px-2 py-1 rounded-md">
                <div className="w-1 h-2 bg-emerald-400 audio-bar rounded-full" />
                <div className="w-1 h-3.5 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.3s" }} />
                <div className="w-1 h-1.5 bg-emerald-400 audio-bar rounded-full" style={{ animationDelay: "0.1s" }} />
              </div>
            </div>

            <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>{studentObj.name}</span>
              <span className="text-[10px] text-emerald-400">Student</span>
            </div>

            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded text-[10px] font-bold text-emerald-400">
              HD 60fps
            </div>
          </div>

          {/* Video Control Bar */}
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

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                isScreenSharing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              )}
              title="Share Screen"
            >
              <ScreenShare className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Active Student Summary */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Student Progress</span>
              <span className="font-bold text-white">{studentObj.overallProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${studentObj.overallProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 italic">
              "{studentObj.notes || "Ready for quadratic roots factorisation"}"
            </p>
          </div>
        </div>

        {/* Right / Center: Collaborative Infinite Whiteboard Workspace */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Top Classroom Bar: Board Switcher */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <StudentBoardSelector
              currentWhiteboardId={activeWhiteboardId}
              onSelectBoard={(id) => setActiveWhiteboardId(id)}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              isTeacherMode={true}
            />

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Live Sync Active
              </span>
            </div>
          </div>

          {/* Infinite Whiteboard Canvas Engine */}
          <div className="flex-1 w-full h-full relative">
            <WhiteboardCanvas
              key={activeWhiteboardId}
              initialWhiteboard={currentWhiteboard}
              whiteboardId={activeWhiteboardId}
              roleLabel="Teacher"
              showTeacherTools={true}
              onSave={(newElements) => {
                updateWhiteboardElements(activeWhiteboardId, newElements);
              }}
            />
          </div>
        </div>

        {/* Student Boards Inspection Flyout Panel */}
        {isStudentBoardsDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Boards Inspector</h3>
                <p className="text-xs text-slate-500">View & annotate student work live</p>
              </div>
              <button
                onClick={() => setIsStudentBoardsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {students.map((st) => {
                const bds = whiteboards.filter((w) => w.studentId === st.id);
                return (
                  <div key={st.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-500">{st.grade}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {bds.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setActiveWhiteboardId(b.id);
                            setIsStudentBoardsDrawerOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors",
                            b.id === activeWhiteboardId
                              ? "bg-indigo-600 text-white font-bold"
                              : "bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200"
                          )}
                        >
                          <span className="truncate">{b.title}</span>
                          <span className="text-[10px] opacity-75">{b.elements.length} items</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
