"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLMS } from "@/lib/store";
import { StudyMaterial } from "@/types";
import { searchStudyMaterials, buildGroundedAnswer } from "@/lib/rag-search";
import { safeResourceUrl } from "@/lib/supabase";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import { VideoPlayerModal } from "@/components/media/VideoPlayer";
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  FileText,
  Video,
  ExternalLink,
  Eye,
  Play,
  RotateCcw,
  BookOpen,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  matchedDocs?: StudyMaterial[];
  matchedKeywords?: string[];
  isSearching?: boolean;
}

export function RAGStudyChatbot() {
  const { materials } = useLMS();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Modal previews
  const [activeVideoModal, setActiveVideoModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
  } | null>(null);

  const [activeDocModal, setActiveDocModal] = useState<{
    url: string;
    title: string;
    subject?: string;
    description?: string;
    type?: string;
  } | null>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Hello! I am your **Context-Grounded AI Study Assistant**.\n\nAsk me about any topic, concept, or keywords. I will search our Supabase study library and reply **strictly using verified uploaded documents and videos**.",
      timestamp: "Just now",
    },
  ]);

  // Extract unique keywords and topics from available materials for quick suggestion pills
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>();
    materials.forEach((m) => {
      if (m.topic) tags.add(m.topic.trim());
      if (Array.isArray(m.keywords)) {
        m.keywords.forEach((k) => {
          if (k && k.trim()) tags.add(k.trim());
        });
      }
    });
    return Array.from(tags).slice(0, 8);
  }, [materials]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isSearching) return;

    const userMsgId = crypto.randomUUID();
    const botMsgId = crypto.randomUUID();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: q,
        timestamp: time,
      },
    ]);

    setInputQuery("");
    setIsSearching(true);

    try {
      // Perform RAG search on Supabase table and materials
      const matches = await searchStudyMaterials(q, materials);
      const grounded = buildGroundedAnswer(q, matches);

      const allMatchedKeywords = Array.from(
        new Set(matches.flatMap((m) => m.matchedKeywords))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: grounded.reply,
          matchedDocs: grounded.matchedDocs,
          matchedKeywords: allMatchedKeywords,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: `⚠️ An error occurred while searching documents: ${err?.message || "Unknown error"}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenDoc = (doc: StudyMaterial) => {
    const isVideo =
      doc.type === "VIDEO" ||
      doc.url.includes("youtube") ||
      doc.url.includes("youtu.be") ||
      doc.url.match(/\.(mp4|webm|mov)(\?.*)?$/i);

    if (isVideo) {
      setActiveVideoModal({
        url: doc.url,
        title: doc.title,
        subject: doc.subject,
        description: doc.description,
      });
    } else {
      setActiveDocModal({
        url: doc.url,
        title: doc.title,
        subject: doc.subject,
        description: doc.description,
        type: doc.type,
      });
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all duration-300 border",
            isOpen
              ? "bg-slate-900 text-white border-slate-700 hover:bg-slate-800 scale-95"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 hover:shadow-2xl hover:scale-105"
          )}
          aria-label="Toggle RAG AI Study Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? "Close Assistant" : "Ask Study Documents"}
          </span>
        </button>
      </div>

      {/* Chatbot Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-40 w-[92vw] sm:w-[440px] md:w-[480px] h-[580px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-none">RAG Study Chatbot</h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                    Live Context
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 mt-0.5">
                  Replies strictly from verified study materials
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "welcome-reset",
                      sender: "bot",
                      text: "Conversation reset. What document or topic would you like to explore?",
                      timestamp: "Just now",
                    },
                  ])
                }
                title="Reset conversation"
                className="p-1.5 hover:bg-white/15 rounded-lg text-blue-100 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg text-blue-100 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Tag Recommendations */}
          {availableTags.length > 0 && (
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Suggestions:
              </span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSendMessage(`Tell me about ${tag}`)}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0 shadow-2xs font-medium"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed",
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-xs font-medium"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                  )}
                >
                  {/* Message formatted content */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text}
                  </div>

                  {/* Matched Document Cards (RAG citations) */}
                  {msg.matchedDocs && msg.matchedDocs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Referenced Study Documents ({msg.matchedDocs.length})
                      </p>
                      {msg.matchedDocs.map((doc) => {
                        const isVideo =
                          doc.type === "VIDEO" ||
                          doc.url.includes("youtube") ||
                          doc.url.includes("youtu.be") ||
                          doc.url.match(/\.(mp4|webm|mov)(\?.*)?$/i);

                        return (
                          <div
                            key={doc.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all text-left flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 truncate text-[11px]">
                                {doc.title}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                                {isVideo ? "VIDEO" : doc.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                              <span className="font-semibold text-blue-600">{doc.subject}</span>
                              {doc.topic && (
                                <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">
                                  {doc.topic}
                                </span>
                              )}
                            </div>

                            {doc.keywords && doc.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {doc.keywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] bg-slate-200/70 text-slate-700 px-1 py-0.2 rounded font-mono"
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action Buttons to open document / video */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 mt-1">
                              <button
                                onClick={() => handleOpenDoc(doc)}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                              >
                                {isVideo ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3 h-3" />}
                                <span>{isVideo ? "Watch Video" : "View Document"}</span>
                              </button>

                              <a
                                href={safeResourceUrl(doc.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Direct Link</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isSearching && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 w-fit animate-pulse shadow-2xs">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Searching Supabase materials by keywords...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about a topic or keywords (e.g. Newton's laws)..."
              disabled={isSearching}
              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isSearching}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Video Modal Preview for Chatbot */}
      <VideoPlayerModal
        isOpen={!!activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        url={activeVideoModal?.url || ""}
        title={activeVideoModal?.title || ""}
        subject={activeVideoModal?.subject}
        description={activeVideoModal?.description}
      />

      {/* PDF Modal Preview for Chatbot */}
      <PDFViewerModal
        isOpen={!!activeDocModal}
        onClose={() => setActiveDocModal(null)}
        url={activeDocModal?.url || ""}
        title={activeDocModal?.title || ""}
        subject={activeDocModal?.subject}
        description={activeDocModal?.description}
        type={activeDocModal?.type}
      />
    </>
  );
}
