"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertCircle, Check, Code2, Copy, Download, Loader2, Maximize2, Minimize2, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLMS } from "@/lib/store";
import { canEditCode, CODING_LANGUAGES, executeCode, INITIAL_CODE, type CodeDocument, type CodingLanguage } from "@/lib/coding";
import type { Session } from "@/types";

const EXTENSIONS: Record<CodingLanguage, string> = { 
  Python: "py", 
  JavaScript: "js", 
  C: "c", 
  "C++": "cpp", 
  Java: "java" 
};

export function CodingWorkspace({ session }: { session: Session }) {
  const { user, students, updateSession, saving, connectionError } = useLMS();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"output" | "input">("output");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const request = useRef<AbortController | null>(null);
  const currentSession = useRef(session);

  useEffect(() => { 
    currentSession.current = session; 
  }, [session]);

  useEffect(() => {
    return () => request.current?.abort();
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const documentState = session.codeDocument || INITIAL_CODE;
  const editorId = session.codeEditorId || session.teacherId;
  const isTeacher = user.id === session.teacherId;
  const editable = canEditCode(session, user.id) && !connectionError;
  const participants = students.filter(student => [session.studentId, ...(session.studentIds || [])].includes(student.id));
  const editorName = editorId === session.teacherId ? session.teacherName : participants.find(student => student.id === editorId)?.name || "Student";
  const staleOutput = session.codeRun && JSON.stringify(session.codeRun.document) !== JSON.stringify(documentState);

  const change = (changes: Partial<CodeDocument>) => {
    if (editable) updateSession(session.id, { codeDocument: { ...documentState, ...changes } });
  };

  const run = useCallback(async () => {
    if (!editable || running) return;
    const snapshot = { ...documentState };
    const controller = new AbortController();
    request.current = controller;
    setRunning(true);
    setError("");
    setActiveRightTab("output");
    try {
      const output = await executeCode(snapshot, controller.signal);
      if (!controller.signal.aborted && canEditCode(currentSession.current, user.id)) {
        updateSession(session.id, { 
          codeRun: { 
            document: snapshot, 
            output, 
            ranBy: user.name, 
            ranAt: new Date().toISOString() 
          } 
        });
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "Unable to run code. Check your connection and retry.");
      }
    } finally {
      if (!controller.signal.aborted) setRunning(false);
    }
  }, [editable, running, documentState, user, session.id, updateSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void run();
      return;
    }
    // Handle Tab key indentation inside textarea
    if (e.key === "Tab" && !e.shiftKey && editable) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      change({ source: newValue });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([documentState.source], { type: "text/plain" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = documentState.language === "Java" ? "Main.java" : `main.${EXTENSIONS[documentState.language]}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(documentState.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = documentState.source.split("\n").length;
  const selectCls =
    "h-8 rounded-lg border border-input bg-card px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60";

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full min-h-0 flex-col overflow-hidden bg-card text-foreground",
        isFullscreen ? "fixed inset-0 z-50" : "relative"
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-card px-3 py-2 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono font-medium text-foreground">
            <Code2 className="size-3.5 text-muted-foreground" />
            main.{EXTENSIONS[documentState.language]}
          </span>

          <select
            aria-label="Programming language"
            value={documentState.language}
            disabled={!editable || running}
            onChange={e => change({ language: e.target.value as CodingLanguage })}
            className={selectCls}
          >
            {CODING_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <span className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
            <span className={cn("size-2 rounded-full", editable ? "bg-emerald-500" : "bg-amber-500")} aria-hidden />
            <span className="max-w-[160px] truncate">
              {session.status !== "LIVE" ? "Read-only" : editable ? "Your turn" : `${editorName} is editing`}
            </span>
          </span>

          {isTeacher && (
            <select
              aria-label="Delegate coding turn"
              value={editorId}
              disabled={session.status !== "LIVE" || saving || running || !!connectionError}
              onChange={e => updateSession(session.id, { codeEditorId: e.target.value })}
              className={selectCls}
              title="Choose who can write code"
            >
              <option value={session.teacherId}>Turn: {session.teacherName} (Teacher)</option>
              {participants.map(student => (
                <option key={student.id} value={student.id}>Turn: {student.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={copyCode} title="Copy code" aria-label="Copy code">
            {copied ? <Check /> : <Copy />}
          </Button>
          <Button variant="outline" size="icon-sm" onClick={download} title="Download file" aria-label="Download file">
            <Download />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button size="sm" onClick={run} disabled={!editable || running || saving} title="Run program (Ctrl+Enter)">
            {running ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Play data-icon="inline-start" />}
            {running ? "Running…" : "Run"}
          </Button>
        </div>
      </header>

      {connectionError && (
        <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{connectionError} Download your code before reloading.</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b lg:border-r lg:border-b-0">
          <div className="flex select-none items-center justify-between border-b bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span>Source code</span>
            <span className="tabular-nums">{lineCount} {lineCount === 1 ? "line" : "lines"} · {documentState.source.length} characters</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <textarea
              ref={textareaRef}
              aria-label="Source code editor"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              readOnly={!editable}
              maxLength={50000}
              value={documentState.source}
              onChange={e => change({ source: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="// Write your code here..."
              className="h-full w-full resize-none bg-card p-4 font-mono text-sm leading-relaxed text-foreground caret-primary outline-none selection:bg-secondary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex min-h-0 w-full shrink-0 flex-col bg-muted/30 lg:w-[380px] xl:w-[440px]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-card px-2 py-1">
            <div className="flex gap-1">
              <Button size="sm" variant={activeRightTab === "output" ? "secondary" : "ghost"} onClick={() => setActiveRightTab("output")}>
                <Terminal data-icon="inline-start" />
                Output
                {session.codeRun && (
                  <span className={cn("size-1.5 rounded-full", staleOutput ? "bg-amber-500" : "bg-emerald-500")} aria-label={staleOutput ? "Output is out of date" : "Output is current"} />
                )}
              </Button>
              <Button size="sm" variant={activeRightTab === "input" ? "secondary" : "ghost"} onClick={() => setActiveRightTab("input")}>
                Input
                {documentState.stdin && <span className="text-muted-foreground">(set)</span>}
              </Button>
            </div>
            {session.codeRun && activeRightTab === "output" && (
              <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                by {session.codeRun.ranBy}{staleOutput ? " (code changed since)" : ""}
              </span>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
            {activeRightTab === "output" ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
                <pre
                  aria-label="Program output"
                  className={cn(
                    "min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3.5 font-mono text-xs leading-relaxed",
                    session.codeRun?.output ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {session.codeRun?.output || "Ready. Click Run to compile and execute."}
                </pre>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                <textarea
                  aria-label="Standard input"
                  readOnly={!editable}
                  maxLength={10000}
                  value={documentState.stdin}
                  onChange={e => change({ stdin: e.target.value })}
                  placeholder="Standard input for programs that read from the console"
                  className="min-h-0 flex-1 resize-none rounded-lg border border-input bg-card p-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <p className="text-xs text-muted-foreground">This text is fed to your program while it runs.</p>
              </div>
            )}

            {error && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
