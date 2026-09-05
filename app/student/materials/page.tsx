"use client";

import { safeResourceUrl } from "@/lib/supabase";
import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { VideoCardPreview, VideoPlayerModal } from "@/components/media/VideoPlayer";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import { FolderOpen, FileText, Video, Download, Play, Eye, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentMaterialsPage() {
  const { materials, subjects } = useLMS();
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  // Active Video Modal State for Student
  const [activeVideoModal, setActiveVideoModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
  } | null>(null);

  // Active Document / PDF Modal State for Student
  const [activeDocModal, setActiveDocModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
    type?: string;
  } | null>(null);

  const filteredMaterials = materials.filter((m) =>
    selectedSubject === "ALL" ? true : m.subject === selectedSubject
  );

  return (
    <AppShell
      headerTitle="Study Materials & Notes"
      headerSubtitle="View PDF notes, watch video lectures, and access practice sheets assigned by your teacher"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
          <button
            onClick={() => setSelectedSubject("ALL")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
              selectedSubject === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All Resources ({materials.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.name)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
                selectedSubject === sub.name
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((m) => {
            const isVideo =
              m.type === "VIDEO" ||
              m.url.includes("youtube") ||
              m.url.includes("youtu.be") ||
              m.url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
            const isPDF = m.type === "PDF" || m.url.match(/\.pdf(\?.*)?$/i);

            return (
              <div
                key={m.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl font-bold",
                        isVideo
                          ? "bg-blue-50 text-blue-600"
                          : isPDF
                          ? "bg-rose-50 text-rose-600"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {isVideo ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {isVideo ? "VIDEO" : m.type} • {m.size}
                    </span>
                  </div>

                  {/* Playable Video Card Preview */}
                  {isVideo && (
                    <div className="my-1">
                      <VideoCardPreview
                        url={m.url}
                        title={m.title}
                        onOpenModal={() =>
                          setActiveVideoModal({
                            url: m.url,
                            title: m.title,
                            subject: m.subject,
                            description: m.description,
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                    <span className="text-[11px] font-semibold text-blue-600">{m.subject}</span>
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Uploaded: {m.uploadDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isVideo ? (
                      <button
                        onClick={() =>
                          setActiveVideoModal({
                            url: m.url,
                            title: m.title,
                            subject: m.subject,
                            description: m.description,
                          })
                        }
                        className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Video</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setActiveDocModal({
                              url: m.url,
                              title: m.title,
                              subject: m.subject,
                              description: m.description,
                              type: m.type,
                            })
                          }
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPDF ? "View PDF" : "View"}</span>
                        </button>

                        <button
                          onClick={() =>
                            window.open(safeResourceUrl(m.url), "_blank", "noopener,noreferrer")
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download / Open File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Player Modal for Student */}
        <VideoPlayerModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          url={activeVideoModal?.url || ""}
          title={activeVideoModal?.title || ""}
          subject={activeVideoModal?.subject}
          description={activeVideoModal?.description}
        />

        {/* PDF / Document Viewer Modal for Student */}
        <PDFViewerModal
          isOpen={!!activeDocModal}
          onClose={() => setActiveDocModal(null)}
          url={activeDocModal?.url || ""}
          title={activeDocModal?.title || ""}
          subject={activeDocModal?.subject}
          description={activeDocModal?.description}
          type={activeDocModal?.type}
        />
      </div>
    </AppShell>
  );
}
