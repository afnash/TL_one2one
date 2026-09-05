"use client";

import React, { useState } from "react";
import {
  FileText,
  X,
  ExternalLink,
  Download,
  Printer,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { safeResourceUrl } from "@/lib/supabase";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  subject?: string;
  description?: string;
  type?: string;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  url,
  title,
  subject,
  description,
  type = "PDF",
}: PDFViewerModalProps) {
  const [useGoogleDocsViewer, setUseGoogleDocsViewer] = useState(false);

  if (!isOpen || !url) return null;

  const validUrl = safeResourceUrl(url);

  // If using Google Docs viewer fallback for cross-origin or complex docs
  const effectiveUrl = useGoogleDocsViewer
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(validUrl)}&embedded=true`
    : validUrl;

  const isImage = type === "IMAGE" || /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(validUrl);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = validUrl;
    a.download = title || "document";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {title}
                </h3>
                {subject && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200 shrink-0">
                    {subject}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{description}</p>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isImage && (
              <button
                type="button"
                onClick={() => setUseGoogleDocsViewer(!useGoogleDocsViewer)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                title="Toggle Google Docs Embedded Viewer fallback"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{useGoogleDocsViewer ? "Direct Viewer" : "Docs Engine"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={validUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Close Document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 w-full h-full bg-slate-100 overflow-hidden relative flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full p-4 flex items-center justify-center overflow-auto bg-slate-900/10">
              <img
                src={validUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-md"
              />
            </div>
          ) : (
            <iframe
              src={effectiveUrl}
              title={title}
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>OneToOne Document Viewer</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
            >
              Close Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
