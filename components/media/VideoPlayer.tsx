"use client";

import React, { useState } from "react";
import { Play, X, ExternalLink, Maximize2, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoInfo {
  type: "youtube" | "vimeo" | "direct" | "embed";
  url: string;
  embedUrl: string;
}

export function parseVideoUrl(url: string): VideoInfo {
  if (!url) return { type: "direct", url: "", embedUrl: "" };

  const trimmed = url.trim();

  // YouTube match
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      url: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct video file (.mp4, .webm, .ogg, .mov, etc.) or storage url
  const isDirectVideo =
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("/study-materials/") ||
    trimmed.includes("/video/");

  if (isDirectVideo) {
    return {
      type: "direct",
      url: trimmed,
      embedUrl: trimmed,
    };
  }

  // Generic embed / iframe
  return {
    type: "embed",
    url: trimmed,
    embedUrl: trimmed,
  };
}

interface VideoCardPreviewProps {
  url: string;
  title: string;
  className?: string;
  onOpenModal?: () => void;
}

export function VideoCardPreview({ url, title, className, onOpenModal }: VideoCardPreviewProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const info = parseVideoUrl(url);

  if (!url) {
    return (
      <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
        No video URL provided
      </div>
    );
  }

  if (isPlayingInline) {
    return (
      <div className={cn("relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner", className)}>
        {info.type === "direct" ? (
          <video
            src={info.embedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={info.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            title="Expand to Fullscreen Theater"
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs transition-colors z-10"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Preview / Thumbnail Card with Play Button
  return (
    <div
      onClick={() => {
        if (onOpenModal) {
          onOpenModal();
        } else {
          setIsPlayingInline(true);
        }
      }}
      className={cn(
        "group relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer flex flex-col items-center justify-center text-white transition-all hover:border-blue-500 hover:shadow-md",
        className
      )}
    >
      {/* Background Gradient / Decorative */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/50 to-slate-900/40" />

      {/* Center Play Button */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
        <Play className="w-5 h-5 ml-0.5 fill-current" />
      </div>

      <div className="relative z-10 text-center px-4 mt-2">
        <span className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
          {title || "Watch Video Lecture"}
        </span>
        <span className="text-[10px] text-blue-300 font-semibold block mt-0.5">
          Click to play video
        </span>
      </div>
    </div>
  );
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  subject?: string;
  description?: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  url,
  title,
  subject,
  description,
}: VideoModalProps) {
  if (!isOpen) return null;

  const info = parseVideoUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{title}</h3>
                {subject && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                    {subject}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open external link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Body */}
        <div className="flex-1 bg-black aspect-video w-full flex items-center justify-center overflow-hidden">
          {info.type === "direct" ? (
            <video
              src={info.embedUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={info.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>1-to-1 Study Material Video Player</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Close Video
          </button>
        </div>
      </div>
    </div>
  );
}
