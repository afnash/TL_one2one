"use client";

import { BoardAccess } from "@/components/session/BoardAccess";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { SessionWorkspace } from "@/components/session/SessionWorkspace";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowRight, Clock, Home, PhoneOff } from "lucide-react";

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
  const [videoDisplayMode, setVideoDisplayMode] = useState<VideoMode>("minimized");
  const [pipPosition, setPipPosition] = useState<PipCorner>("bottom-right");

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

  const handleLeaveSession = () => router.push("/student/dashboard");

  if (!currentSession) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Session not found.</div>;
  }

  const remote: RoomParticipant = {
    name: currentSession.teacherName,
    role: "Teacher",
    avatar: currentSession.teacherAvatar,
    stream: remoteStream,
    cameraOn: isTeacherCameraOn,
    micOn: !!(teacherMedia?.micOn || remoteMediaState.micOn),
  };
  const local: RoomParticipant = {
    name: user.name,
    role: "Student",
    avatar: user.avatar || currentSession.studentAvatar,
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
            <p className="truncate text-sm font-medium leading-tight text-foreground">
              {currentSession.subject}
              {currentSession.topic ? ` · ${currentSession.topic}` : ""}
            </p>
            <p className="truncate text-xs leading-tight text-muted-foreground">with {currentSession.teacherName}</p>
          </div>
        </div>

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
              <Button size="sm" variant="outline">
                <PhoneOff data-icon="inline-start" />
                <span className="hidden sm:inline">Leave lesson</span>
              </Button>
            }
            title="Leave this lesson?"
            description="You can rejoin while the lesson is still live."
            confirmLabel="Leave"
            onConfirm={handleLeaveSession}
          />
        </div>
      </header>

      <BoardAccess sessionId={sessionId} />

      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {videoDisplayMode === "docked" && <DockedVideo {...panel} title="Video" />}

        <div className="relative flex flex-1 flex-col overflow-hidden bg-card">
          <div className="relative min-h-0 w-full flex-1">
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

            {videoDisplayMode === "floating" && <FloatingVideo {...panel} corner={pipPosition} onCorner={cyclePipPosition} />}
            {videoDisplayMode === "minimized" && (
              <MinimizedVideo remote={remote} corner={pipPosition} onCorner={cyclePipPosition} onMode={setVideoDisplayMode} />
            )}
          </div>
        </div>
      </div>

      {isSessionEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-xl">This session has ended</CardTitle>
              <CardDescription>
                Your teacher ended the lesson. Your whiteboard notes have been saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Going to your dashboard in <span className="font-medium tabular-nums text-foreground">{countdown}</span>{" "}
                {countdown === 1 ? "second" : "seconds"}
              </p>
              <Button className="w-full" onClick={() => router.push("/student/dashboard")}>
                <Home data-icon="inline-start" />
                Go to dashboard
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
