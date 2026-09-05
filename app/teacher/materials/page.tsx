"use client";

import { uploadMaterial, safeResourceUrl } from "@/lib/supabase";
import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { StudyMaterial } from "@/types";
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Video,
  Download,
  Trash2,
  Share2,
  Plus,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherMaterialsPage() {
  const { materials, subjects, addStudyMaterial, deleteStudyMaterial } = useLMS();

  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // New material form
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]?.name || "");
  const [type, setType] = useState<StudyMaterial["type"]>("PDF");
  const [resourceUrl,setResourceUrl]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState("");
  const [description, setDescription] = useState("");

  const filteredMaterials = materials.filter((m) =>
    selectedSubject === "ALL" ? true : m.subject === selectedSubject
  );

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setUploading(true);setUploadError("");
    try {
    const url = file ? await uploadMaterial(file) : safeResourceUrl(resourceUrl);
    addStudyMaterial({
      title,
      subject,
      type,
      size: file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "External link",
      sizeBytes: file?.size || 0,
      url,
      description,
      assignedTo: "ALL",
    });

    setTitle("");
    setDescription("");
    setIsUploadModalOpen(false);setFile(null);setResourceUrl("");
    } catch(e) {setUploadError(e instanceof Error?e.message:"Upload failed");}finally{setUploading(false);}
  };

  return (
    <AppShell
      headerTitle="Study Materials & Resources"
      headerSubtitle="Upload, organize by subject, and share notes, video lectures, and practice sheets"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Top Filter & Upload Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedSubject("ALL")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                selectedSubject === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
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
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  selectedSubject === sub.name
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    {m.type === "VIDEO" ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                    {m.type} • {m.size}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                  <span className="text-[11px] font-semibold text-indigo-600">{m.subject}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
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
                  <button
                    onClick={() => window.open(safeResourceUrl(m.url), "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Upload Study Material</h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <label className="block text-sm">Upload a file (up to 50 MB)<input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.txt" onChange={e=>setFile(e.target.files?.[0]||null)} className="block mt-2"/></label>
                <label className="block text-sm">Or paste a video / notes link<input type="url" value={resourceUrl} onChange={e=>setResourceUrl(e.target.value)} required={!file} placeholder="https://youtube.com/watch?v=?" className="block border rounded-lg w-full p-2 mt-2"/></label>
                <p className="text-xs text-slate-500">Private YouTube videos require the viewer to have access from the video owner.</p>
                {uploadError&&<p role="alert" className="text-red-600">{uploadError}</p>}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quadratic Roots & Discriminant Summary"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      File Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="VIDEO">Video / YouTube link</option>
                      <option value="DOC">Notes (DOCX)</option>
                      <option value="IMAGE">Infographic (PNG/JPG)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the material..."
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                  >
                    {uploading ? "Uploading?" : "Save & Share"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
