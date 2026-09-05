"use client";

import { uploadMaterial, safeResourceUrl } from "@/lib/supabase";
import React, { useState, useRef } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { StudyMaterial } from "@/types";
import { VideoCardPreview, VideoPlayerModal, parseVideoUrl } from "@/components/media/VideoPlayer";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Video,
  Download,
  Trash2,
  Play,
  Eye,
  Search,
  CheckCircle2,
  ExternalLink,
  Upload,
  File,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherMaterialsPage() {
  const { materials, subjects, addStudyMaterial, deleteStudyMaterial } = useLMS();

  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTab, setUploadTab] = useState<"FILE" | "LINK">("FILE");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Video Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
  } | null>(null);

  // Active Document / PDF Modal State
  const [activeDocModal, setActiveDocModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
    type?: string;
  } | null>(null);

  // New material form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.name || "Mathematics");
  const [type, setType] = useState<StudyMaterial["type"]>("PDF");
  const [resourceUrl, setResourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [description, setDescription] = useState("");

  const filteredMaterials = materials.filter((m) =>
    selectedSubject === "ALL" ? true : m.subject === selectedSubject
  );

  // Auto detect video or PDF when typing/pasting url or selecting file
  const handleResourceUrlChange = (val: string) => {
    setResourceUrl(val);
    if (val.includes("youtube.com") || val.includes("youtu.be") || val.includes("vimeo.com") || val.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
      setType("VIDEO");
    } else if (val.match(/\.pdf(\?.*)?$/i)) {
      setType("PDF");
    }
  };

  const handleFileSelected = (f: File | null) => {
    setFile(f);
    if (f) {
      // Auto-populate clean title if empty or default
      if (!title || title.trim() === "") {
        const cleanBase = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanBase.charAt(0).toUpperCase() + cleanBase.slice(1));
      }

      if (f.type.startsWith("video/")) {
        setType("VIDEO");
      } else if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
        setType("PDF");
      } else if (f.type.startsWith("image/")) {
        setType("IMAGE");
      } else {
        setType("DOC");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (uploadTab === "FILE" && !file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (uploadTab === "LINK" && !resourceUrl.trim()) {
      setUploadError("Please enter a valid resource or video URL.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const url = file ? await uploadMaterial(file) : safeResourceUrl(resourceUrl);
      addStudyMaterial({
        title: title.trim(),
        subject: subject || (subjects[0]?.name ?? "Mathematics"),
        type,
        size: file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : (type === "VIDEO" ? "Video Stream" : "Web Resource"),
        sizeBytes: file?.size || 0,
        url,
        description: description.trim(),
        assignedTo: "ALL",
      });

      setTitle("");
      setDescription("");
      setIsUploadModalOpen(false);
      setFile(null);
      setResourceUrl("");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell
      headerTitle="Study Materials & Resources"
      headerSubtitle="Upload, organize by subject, and share PDF notes, video lectures, and practice sheets"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Top Filter & Upload Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
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

          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadError("");
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((m) => {
            const isVideo = m.type === "VIDEO" || m.url.includes("youtube") || m.url.includes("youtu.be") || m.url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
            const isPDF = m.type === "PDF" || m.url.match(/\.pdf(\?.*)?$/i);

            return (
              <div
                key={m.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badge & Type */}
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2.5 rounded-xl font-bold", isVideo ? "bg-blue-50 text-blue-600" : isPDF ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-700")}>
                      {isVideo ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {m.type} • {m.size}
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
                    {m.downloadsCount} downloads
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => deleteStudyMaterial(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

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
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Video</span>
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
                          onClick={() => window.open(safeResourceUrl(m.url), "_blank", "noopener,noreferrer")}
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

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Study Material</h3>
                  <p className="text-xs text-slate-500">Share notes, PDFs, assignments, or video links with your students</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setUploadTab("FILE");
                    setUploadError("");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all",
                    uploadTab === "FILE"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File (PDF/Doc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUploadTab("LINK");
                    setUploadError("");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all",
                    uploadTab === "LINK"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Video / Web Link</span>
                </button>
              </div>

              <form onSubmit={handleCreateMaterial} className="space-y-4 pt-1">
                {uploadTab === "FILE" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Document or Media File <span className="text-rose-500">*</span>
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
                        isDragging
                          ? "border-blue-500 bg-blue-50/50"
                          : file
                          ? "border-emerald-400 bg-emerald-50/30"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300"
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.webm,.txt"
                        onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                        className="hidden"
                      />

                      {file ? (
                        <div className="flex items-center gap-3 text-left w-full p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <File className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to browse or drag & drop files here
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Supports PDF, Word (DOC/DOCX), PowerPoint, Images, MP4 (Up to 50 MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Paste Video / YouTube / Resource URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={resourceUrl}
                      onChange={(e) => handleResourceUrlChange(e.target.value)}
                      required={uploadTab === "LINK"}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/notes.pdf"
                      className="block border border-slate-200 rounded-xl w-full p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      YouTube, Vimeo, and video stream links will be playable directly in the student viewer.
                    </p>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {uploadError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quadratic Equations Summary Notes"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      {subjects.length > 0 ? (
                        subjects.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="VIDEO">Video Lecture</option>
                      <option value="DOC">Notes (DOCX / PPT)</option>
                      <option value="IMAGE">Infographic / Diagram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description & Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide overview, key topics, or instructions for students..."
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploading ? "Uploading & Sharing..." : "Upload & Share Material"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global Video Player Modal */}
        <VideoPlayerModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          url={activeVideoModal?.url || ""}
          title={activeVideoModal?.title || ""}
          subject={activeVideoModal?.subject}
          description={activeVideoModal?.description}
        />

        {/* Global PDF / Document Viewer Modal */}
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
