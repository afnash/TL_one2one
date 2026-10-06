"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Code2, 
  Download, 
  Play, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles, 
  Loader2,
  ChevronRight,
  UserCheck,
  AlertCircle
} from "lucide-react";
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
    const savedTheme = localStorage.getItem("onetoone_coding_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
    return () => request.current?.abort();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("onetoone_coding_theme", nextTheme);
  };

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
  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full min-h-0 flex-col overflow-hidden transition-colors duration-200 ${
        isFullscreen ? "fixed inset-0 z-50" : "relative"
      } ${
        isDark 
          ? "bg-[#0b0f19] text-slate-100" 
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Streamlined, Compact Header */}
      <header 
        className={`flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 text-xs transition-colors duration-200 ${
          isDark 
            ? "border-slate-800 bg-[#0f172a]/90 backdrop-blur-sm" 
            : "border-slate-200 bg-white/95 shadow-sm"
        }`}
      >
        {/* Left Side: Language Selector + File Name + Turn Status */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono font-medium">
            <span className={`flex items-center gap-1 rounded-md px-2 py-1 font-semibold ${
              isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600"
            }`}>
              <Code2 className="h-3.5 w-3.5" />
              <span>main.{EXTENSIONS[documentState.language]}</span>
            </span>
          </div>

          <select
            aria-label="Programming language"
            value={documentState.language}
            disabled={!editable || running}
            onChange={e => change({ language: e.target.value as CodingLanguage })}
            className={`rounded-md border px-2 py-1 font-medium outline-none transition disabled:opacity-60 ${
              isDark 
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 focus:border-indigo-500" 
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:border-indigo-600 shadow-sm"
            }`}
          >
            {CODING_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          {/* Turn / Sync Indicator Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
            editable
              ? isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-emerald-300 bg-emerald-50 text-emerald-700"
              : isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-amber-300 bg-amber-50 text-amber-700"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${editable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="truncate max-w-[140px]">
              {session.status !== "LIVE" 
                ? "Read-only" 
                : editable 
                  ? "Your turn" 
                  : `${editorName} editing`}
            </span>
          </div>

          {/* Teacher's Turn Switcher (Compact) */}
          {isTeacher && (
            <div className="flex items-center gap-1">
              <select
                aria-label="Delegate coding turn"
                value={editorId}
                disabled={session.status !== "LIVE" || saving || running || !!connectionError}
                onChange={e => updateSession(session.id, { codeEditorId: e.target.value })}
                className={`rounded-md border px-2 py-1 text-[11px] font-medium outline-none transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300"
                }`}
                title="Choose who can write code"
              >
                <option value={session.teacherId}>Turn: {session.teacherName} (Teacher)</option>
                {participants.map(student => (
                  <option key={student.id} value={student.id}>Turn: {student.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Side: Tools + Theme + Fullscreen + Run */}
        <div className="flex items-center gap-1.5">
          {/* Copy Code */}
          <button
            onClick={copyCode}
            title="Copy code"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              isDark 
                ? "border-slate-700/80 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white" 
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Download File */}
          <button
            onClick={download}
            title="Download source code"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              isDark 
                ? "border-slate-700/80 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white" 
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Light/Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              isDark 
                ? "border-slate-700/80 bg-slate-800/50 text-amber-300 hover:bg-slate-700 hover:text-amber-200" 
                : "border-slate-200 bg-white text-indigo-600 hover:bg-slate-100 hover:text-indigo-800 shadow-sm"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Full screen code workspace"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              isDark 
                ? "border-slate-700/80 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white" 
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            }`}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {/* Run Code Button */}
          <button
            onClick={run}
            disabled={!editable || running || saving}
            title="Execute program (Ctrl+Enter)"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
              running
                ? "bg-indigo-600"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-600/20"
            }`}
          >
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running…</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Connection Warning Banner */}
      {connectionError && (
        <div className="flex items-center gap-2 border-b border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{connectionError} Download your code before reloading.</span>
        </div>
      )}

      {/* Main Workspace Area: Editor (Left) & Output/Stdin (Right) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        
        {/* Left Side: Code Editor */}
        <div className={`flex flex-1 min-h-0 min-w-0 flex-col border-b lg:border-b-0 lg:border-r transition-colors ${
          isDark ? "border-slate-800 bg-[#0d1322]" : "border-slate-200 bg-white"
        }`}>
          {/* Subtle Editor Info bar */}
          <div className={`flex items-center justify-between border-b px-3 py-1 text-[11px] font-mono select-none ${
            isDark ? "border-slate-800/80 bg-slate-900/60 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"
          }`}>
            <span>SOURCE CODE</span>
            <span>{lineCount} {lineCount === 1 ? "line" : "lines"} · {documentState.source.length} chars</span>
          </div>

          {/* Textarea Editor */}
          <div className="relative flex-1 min-h-0">
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
              className={`h-full w-full resize-none p-4 font-mono text-sm leading-relaxed outline-none transition-colors ${
                isDark
                  ? "bg-[#090e1a] text-slate-100 placeholder:text-slate-600 caret-white selection:bg-indigo-500/30"
                  : "bg-slate-50/50 text-slate-900 placeholder:text-slate-400 caret-black selection:bg-indigo-100"
              }`}
            />
          </div>
        </div>

        {/* Right Side: Tabbed Console Output & Stdin Input */}
        <div className={`flex w-full min-h-0 flex-col lg:w-[380px] xl:w-[440px] shrink-0 transition-colors ${
          isDark ? "bg-[#0a0e1a]" : "bg-slate-50"
        }`}>
          {/* Tabs: Console Output vs Program Input */}
          <div className={`flex shrink-0 items-center justify-between border-b px-2 py-1 ${
            isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-100"
          }`}>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveRightTab("output")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  activeRightTab === "output"
                    ? isDark
                      ? "bg-slate-800 text-indigo-300 shadow-sm"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Terminal className="h-3 w-3" />
                <span>Console Output</span>
                {session.codeRun && (
                  <span className={`h-1.5 w-1.5 rounded-full ${staleOutput ? "bg-amber-400" : "bg-emerald-400"}`} />
                )}
              </button>

              <button
                onClick={() => setActiveRightTab("input")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  activeRightTab === "input"
                    ? isDark
                      ? "bg-slate-800 text-indigo-300 shadow-sm"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Input (stdin)</span>
                {documentState.stdin && (
                  <span className="rounded-full bg-indigo-500/20 px-1 text-[9px] font-mono text-indigo-400">
                    set
                  </span>
                )}
              </button>
            </div>

            {/* Run info metadata */}
            {session.codeRun && activeRightTab === "output" && (
              <span className={`text-[10px] truncate max-w-[150px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                by {session.codeRun.ranBy}{staleOutput ? " (modified)" : ""}
              </span>
            )}
          </div>

          {/* Right Panel Body */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-2">
            {activeRightTab === "output" ? (
              <div className={`flex flex-1 min-h-0 flex-col overflow-hidden rounded-lg border transition ${
                isDark 
                  ? "border-slate-800/80 bg-[#070b14]" 
                  : "border-slate-200 bg-white"
              }`}>
                <pre 
                  aria-label="Program output"
                  className={`flex-1 min-h-0 overflow-auto whitespace-pre-wrap break-words p-3.5 font-mono text-xs leading-relaxed ${
                    session.codeRun?.output 
                      ? isDark 
                        ? "text-emerald-300" 
                        : "text-emerald-700" 
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  {session.codeRun?.output || "Ready. Click \"Run\" to compile and execute."}
                </pre>
              </div>
            ) : (
              <div className="flex flex-1 min-h-0 flex-col gap-1.5">
                <textarea
                  aria-label="Standard input"
                  readOnly={!editable}
                  maxLength={10000}
                  value={documentState.stdin}
                  onChange={e => change({ stdin: e.target.value })}
                  placeholder="Type standard input (stdin) here for programs reading from console..."
                  className={`flex-1 min-h-0 resize-none rounded-lg border p-3 font-mono text-xs leading-relaxed outline-none transition ${
                    isDark
                      ? "border-slate-800 bg-[#070b14] text-slate-100 placeholder:text-slate-600 caret-white focus:border-indigo-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 caret-black focus:border-indigo-600"
                  }`}
                />
                <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Input provided here is fed into your program during execution.
                </p>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
