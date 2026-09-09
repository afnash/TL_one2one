"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Play, Download } from "lucide-react";
import { useLMS } from "@/lib/store";
import { canEditCode, CODING_LANGUAGES, executeCode, INITIAL_CODE, type CodeDocument, type CodingLanguage } from "@/lib/coding";
import type { Session } from "@/types";

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
  const change = (changes: Partial<CodeDocument>) => {
    if (editable) updateSession(session.id, { codeDocument: { ...document, ...changes } });
  };
  const run = async () => {
    if (!editable || running) return;
    const snapshot = { ...document };
    const controller = new AbortController();
    request.current = controller;
    setRunning(true); setError("");
    try {
      const output = await executeCode(snapshot, controller.signal);
      if (!controller.signal.aborted && canEditCode(currentSession.current, user.id)) {
        updateSession(session.id, { codeRun: { document: snapshot, output, ranBy: user.name, ranAt: new Date().toISOString() } });
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to run code. Check your connection and retry.");
    } finally { if (!controller.signal.aborted) setRunning(false); }
  };
  const download = () => {
    const extensions: Record<CodingLanguage, string> = { Python: "py", JavaScript: "js", C: "c", "C++": "cpp", Java: "java" };
    const url = URL.createObjectURL(new Blob([document.source], { type: "text/plain" }));
    const link = window.document.createElement("a");
    link.href = url; link.download = document.language === "Java" ? "Main.java" : `main.${extensions[document.language]}`;
    link.click(); URL.revokeObjectURL(url);
  };
  const staleOutput = session.codeRun && JSON.stringify(session.codeRun.document) !== JSON.stringify(document);
  return (
    <section aria-label="Collaborative live coding" className="flex h-full min-h-0 flex-col overflow-auto bg-slate-950 text-slate-100">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-700 p-3">
        <Code2 className="h-5 w-5 text-indigo-400" />
        <span className="font-semibold">Live coding</span>
        <label className="text-xs">Language <select aria-label="Programming language" value={document.language} disabled={!editable || running} onChange={event => change({ language: event.target.value as CodingLanguage })} className="ml-1 rounded bg-slate-800 p-2 disabled:opacity-60">{CODING_LANGUAGES.map(language => <option key={language}>{language}</option>)}</select></label>
        <button onClick={run} disabled={!editable || running || saving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"><Play className="h-4 w-4" />{running ? "Running…" : "Run code"}</button>
        <button onClick={download} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm"><Download className="h-4 w-4" />Download</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
        <span>{session.status !== "LIVE" ? "Class is not live · saved code is read-only" : `${editorName} is coding · ${editable ? "Your turn to edit" : "Watching live"}`}</span>
        {isTeacher && <label>Editing turn <select aria-label="Who can edit code" value={editorId} disabled={session.status !== "LIVE" || saving || running || !!connectionError} onChange={event => updateSession(session.id, { codeEditorId: event.target.value })} className="ml-2 rounded bg-slate-800 p-2"><option value={session.teacherId}>{session.teacherName} (Teacher)</option>{participants.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>}
        <span role="status">{connectionError ? "Sync failed" : saving ? "Saving…" : "Shared · syncs every 2 seconds"}</span>
      </div>
      {connectionError && <p role="alert" className="bg-rose-950 p-3 text-sm text-rose-200">{connectionError} Download your code before reloading.</p>}
      <div className="grid min-h-[360px] flex-1 grid-cols-1 gap-px bg-slate-800 lg:grid-cols-[3fr_2fr]">
        <label className="flex min-h-[280px] flex-col bg-slate-950 p-3 text-xs text-slate-400">Source code
          <textarea aria-label="Shared source code" spellCheck={false} autoCapitalize="off" autoCorrect="off" readOnly={!editable} maxLength={50000} value={document.source} onChange={event => change({ source: event.target.value })} className="mt-2 min-h-[250px] flex-1 resize-none rounded-lg bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        <div className="flex min-h-0 flex-col gap-3 bg-slate-950 p-3">
          <label className="text-xs text-slate-400">Program input (stdin)<textarea aria-label="Program input" readOnly={!editable} maxLength={10000} value={document.stdin} onChange={event => change({ stdin: event.target.value })} placeholder="Enter input before running" className="mt-2 h-24 w-full resize-y rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100" /></label>
          <div className="flex-1 text-xs text-slate-400">Shared output
            {session.codeRun && <p className="my-2">Run by {session.codeRun.ranBy}{staleOutput ? " · Code or input has changed since this run" : ""}</p>}
            <pre aria-label="Execution output" className="mt-2 min-h-36 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-900 p-3 font-mono text-sm text-emerald-300">{session.codeRun?.output || "Run your program to show the result to everyone."}</pre>
          </div>
          {error && <p role="alert" className="rounded bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-slate-400">Run sends code and input to Judge0, an external compiler. Use Main as the public class name for Java.</p>
    </section>
  );
}
