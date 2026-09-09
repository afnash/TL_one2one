import type { Session, Subject } from "@/types";

export const CODING_LANGUAGES = ["Python", "JavaScript", "C", "C++", "Java"] as const;
export type CodingLanguage = typeof CODING_LANGUAGES[number];
export interface CodeDocument { language: CodingLanguage; source: string; stdin: string }
export interface CodeRun { document: CodeDocument; output: string; ranBy: string; ranAt: string }
export const INITIAL_CODE: CodeDocument = { language: "Python", source: 'print("Hello, class!")\n', stdin: "" };

export function isComputerScience(subject: string, subjects: Subject[]) {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/[\s._-]+/g, "");
  const matches = (value: string) => ["cs", "computerscience"].includes(normalize(value));
  return matches(subject) || subjects.some(item =>
    [item.id, item.name, item.code].some(value => normalize(value) === normalize(subject)) &&
    [item.name, item.code].some(matches));
}

export function canEditCode(session: Session, userId: string) {
  return !!userId && session.status === "LIVE" &&
    (session.codeEditorId || session.teacherId) === userId &&
    [session.teacherId, session.studentId, ...(session.studentIds || [])].includes(userId);
}

// Same-origin route avoids compiler CORS restrictions in browsers.
export async function executeCode(document: CodeDocument, signal?: AbortSignal): Promise<string> {
  if (!CODING_LANGUAGES.includes(document.language) || !document.source.trim()) throw new Error("Choose a language and enter some code first.");
  if (document.source.length > 50000 || document.stdin.length > 10000) throw new Error("Limit code to 50,000 characters and input to 10,000 characters.");
  try {
    const response = await fetch("/api/code/run", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(document),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(55000)]) : AbortSignal.timeout(55000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || "Code execution failed. Please retry.");
    if (typeof result?.output !== "string") throw new Error("Compiler returned an invalid execution result. Please retry.");
    return result.output;
  } catch (cause) {
    if (signal?.aborted) throw cause;
    if (cause instanceof Error && cause.name === "TimeoutError") throw new Error("Execution timed out. Please retry.");
    if (cause instanceof TypeError) throw new Error("Cannot reach the code runner. Check your connection and restart the app if needed.");
    throw cause;
  }
}
