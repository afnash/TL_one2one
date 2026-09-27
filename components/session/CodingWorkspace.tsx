"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Download, Play } from "lucide-react";
import { useLMS } from "@/lib/store";
import { canEditCode, CODING_LANGUAGES, executeCode, INITIAL_CODE, type CodeDocument, type CodingLanguage } from "@/lib/coding";
import type { Session } from "@/types";

const EXTENSIONS: Record<CodingLanguage, string> = { Python: "py", JavaScript: "js", C: "c", "C++": "cpp", Java: "java" };

export function CodingWorkspace({ session }: { session: Session }) {
  const { user, students, updateSession, saving, connectionError } = useLMS();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const currentSession = useRef(session);
  useEffect(() => { currentSession.current = session; }, [session]);
  useEffect(() => () => request.current?.abort(), []);

  const document = session.codeDocument || INITIAL_CODE;
  const editorId = session.codeEditorId || session.teacherId;
  const isTeacher = user.id === session.teacherId;
  const editable = canEditCode(session, user.id) && !connectionError;
  const participants = students.filter(student => [session.studentId, ...(session.studentIds || [])].includes(student.id));
  const editorName = editorId === session.teacherId ? session.teacherName : participants.find(student => student.id === editorId)?.name || "Student";
  const staleOutput = session.codeRun && JSON.stringify(session.codeRun.document) !== JSON.stringify(document);

  const change = (changes: Partial<CodeDocument>) => {
    if (editable) updateSession(session.id, { codeDocument: { ...document, ...changes } });
  };
  const run = async () => {
    if (!editable || running) return;
    const snapshot = { ...document };
    const controller = new AbortController();
    request.current = controller;
    setRunning(true);
    setError("");
    try {
      const output = await executeCode(snapshot, controller.signal);
      if (!controller.signal.aborted && canEditCode(currentSession.current, user.id)) {
        updateSession(session.id, { codeRun: { document: snapshot, output, ranBy: user.name, ranAt: new Date().toISOString() } });
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to run code. Check your connection and retry.");
    } finally {
      if (!controller.signal.aborted) setRunning(false);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([document.source], { type: "text/plain" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.language === "Java" ? "Main.java" : `main.${EXTENSIONS[document.language]}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-label="Collaborative live coding" className="flex h-full min-h-0 flex-col overflow-hidden bg-[#070b16] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 shadow-lg shadow-black/10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/25"><Code2 className="h-5 w-5 text-indigo-300" /></div>
          <div className="min-w-0"><h2 className="font-semibold tracking-tight text-white">Collaborative editor</h2><p className="truncate text-xs text-slate-400">{session.subject} · {session.topic}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">Language
            <select aria-label="Programming language" value={document.language} disabled={!editable || running} onChange={event => change({ language: event.target.value as CodingLanguage })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 font-semibold text-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60">{CODING_LANGUAGES.map(language => <option key={language}>{language}</option>)}</select>
          </label>
          <button onClick={download} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"><Download className="h-4 w-4" />Download</button>
          <button onClick={run} disabled={!editable || running || saving} className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4 fill-current" />{running ? "Running…" : "Run code"}</button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
        <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${editable ? "bg-emerald-400" : "bg-amber-400"}`} />{session.status !== "LIVE" ? "Class is not live · saved code is read-only" : `${editorName} is coding · ${editable ? "Your turn to edit" : "Watching live"}`}</span>
        {isTeacher && <label className="flex items-center gap-2">Editing turn
          <select aria-label="Who can edit code" value={editorId} disabled={session.status !== "LIVE" || saving || running || !!connectionError} onChange={event => updateSession(session.id, { codeEditorId: event.target.value })} className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-white outline-none focus:ring-2 focus:ring-indigo-500"><option value={session.teacherId}>{session.teacherName} (Teacher)</option>{participants.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}</select>
        </label>}
        <span role="status" className={connectionError ? "text-rose-300" : "text-slate-400"}>{connectionError ? "Sync failed" : saving ? "Saving…" : "Shared · synced"}</span>
      </div>
      {connectionError && <p role="alert" className="border-b border-rose-800/60 bg-rose-950/70 px-4 py-3 text-sm text-rose-200">{connectionError} Download your code before reloading.</p>}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        <label className="flex min-h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl shadow-black/20">
          <span className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400"><span>main.{EXTENSIONS[document.language]}</span><span>{document.source.split("\n").length} lines</span></span>
          <textarea aria-label="Shared source code" spellCheck={false} autoCapitalize="off" autoCorrect="off" readOnly={!editable} maxLength={50000} value={document.source} onChange={event => change({ source: event.target.value })} className="min-h-[360px] flex-1 resize-none bg-[#090e1a] p-5 font-mono text-sm leading-7 text-slate-100 caret-indigo-400 outline-none selection:bg-indigo-500/30 focus:bg-[#0b1120]" />
        </label>
        <div className="flex min-h-[420px] min-w-0 flex-col gap-3">
          <label className="block rounded-2xl border border-white/10 bg-slate-950 p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 shadow-lg shadow-black/10">Program input <span className="normal-case tracking-normal text-slate-600">(stdin)</span>
            <textarea aria-label="Program input" readOnly={!editable} maxLength={10000} value={document.stdin} onChange={event => change({ stdin: event.target.value })} placeholder="Type program input here…" className="mt-3 h-28 w-full resize-y rounded-xl border border-white/10 bg-slate-900 p-3 font-mono text-sm font-normal normal-case tracking-normal text-slate-100 outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500" />
          </label>
          <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span>Console output</span>{session.codeRun && <span className="normal-case tracking-normal text-slate-500">Run by {session.codeRun.ranBy}{staleOutput ? " · source changed" : ""}</span>}</div>
            <pre aria-label="Execution output" className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words bg-[#080d18] p-4 font-mono text-sm leading-6 text-emerald-300">{session.codeRun?.output || "Ready. Run your program to share the result."}</pre>
          </div>
          {error && <p role="alert" className="rounded-xl border border-rose-800/60 bg-rose-950/70 p-3 text-sm text-rose-200">{error}</p>}
        </div>
      </div>
      <p className="border-t border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-slate-500">Code and input run through the external Judge0 compiler. Java programs should use <code className="text-slate-300">Main</code> as the public class.</p>
    </section>
  );
}
