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
  ScreenShare,
  PhoneOff,
  Layers,
  BookOpen,
  GraduationCap,
  Clock,
  Minimize2,
  Maximize2,
  Move,
  ChevronUp,
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
    updateSession,
    gradeSubmission,
  } = useLMS();

  // Find current session
  const currentSession = sessions.find((s) => s.id === sessionId) || activeSession;

  // Live session media controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Video Panel Display: "minimized" (pill / micro-chip) | "floating" (PiP pop-up) | "docked" (sidebar)
  const [videoDisplayMode, setVideoDisplayMode] = useState<"minimized" | "floating" | "docked">("minimized");
  const [pipPosition, setPipPosition] = useState<"bottom-right" | "top-right" | "bottom-left" | "top-left">("bottom-right");

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

  const studentMedia = currentSession?.mediaState?.[studentObj?.id || ""];
  const isStudentCameraOn = studentMedia?.cameraOn === true;

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

  const cyclePipPosition = () => {
    setPipPosition((prev) => {
      if (prev === "bottom-right") return "bottom-left";
      if (prev === "bottom-left") return "top-right";
      if (prev === "top-right") return "top-left";
      return "bottom-right";
    });
  };

  if (!currentSession || !studentObj) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Session not found.</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Streamlined Live Classroom Header (Compact 46px height) */}
      <header className="h-11 sm:h-12 px-3 sm:px-4 glass-dark flex items-center justify-between shrink-0 z-30 border-b border-white/10">
        {/* Left: 1-on-1 Status & Student Details */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-extrabold tracking-wide uppercase">1:1 Live</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight truncate max-w-[120px] sm:max-w-none">
              {studentObj.name}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
              {currentSession.subject}
            </span>
            <span className="text-[11px] text-slate-400 hidden xl:inline max-w-xs truncate">
              {currentSession.topic}
            </span>
          </div>
        </div>

        {/* Center: In-Class Screen / Board Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900/90 border border-white/10 rounded-xl shadow-inner">
          <button
            onClick={() => setWorkspaceMode("LIVE_BOARD")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
              workspaceMode === "LIVE_BOARD"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Board</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("ASSIGNMENT_VIEW")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
              workspaceMode === "ASSIGNMENT_VIEW"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assignment</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("STUDENT_SCRATCHPAD")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
              workspaceMode === "STUDENT_SCRATCHPAD"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>
        </div>

        {/* Right: Camera Panel Mode Toggle, Timer & End Session */}
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

          {/* Video Layout Toggle */}
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

          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-white/10 rounded-lg font-mono text-xs font-bold text-emerald-400">
            <Clock className="w-3 h-3" />
            <span>{formatTime(sessionElapsedSeconds)}</span>
          </div>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PhoneOff className="w-3 h-3" />
            <span className="hidden sm:inline">End Class</span>
          </button>
        </div>
      </header>

      <BoardAccess sessionId={sessionId} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Panel (Visible when DOCKED) */}
        {videoDisplayMode === "docked" && (
          <div className="w-full md:w-72 lg:w-80 bg-slate-950/85 border-r border-white/10 flex flex-col p-3 gap-3 shrink-0 overflow-y-auto z-20 backdrop-blur-md animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Video & Student</span>
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
                  title="Minimize video indicator"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Student Tile */}
            <LiveVideoTile
              participantName={studentObj.name}
              roleLabel="Student"
              isLocalUser={false}
              isCameraOn={isStudentCameraOn}
              isMicOn={studentMedia?.micOn ?? false}
              fallbackAvatar={studentObj.avatar}
            />

            {/* Floating Media Controls */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-white/10 rounded-xl shadow-md">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isMicOn
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-rose-600 text-white animate-pulse"
                )}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isCameraOn
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-rose-600 text-white animate-pulse"
                )}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isCameraOn ? <VideoIcon className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isScreenSharing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                )}
                title="Share Screen"
              >
                <ScreenShare className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Student Assessment Summary */}
            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl space-y-1.5 text-xs">
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

        {/* Right Workspace (Expands to 100% width when Video Panel is Minimized or Floating) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Top Secondary Bar (Slim 36px) */}
          <div className="px-3 py-1 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-md flex items-center justify-between shrink-0 gap-2">
            <StudentBoardSelector
              currentWhiteboardId={activeWhiteboardId}
              onSelectBoard={(id) => setActiveWhiteboardId(id)}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              isTeacherMode={true}
            />

            {/* In-Class Assignment Marking Banner if in ASSIGNMENT_VIEW */}
            {workspaceMode === "ASSIGNMENT_VIEW" && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Score:
                </span>
                <input
                  type="number"
                  value={liveGradeScore}
                  onChange={(e) => setLiveGradeScore(parseInt(e.target.value, 10) || 0)}
                  className="w-12 px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded-md text-center"
                />
                <button
                  onClick={handleSaveLiveGrade}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-2xs transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Interactive Infinite Canvas */}
          <div className="flex-1 min-h-0 w-full relative">
            <SessionWorkspace session={currentSession}>
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
            </SessionWorkspace>

            {/* 1. FLOATING VIDEO POP-UP (When Floating Mode) */}
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
                    <span>{studentObj.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Switch Corner Position */}
                    <button
                      onClick={cyclePipPosition}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Move pop-up corner"
                    >
                      <Move className="w-3 h-3" />
                    </button>

                    {/* Minimize to chip */}
                    <button
                      onClick={() => setVideoDisplayMode("minimized")}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Minimize to compact pill"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>

                    {/* Restore Docked Sidebar */}
                    <button
                      onClick={() => setVideoDisplayMode("docked")}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Dock camera to sidebar"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Stacked Video Feeds */}
                <div className="grid grid-cols-1">
                  <LiveVideoTile
                    participantName={studentObj.name}
                    roleLabel="Student"
                    isLocalUser={false}
                    isCameraOn={isStudentCameraOn}
                    isMicOn={studentMedia?.micOn ?? false}
                    fallbackAvatar={studentObj.avatar}
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

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-all",
                      isScreenSharing ? "text-indigo-400 bg-indigo-500/20" : "text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                    title="Share Screen"
                  >
                    <ScreenShare className="w-3.5 h-3.5" />
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
                    <img src={studentObj.avatar} alt={studentObj.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold text-white text-[11px] max-w-[80px] truncate">{studentObj.name}</span>
                </div>

                <div className="flex items-center gap-1 border-l border-white/20 pl-1.5">
                  {studentMedia?.micOn ? (
                    <Mic className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-rose-400" />
                  )}

                  {isStudentCameraOn && (
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

            <LiveVideoTile
              participantName={user.name}
              roleLabel="Teacher"
              isLocalUser={true}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              fallbackAvatar={currentSession.teacherAvatar}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
