"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ExternalLink, Eye, FileText, Play, RotateCcw, SendHorizontal, Video, X } from "lucide-react";
import { useLMS } from "@/lib/store";
import { StudyMaterial } from "@/types";
import { searchStudyMaterials, buildGroundedAnswer } from "@/lib/rag-search";
import { safeResourceUrl } from "@/lib/supabase";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import { VideoPlayerModal } from "@/components/media/VideoPlayer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  matchedDocs?: StudyMaterial[];
  matchedKeywords?: string[];
}

type ModalState = { url: string; title: string; subject?: string; description?: string; type?: string } | null;

const WELCOME: ChatMessage = {
  id: "welcome",
  sender: "bot",
  text: "Ask about a topic or keyword. I answer only from the study materials your teachers have uploaded, and show you where each answer comes from.",
  timestamp: "",
};

const isVideoDoc = (doc: StudyMaterial) =>
  doc.type === "VIDEO" || /youtube|youtu\.be/.test(doc.url) || /\.(mp4|webm|mov)(\?.*)?$/i.test(doc.url);

/** Inline **bold** and `code`. Everything else is plain text, so nothing is injected as HTML. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        ) : part.startsWith("`") ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

/** Tiny markdown subset used by the answers: headings, bullets, quotes, paragraphs. */
function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-0.5">
          {bullets.map((b, i) => (
            <li key={i}><Inline text={b} /></li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("- ")) { bullets.push(line.slice(2)); continue; }
    flush();
    if (line.startsWith("#")) blocks.push(<p key={blocks.length} className="font-semibold"><Inline text={line.replace(/^#+\s*/, "")} /></p>);
    else if (line.startsWith(">")) blocks.push(<p key={blocks.length} className="border-l-2 pl-3 text-muted-foreground"><Inline text={line.replace(/^>\s*/, "")} /></p>);
    else blocks.push(<p key={blocks.length}><Inline text={line} /></p>);
  }
  flush();
  return <div className="flex flex-col gap-2">{blocks}</div>;
}

export function RAGStudyChatbot() {
  const { materials } = useLMS();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [videoModal, setVideoModal] = useState<ModalState>(null);
  const [docModal, setDocModal] = useState<ModalState>(null);

  const suggestions = useMemo(() => {
    const tags = new Set<string>();
    materials.forEach((m) => {
      if (m.topic) tags.add(m.topic.trim());
      m.keywords?.forEach((k) => k?.trim() && tags.add(k.trim()));
    });
    return Array.from(tags).slice(0, 6);
  }, [materials]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 180);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSearching]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const send = async (queryToSend?: string) => {
    const q = (queryToSend ?? inputQuery).trim();
    if (!q || isSearching) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "user", text: q, timestamp: now() }]);
    setInputQuery("");
    setIsSearching(true);
    try {
      const matches = await searchStudyMaterials(q, materials);
      const grounded = buildGroundedAnswer(q, matches);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "bot",
          // The cards below carry the document details, so only the summary sentence is shown.
          text: grounded.matchedDocs.length ? grounded.reply.split("\n")[0] : grounded.reply,
          matchedDocs: grounded.matchedDocs,
          matchedKeywords: Array.from(new Set(matches.flatMap((m) => m.matchedKeywords))),
          timestamp: now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: `Something went wrong while searching: ${err instanceof Error ? err.message : "unknown error"}. Please try again.`,
          timestamp: now(),
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const openDoc = (doc: StudyMaterial) => {
    const info = { url: doc.url, title: doc.title, subject: doc.subject, description: doc.description, type: doc.type };
    if (isVideoDoc(doc)) setVideoModal(info);
    else setDocModal(info);
  };

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="study-assistant"
        className="fixed bottom-5 right-5 z-40 h-12 rounded-full px-4 shadow-lg shadow-primary/20 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isOpen ? <X data-icon="inline-start" /> : <Bot data-icon="inline-start" />}
        <span className="hidden sm:inline">{isOpen ? "Close" : "Ask the materials"}</span>
        <span className="sr-only sm:hidden">{isOpen ? "Close assistant" : "Open study assistant"}</span>
      </Button>

      <section
        id="study-assistant"
        role="dialog"
        aria-label="Study assistant"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed bottom-20 right-5 z-40 flex h-[560px] max-h-[75vh] w-[calc(100vw-2.5rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:w-[420px]",
          "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-tight">Study assistant</h2>
              <p className="truncate text-xs text-muted-foreground">Answers only from uploaded materials</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Start a new conversation"
              onClick={() => setMessages([WELCOME])}
            >
              <RotateCcw />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Close assistant" onClick={() => setIsOpen(false)}>
              <X />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-muted/30 px-4 py-4" aria-live="polite">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex animate-in fade-in-0 slide-in-from-bottom-1 flex-col duration-200",
                  msg.sender === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border bg-card text-card-foreground",
                  )}
                >
                  {msg.sender === "bot" ? <Markdown text={msg.text} /> : msg.text}
                </div>

                {msg.matchedDocs && msg.matchedDocs.length > 0 && (
                  <ul className="mt-2 flex w-[90%] flex-col gap-2">
                    {msg.matchedDocs.map((doc, i) => {
                      const video = isVideoDoc(doc);
                      const Icon = video ? Video : FileText;
                      return (
                        <li
                          key={doc.id}
                          style={{ animationDelay: `${i * 50}ms` }}
                          className="flex animate-in fade-in-0 slide-in-from-bottom-1 flex-col gap-2 rounded-xl border bg-card p-3 duration-200 fill-mode-both"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{doc.title}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[doc.subject, doc.topic, video ? "Video" : doc.type].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="xs" onClick={() => openDoc(doc)}>
                              {video ? <Play data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                              {video ? "Watch" : "View"}
                            </Button>
                            <Button size="xs" variant="ghost" asChild>
                              <a href={safeResourceUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                                <ExternalLink data-icon="inline-start" />
                                Open
                              </a>
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {msg.matchedKeywords && msg.matchedKeywords.length > 0 && (
                  <p className="mt-2 max-w-[90%] text-xs text-muted-foreground">
                    Matched: {msg.matchedKeywords.slice(0, 6).join(", ")}
                  </p>
                )}
                {msg.timestamp && <span className="mt-1 px-1 text-[11px] text-muted-foreground">{msg.timestamp}</span>}
              </div>
            ))}

            {isSearching && (
              <div
                className="flex w-56 animate-in fade-in-0 flex-col gap-2 rounded-2xl rounded-bl-md border bg-card px-3.5 py-3 duration-150"
                role="status"
                aria-label="Searching the materials"
              >
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <footer className="shrink-0 border-t bg-card p-3">
          {suggestions.length > 0 && messages.length <= 1 && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" aria-label="Suggested topics">
              {suggestions.map((tag) => (
                <Button key={tag} variant="outline" size="xs" className="shrink-0" onClick={() => send(`Tell me about ${tag}`)}>
                  {tag}
                </Button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <InputGroup>
              <InputGroupInput
                ref={inputRef}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about a topic or keyword"
                aria-label="Your question"
                disabled={isSearching}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" size="icon-xs" variant="default" aria-label="Send" disabled={!inputQuery.trim() || isSearching}>
                  <SendHorizontal />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </footer>
      </section>

      <VideoPlayerModal
        isOpen={!!videoModal}
        onClose={() => setVideoModal(null)}
        url={videoModal?.url || ""}
        title={videoModal?.title || ""}
        subject={videoModal?.subject}
        description={videoModal?.description}
      />
      <PDFViewerModal
        isOpen={!!docModal}
        onClose={() => setDocModal(null)}
        url={docModal?.url || ""}
        title={docModal?.title || ""}
        subject={docModal?.subject}
        description={docModal?.description}
        type={docModal?.type}
      />
    </>
  );
}
