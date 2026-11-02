"use client";

import { BoardAccess } from "@/components/session/BoardAccess";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { SessionWorkspace } from "@/components/session/SessionWorkspace";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DockedVideo,
  FloatingVideo,
  MediaToggle,
  MinimizedVideo,
  VideoModeButton,
  nextCorner,
  type PipCorner,
  type RoomParticipant,
  type VideoMode,
} from "@/components/session/RoomVideo";
import { useWebRTC } from "@/lib/webrtc";
import { formatTime } from "@/lib/utils";
import { BookOpen, Clock, GraduationCap, Layers, PhoneOff } from "lucide-react";

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
    waitForSaves,
  } = useLMS();

  // Find current session
  const currentSession = sessions.find((s) => s.id === sessionId) || activeSession;

  // Live session media controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Video Panel Display: "minimized" (pill / micro-chip) | "floating" (PiP pop-up) | "docked" (sidebar)
  const [videoDisplayMode, setVideoDisplayMode] = useState<VideoMode>("minimized");
  const [pipPosition, setPipPosition] = useState<PipCorner>("bottom-right");

  // In-Session Workspace Mode: "LIVE_BOARD" | "ASSIGNMENT_VIEW" | "STUDENT_SCRATCHPAD"
  const [workspaceMode, setWorkspaceMode] = useState<"LIVE_BOARD" | "ASSIGNMENT_VIEW" | "STUDENT_SCRATCHPAD">("LIVE_BOARD");

  // Selected student and boards
  const [selectedStudentId, setSelectedStudentId] = useState(currentSession?.studentId || "");
  const [activeWhiteboardId, setActiveWhiteboardId] = useState(
    currentSession?.whiteboardId || ""
  );

  // Assignment & live grading inside class
  const studentSubmission = [...submissions]
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))
    .find((s) => s.studentId === selectedStudentId && assignments.some((a) => a.id === s.assignmentId));
  const [gradeSaved, setGradeSaved] = useState(false);
  const [gradeError, setGradeError] = useState("");

  const [liveGradeScore, setLiveGradeScore] = useState<number>(studentSubmission?.score || 0);
  useEffect(() => {
    setLiveGradeScore(studentSubmission?.score || 0);
    setGradeSaved(false);
    setGradeError("");
  }, [studentSubmission?.id, studentSubmission?.score]);

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

  const {
    localStream,
    remoteStream,
    remoteMediaState,
  } = useWebRTC({
    sessionId,
    userId: user.id,
    isInitiator: true,
    isCameraOn,
    isMicOn,
  });

  const studentMedia = currentSession?.mediaState?.[studentObj?.id || ""];
  const isStudentCameraOn = studentMedia?.cameraOn === true || remoteMediaState.cameraOn;

  // End Session flow
  const handleEndSession = () => {
    endLiveSession(sessionId);
    router.push(`/teacher/session/${sessionId}/report`);
  };

  const handleSaveLiveGrade = async () => {
    if (!studentSubmission) return;
    if (liveGradeScore < 0 || liveGradeScore > studentSubmission.maxScore) {
      setGradeError(`Enter a score between 0 and ${studentSubmission.maxScore}.`);
      return;
    }
    setGradeError("");
    gradeSubmission(studentSubmission.id, liveGradeScore, studentSubmission.teacherFeedback ?? "");
    try {
      await waitForSaves();
      setGradeSaved(true);
    } catch (cause) {
      setGradeError(cause instanceof Error ? cause.message : "Could not save the score.");
    }
  };

  if (!currentSession || !studentObj) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Session not found.</div>;
  }

  const remote: RoomParticipant = {
    name: studentObj.name,
    role: "Student",
    avatar: studentObj.avatar,
    stream: remoteStream,
    cameraOn: isStudentCameraOn,
    micOn: !!(studentMedia?.micOn || remoteMediaState.micOn),
  };
  const local: RoomParticipant = {
    name: user.name,
    role: "Teacher",
    avatar: currentSession.teacherAvatar,
    stream: localStream,
    cameraOn: isCameraOn,
    micOn: isMicOn,
  };
  const panel = {
    remote,
    local,
    onMode: setVideoDisplayMode,
    onToggleMic: () => setIsMicOn((v) => !v),
    onToggleCamera: () => setIsCameraOn((v) => !v),
    onToggleScreen: () => setIsScreenSharing((v) => !v),
    screenSharing: isScreenSharing,
  };
  const cyclePipPosition = () => setPipPosition(nextCorner);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-card px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            Live
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight text-foreground">{studentObj.name}</p>
            <p className="truncate text-xs leading-tight text-muted-foreground">
              {currentSession.subject}
              {currentSession.topic ? ` · ${currentSession.topic}` : ""}
            </p>
          </div>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={workspaceMode}
          onValueChange={(value) => value && setWorkspaceMode(value as typeof workspaceMode)}
          aria-label="Workspace"
        >
          <ToggleGroupItem value="LIVE_BOARD" aria-label="Live board">
            <GraduationCap />
            <span className="hidden sm:inline">Live board</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="ASSIGNMENT_VIEW" aria-label="Assignment">
            <BookOpen />
            <span className="hidden sm:inline">Assignment</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="STUDENT_SCRATCHPAD" aria-label="Scratchpad">
            <Layers />
            <span className="hidden sm:inline">Scratchpad</span>
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted-foreground">
            <Clock className="size-3.5" />
            {formatTime(sessionElapsedSeconds)}
          </span>
          <MediaToggle kind="mic" on={isMicOn} onToggle={panel.onToggleMic} />
          <MediaToggle kind="camera" on={isCameraOn} onToggle={panel.onToggleCamera} />
          <VideoModeButton mode={videoDisplayMode} onChange={setVideoDisplayMode} />
          <ConfirmAction
            trigger={
              <Button size="sm" variant="destructive">
                <PhoneOff data-icon="inline-start" />
                <span className="hidden sm:inline">End lesson</span>
              </Button>
            }
            title="End this lesson?"
            description="The lesson closes for your student and you'll move on to the session report."
            confirmLabel="End lesson"
            onConfirm={handleEndSession}
          />
        </div>
      </header>

      <BoardAccess sessionId={sessionId} />

      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {videoDisplayMode === "docked" && (
          <DockedVideo {...panel} title="Video and student">
            <div className="rounded-lg border bg-background p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{studentObj.name}</span>
                <span className="text-muted-foreground">{studentObj.overallProgress}% progress</span>
              </div>
              {studentObj.notes && <p className="mt-1.5 text-muted-foreground">{studentObj.notes}</p>}
            </div>
          </DockedVideo>
        )}

        <div className="relative flex flex-1 flex-col overflow-hidden bg-card">
          {workspaceMode === "ASSIGNMENT_VIEW" && (
            <div className="flex shrink-0 items-center justify-end gap-2 border-b bg-muted/40 px-3 py-1.5">
              {!studentSubmission && <p className="mr-auto text-xs text-muted-foreground">No assignment from {studentObj.name} to mark yet.</p>}
              {studentSubmission && <p className="mr-auto truncate text-xs text-muted-foreground">{studentSubmission.assignmentTitle}</p>}
              {gradeError && <p role="alert" className="text-xs text-destructive">{gradeError}</p>}
              {gradeSaved && <p role="status" className="text-xs text-muted-foreground">Saved</p>}
              {studentSubmission && <label htmlFor="live-score" className="hidden text-xs font-medium text-foreground sm:inline">
                Score
              </label>}
              {studentSubmission && <Input
                id="live-score"
                type="number"
                min={0}
                max={studentSubmission?.maxScore}
                value={liveGradeScore}
                onChange={(e) => setLiveGradeScore(parseInt(e.target.value, 10) || 0)}
                className="h-7 w-16 text-center text-xs"
              />}
              {studentSubmission && <Button size="sm" onClick={handleSaveLiveGrade}>
                Save
              </Button>}
            </div>
          )}

          <div className="relative min-h-0 w-full flex-1">
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

            {videoDisplayMode === "floating" && <FloatingVideo {...panel} corner={pipPosition} onCorner={cyclePipPosition} />}
            {videoDisplayMode === "minimized" && (
              <MinimizedVideo remote={remote} corner={pipPosition} onCorner={cyclePipPosition} onMode={setVideoDisplayMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
