"use client";

import { BoardAccess } from "@/components/session/BoardAccess";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { StudentBoardSelector } from "@/components/whiteboard/StudentBoardSelector";
import { LiveVideoTile } from "@/components/session/LiveVideoTile";
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
  BookOpen,
  GraduationCap,
  Clock,
  Circle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  Minimize2,
  Maximize2,
  Move,
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
    user,
    sessions,
    students,
    whiteboards,
    assignments,
    submissions,
    activeSession,
    sessionElapsedSeconds,
    startLiveSession,
    endLiveSession,
    updateWhiteboardElements,
    gradeSubmission,
  } = useLMS();

  // Find current session
  const currentSession = sessions.find((s) => s.id === sessionId) || activeSession;

  // Live session media controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Video Panel Minimize / Pop-up State
  const [isVideoPanelMinimized, setIsVideoPanelMinimized] = useState(false);
  const [pipPosition, setPipPosition] = useState<"bottom-right" | "top-right" | "bottom-left">("bottom-right");

  // In-Session Workspace Mode: "LIVE_BOARD" | "ASSIGNMENT_VIEW" | "STUDENT_SCRATCHPAD"
  const [workspaceMode, setWorkspaceMode] = useState<"LIVE_BOARD" | "ASSIGNMENT_VIEW" | "STUDENT_SCRATCHPAD">("LIVE_BOARD");

  // Selected student and boards
  const [selectedStudentId, setSelectedStudentId] = useState(currentSession?.studentId || "");
  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession?.whiteboardId || ""
  );

  // Assignment & live grading inside class
  const activeAssignment = assignments[0];
  const studentSubmission = submissions.find(
    (s) => s.studentId === selectedStudentId && s.assignmentId === activeAssignment?.id
  );

  const [liveGradeScore, setLiveGradeScore] = useState<number>(studentSubmission?.score || 0);
  const [liveFeedback, setLiveFeedback] = useState<string>(studentSubmission?.teacherFeedback || "");

  // Auto-start timer
  useEffect(() => {
    if (currentSession && currentSession.status === "LIVE" && !activeSession) {
      startLiveSession(sessionId);
    }
  }, [sessionId, currentSession, activeSession, startLiveSession]);

  // Determine current active whiteboard based on mode
  useEffect(() => {
    if (workspaceMode === "LIVE_BOARD") {
      setActiveWhiteboardId(currentSession?.whiteboardId || "");
    } else if (workspaceMode === "ASSIGNMENT_VIEW") {
      setActiveWhiteboardId(studentSubmission?.whiteboardId || "");
    } else {
      setActiveWhiteboardId(
        whiteboards.find((board) => board.studentId === selectedStudentId && board.category === "PRACTICE")?.id || ""
      );
    }
  }, [workspaceMode, currentSession?.whiteboardId, studentSubmission?.whiteboardId, whiteboards, selectedStudentId]);

  const currentWhiteboard =
    whiteboards.find((w) => w.id === activeWhiteboardId);

  const studentObj =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // End Session flow
  const handleEndSession = () => {
    if (
      window.confirm(
        "Are you sure you want to end this live session and proceed to the Session Report?"
      )
    ) {
      endLiveSession(sessionId);
      router.push(`/teacher/session/${sessionId}/report`);
    }
  };

  const handleSaveLiveGrade = () => {
    if (studentSubmission) {
      gradeSubmission(studentSubmission.id, liveGradeScore, liveFeedback);
      alert("Assignment marks & feedback updated successfully during live class!");
    }
  };

  if (!currentSession || !studentObj) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Session not found.</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1-to-1 Live Classroom Header (Airy Glassmorphism) */}
      <header className="h-16 px-5 glass-dark flex items-center justify-between shrink-0 z-30">
        {/* Left: 1-on-1 Status & Student Details */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-extrabold tracking-wide uppercase">1:1 Live</span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-sm font-bold text-white tracking-tight">
              {studentObj.name}
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

        {/* Center: In-Class Screen / Board Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-white/10 rounded-2xl shadow-inner">
          <button
            onClick={() => setWorkspaceMode("LIVE_BOARD")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
              workspaceMode === "LIVE_BOARD"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Live Class Board</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("ASSIGNMENT_VIEW")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
              workspaceMode === "ASSIGNMENT_VIEW"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Assignment & Homework</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("STUDENT_SCRATCHPAD")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
              workspaceMode === "STUDENT_SCRATCHPAD"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Student Scratchpad</span>
          </button>
        </div>

        {/* Right: Camera Panel Minimize Toggle, Timer & End Session */}
        <div className="flex items-center gap-3">
          {/* Minimize / Maximize Video Panel Button */}
          <button
            onClick={() => setIsVideoPanelMinimized(!isVideoPanelMinimized)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
              isVideoPanelMinimized
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-400/40 hover:bg-indigo-600/40"
                : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-800"
            )}
            title={isVideoPanelMinimized ? "Dock Video to Sidebar" : "Float Camera on Canvas (Maximize Canvas)"}
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

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl font-mono text-xs font-bold text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(sessionElapsedSeconds)}</span>
          </div>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Class</span>
          </button>
        </div>
      </header>
      <BoardAccess sessionId={sessionId} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Panel (Visible when NOT Minimized) */}
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

            {/* Teacher Tile (Real Camera) */}
            <LiveVideoTile
              participantName={`You (${user.name})`}
              roleLabel="Teacher"
              isLocalUser={true}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              fallbackAvatar={currentSession.teacherAvatar}
            />

            {/* Student Tile */}
            <LiveVideoTile
              participantName={studentObj.name}
              roleLabel="Student"
              isLocalUser={false}
              isCameraOn={true}
              isMicOn={true}
              fallbackAvatar={studentObj.avatar}
            />

            {/* Floating Media Controls */}
            <div className="flex items-center justify-center gap-2.5 p-2 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-sm",
                  isMicOn
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-rose-600 text-white animate-pulse"
                )}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-sm",
                  isCameraOn
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-rose-600 text-white animate-pulse"
                )}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isCameraOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-sm",
                  isScreenSharing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                )}
                title="Share Screen"
              >
                <ScreenShare className="w-4 h-4" />
              </button>
            </div>

            {/* Student Assessment Summary */}
            <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">{studentObj.name}</span>
                <span className="font-bold text-indigo-400">{studentObj.overallProgress}% Progress</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                "{studentObj.notes || "Mastering quadratic factorisation roots"}"
              </p>
            </div>
          </div>
        )}

        {/* Right Workspace (Expands to 100% width when Video Panel is Minimized) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Top Secondary Bar */}
          <div className="p-3 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <StudentBoardSelector
              currentWhiteboardId={activeWhiteboardId}
              onSelectBoard={(id) => setActiveWhiteboardId(id)}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              isTeacherMode={true}
            />

            {/* In-Class Assignment Marking Banner if in ASSIGNMENT_VIEW */}
            {workspaceMode === "ASSIGNMENT_VIEW" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Score:
                </span>
                <input
                  type="number"
                  value={liveGradeScore}
                  onChange={(e) => setLiveGradeScore(parseInt(e.target.value, 10) || 0)}
                  className="w-14 px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-center"
                />
                <button
                  onClick={handleSaveLiveGrade}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Save Marks
                </button>
              </div>
            )}
          </div>

          {/* Interactive Infinite Canvas */}
          <div className="flex-1 w-full h-full relative">
            <WhiteboardCanvas
              key={activeWhiteboardId}
              initialWhiteboard={currentWhiteboard}
              whiteboardId={activeWhiteboardId}
              roleLabel="Teacher"
              showTeacherTools={true}
              readOnly={!currentWhiteboard}
              onSave={(newElements, previousElements) => {
                updateWhiteboardElements(currentWhiteboard?.id || "", newElements, previousElements);
              }}
            />

            {/* FLOATING VIDEO CAMERA POP-UP ON BOARD ONLY (When Minimized) */}
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
                    {/* Switch Corner Position */}
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

                    {/* Restore Docked Sidebar */}
                    <button
                      onClick={() => setIsVideoPanelMinimized(false)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Dock camera back to side panel"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Compact Stacked Video Feeds (Clean, Non-overlapping) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <LiveVideoTile
                    participantName={user.name + " (You)"}
                    roleLabel="Teacher"
                    isLocalUser={true}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    fallbackAvatar={currentSession.teacherAvatar}
                    compact={true}
                    className="aspect-video rounded-2xl"
                  />
                  <LiveVideoTile
                    participantName={studentObj.name}
                    roleLabel="Student"
                    isLocalUser={false}
                    isCameraOn={true}
                    isMicOn={true}
                    fallbackAvatar={studentObj.avatar}
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

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={cn(
                      "p-2 rounded-xl text-xs transition-all",
                      isScreenSharing ? "text-indigo-400 bg-indigo-500/20" : "text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                    title="Share Screen"
                  >
                    <ScreenShare className="w-4 h-4" />
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
