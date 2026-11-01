"use client";

import type { ReactNode } from "react";
import { Maximize2, Mic, MicOff, Minimize2, Move, ScreenShare, Video as VideoIcon, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveVideoTile } from "@/components/session/LiveVideoTile";
import { cn } from "@/lib/utils";

export type VideoMode = "minimized" | "floating" | "docked";
export type PipCorner = "bottom-right" | "top-right" | "bottom-left" | "top-left";

export interface RoomParticipant {
  name: string;
  role: "Teacher" | "Student";
  avatar?: string;
  stream?: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
}

export const nextCorner = (corner: PipCorner): PipCorner =>
  corner === "bottom-right" ? "bottom-left" : corner === "bottom-left" ? "top-right" : corner === "top-right" ? "top-left" : "bottom-right";

const cornerClass: Record<PipCorner, string> = {
  "bottom-right": "bottom-4 right-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-left": "top-4 left-4",
};

/** Mic / camera / screen-share toggle: quiet when on, destructive tint when off. */
export function MediaToggle({
  kind,
  on,
  onToggle,
  size = "icon-sm",
}: {
  kind: "mic" | "camera" | "screen";
  on: boolean;
  onToggle: () => void;
  size?: "icon-sm" | "icon-xs";
}) {
  const label =
    kind === "mic"
      ? on ? "Mute microphone" : "Unmute microphone"
      : kind === "camera"
        ? on ? "Turn camera off" : "Turn camera on"
        : on ? "Stop sharing screen" : "Share screen";
  const Icon = kind === "mic" ? (on ? Mic : MicOff) : kind === "camera" ? (on ? VideoIcon : VideoOff) : ScreenShare;
  const off = kind !== "screen" && !on;
  return (
    <Button
      type="button"
      size={size}
      variant={off ? "destructive" : kind === "screen" && on ? "default" : "outline"}
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-pressed={on}
    >
      <Icon />
    </Button>
  );
}

const modeLabel: Record<VideoMode, string> = { minimized: "Video hidden", floating: "Floating video", docked: "Docked video" };

/** Cycles minimized -> floating -> docked. */
export function VideoModeButton({ mode, onChange }: { mode: VideoMode; onChange: (mode: VideoMode) => void }) {
  const next: VideoMode = mode === "docked" ? "minimized" : mode === "minimized" ? "floating" : "docked";
  const Icon = mode === "docked" ? Minimize2 : mode === "floating" ? Maximize2 : VideoIcon;
  return (
    <Button
      type="button"
      size="sm"
      variant={mode === "minimized" ? "outline" : "secondary"}
      onClick={() => onChange(next)}
      title={`${modeLabel[mode]} (click for ${modeLabel[next].toLowerCase()})`}
    >
      <Icon data-icon="inline-start" />
      <span className="hidden md:inline">{modeLabel[mode]}</span>
    </Button>
  );
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Button type="button" variant="ghost" size="icon-xs" onClick={onClick} title={label} aria-label={label}>
      {children}
    </Button>
  );
}

function tile(p: RoomParticipant, local: boolean, compact?: boolean, label?: string) {
  return (
    <LiveVideoTile
      participantName={label ?? p.name}
      roleLabel={p.role}
      isLocalUser={local}
      isCameraOn={p.cameraOn}
      isMicOn={p.micOn}
      fallbackAvatar={p.avatar}
      stream={p.stream}
      compact={compact}
    />
  );
}

interface PanelProps {
  remote: RoomParticipant;
  local: RoomParticipant;
  onMode: (mode: VideoMode) => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreen?: () => void;
  screenSharing?: boolean;
}

/** Side panel with both streams, shown when video is docked. */
export function DockedVideo({
  remote,
  local,
  onMode,
  onToggleMic,
  onToggleCamera,
  onToggleScreen,
  screenSharing,
  title,
  children,
}: PanelProps & { title: string; children?: ReactNode }) {
  return (
    <aside className="z-20 flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-b bg-card p-3 animate-in fade-in slide-in-from-left-2 duration-200 md:w-72 md:border-r md:border-b-0 lg:w-80">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <div className="flex items-center gap-0.5">
          <IconAction label="Switch to floating video" onClick={() => onMode("floating")}>
            <Move />
          </IconAction>
          <IconAction label="Hide video" onClick={() => onMode("minimized")}>
            <Minimize2 />
          </IconAction>
        </div>
      </div>
      {tile(remote, false)}
      {tile({ ...local }, true, false, `${local.name} (You)`)}
      <div className="flex items-center justify-center gap-2">
        <MediaToggle kind="mic" on={local.micOn} onToggle={onToggleMic} />
        <MediaToggle kind="camera" on={local.cameraOn} onToggle={onToggleCamera} />
        {onToggleScreen && <MediaToggle kind="screen" on={!!screenSharing} onToggle={onToggleScreen} />}
      </div>
      {children}
    </aside>
  );
}

/** Small card that floats over the board with both streams. */
export function FloatingVideo({
  remote,
  local,
  corner,
  onCorner,
  onMode,
  onToggleMic,
  onToggleCamera,
  onToggleScreen,
  screenSharing,
}: PanelProps & { corner: PipCorner; onCorner: () => void }) {
  return (
    <div
      className={cn(
        "absolute z-40 flex w-64 flex-col gap-2 rounded-xl border bg-card p-2.5 shadow-lg animate-in fade-in zoom-in-95 duration-200 sm:w-72",
        cornerClass[corner]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="truncate text-xs font-medium text-foreground">{remote.name}</span>
        <div className="flex items-center gap-0.5">
          <IconAction label="Move to another corner" onClick={onCorner}>
            <Move />
          </IconAction>
          <IconAction label="Hide video" onClick={() => onMode("minimized")}>
            <Minimize2 />
          </IconAction>
          <IconAction label="Dock video to the side" onClick={() => onMode("docked")}>
            <Maximize2 />
          </IconAction>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {tile(remote, false, true)}
        {tile(local, true, true)}
      </div>
      <div className="flex items-center justify-center gap-2">
        <MediaToggle kind="mic" on={local.micOn} onToggle={onToggleMic} size="icon-xs" />
        <MediaToggle kind="camera" on={local.cameraOn} onToggle={onToggleCamera} size="icon-xs" />
        {onToggleScreen && <MediaToggle kind="screen" on={!!screenSharing} onToggle={onToggleScreen} size="icon-xs" />}
      </div>
    </div>
  );
}

/** One-line status chip for the other person while video is hidden. */
export function MinimizedVideo({
  remote,
  corner,
  onCorner,
  onMode,
}: {
  remote: RoomParticipant;
  corner: PipCorner;
  onCorner: () => void;
  onMode: (mode: VideoMode) => void;
}) {
  return (
    <div
      className={cn(
        "absolute z-40 flex items-center gap-2 rounded-lg border bg-card py-1 pr-1 pl-2.5 text-xs shadow-md",
        cornerClass[corner]
      )}
    >
      <span className="max-w-[120px] truncate font-medium text-foreground">{remote.name}</span>
      {remote.micOn ? (
        <Mic className="size-3.5 text-muted-foreground" aria-label="Microphone on" />
      ) : (
        <MicOff className="size-3.5 text-destructive" aria-label="Microphone muted" />
      )}
      {remote.cameraOn ? (
        <VideoIcon className="size-3.5 text-muted-foreground" aria-label="Camera on" />
      ) : (
        <VideoOff className="size-3.5 text-muted-foreground" aria-label="Camera off" />
      )}
      <IconAction label="Move to another corner" onClick={onCorner}>
        <Move />
      </IconAction>
      <Button type="button" size="icon-xs" onClick={() => onMode("floating")} title="Show video" aria-label="Show video">
        <Maximize2 />
      </Button>
    </div>
  );
}
