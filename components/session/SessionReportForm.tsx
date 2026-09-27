"use client";

import { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useLMS } from "@/lib/store";
import { buildSessionReport, homeworkStatuses, reportDurationSeconds, validateSessionReport, type ReportInput } from "@/lib/session-report";
import type { Session, SessionReport } from "@/types";
import { ReportTimetable } from "./ReportTimetable";

const control = "block w-full mt-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50";

function Field({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return <div><label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>{cloneElement(children, { id })}</div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-bold text-slate-900">{title}</h2>{children}</section>;
}

export function SessionReportForm({ session, existing }: { session: Session; existing?: SessionReport }) {
  const { directory, sessionReports, assignments, submissions, getStudentTimetable, createSessionReport, connectionError } = useLMS();
  const router = useRouter();
  const timetable = getStudentTimetable(session.studentId);
  const [draft, setDraft] = useState(() => buildSessionReport({ session, existing,
    student: directory.students.find(s => s.id === session.studentId), tutor: directory.teachers.find(t => t.id === session.teacherId),
    reports: sessionReports, assignments, submissions, timetable }));
  const [initial] = useState(draft);
  const [newTopic, setNewTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const durationSeconds = draft.startTime && draft.endTime && draft.startTime === initial.startTime && draft.endTime === initial.endTime
    ? initial.durationSeconds : reportDurationSeconds(draft.startTime, draft.endTime);
  const durationMinutes = Math.round(durationSeconds / 60 * 100) / 100;

  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  function update<K extends keyof ReportInput>(key: K, value: ReportInput[K]) {
    setDraft(previous => ({ ...previous, [key]: value }));
    setDirty(true); setMessage(""); setError("");
  }

  function textField(key: "topicTaught" | "studentEmail" | "studentPhone" | "studentGrade" | "testName" | "nextTestDate" | "nextTestTime", label: string, type = "text") {
    return <Field label={label}><input className={control} type={type} value={draft[key] ?? ""} onChange={e => update(key, e.target.value)} /></Field>;
  }

  function feedback(key: "partialReason" | "workCompleted" | "studentPerformanceNotes" | "classOverview" | "remarks" | "teacherNotes" | "previousHomework" | "assignmentGiven" | "nextTestDetails" | "nextSessionPlan" | "technicalIssueDescription" | "technicalIssueImpact", label: string, rows = 3) {
    return <Field label={label}><textarea rows={rows} className={control} value={draft[key] ?? ""} onChange={e => update(key, e.target.value)} /></Field>;
  }

  function contactFields(key: "parentContact" | "tutorContact" | "managerContact", title: string) {
    return <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4"><legend className="px-1 font-semibold text-slate-800">{title}</legend>
      {([ ["name", "Name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"] ] as const).map(([field, label, type]) =>
        <Field key={field} label={`${title} ${label.toLowerCase()}`}><input className={control} type={type} value={draft[key]?.[field] ?? ""}
          onChange={e => update(key, { name: "", email: "", phone: "", ...draft[key], [field]: e.target.value })} /></Field>)}
    </fieldset>;
  }

  function addTopic() {
    const tag = newTopic.trim();
    if (tag) update("topicsCovered", Array.from(new Set([...draft.topicsCovered, tag])));
    setNewTopic("");
  }

  async function save(publish: boolean) {
    if (busy) return;
    const report: ReportInput = { ...draft, durationSeconds, durationMinutes, timetable,
      topicsCovered: Array.from(new Set([...draft.topicsCovered, ...(newTopic.trim() ? [newTopic.trim()] : [])])), status: publish ? "SAVED" : "DRAFT" };
    const validation = validateSessionReport(report, publish);
    if (validation) { setError(validation); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await createSessionReport(report);
      setDraft(report); setNewTopic(""); setDirty(false);
      setMessage(publish ? "Report submitted." : "Draft saved. You can reopen it from Reports.");
      if (publish) router.push("/teacher/reports");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the report. Your entries are still in this form.");
    } finally { setBusy(false); }
  }

  return <form className="space-y-6 pb-12" onSubmit={event => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void save(submitter?.value !== "draft");
  }}>
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
      Available session and profile details are pre-filled. Review them before saving. Contact changes apply to this report.
    </div>
    <fieldset disabled={busy} className="space-y-6 min-w-0">
      <Section title="Session details">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Session date"><input type="date" required className={control} value={draft.date} onChange={e => update("date", e.target.value)} /></Field>
          <Field label="Start time"><input type="time" step="1" required className={control} value={draft.startTime} onChange={e => update("startTime", e.target.value)} /></Field>
          <Field label="End time"><input type="time" step="1" required className={control} value={draft.endTime} onChange={e => update("endTime", e.target.value)} /></Field>
          <div className="text-sm font-medium text-slate-700">Calculated duration<output aria-live="polite" className="block mt-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">{durationMinutes} minutes</output></div>
        </div>
        <p className="text-xs text-slate-500">Times use your local timezone. An end time before the start time means the class ended the next day.</p>
        <Field label="Class completion"><select className={control} value={draft.completionStatus} onChange={e => update("completionStatus", e.target.value as ReportInput["completionStatus"])}>
          <option value="COMPLETED">Completed</option><option value="PARTIAL">Partially completed</option>
        </select></Field>
        {draft.completionStatus === "PARTIAL" && feedback("partialReason", "Reason for partial completion")}
      </Section>
      <Section title="People">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Student"><input className={control} readOnly value={draft.studentName} /></Field>
          <Field label="Subject"><input className={control} readOnly value={draft.subject} /></Field>
          {textField("studentEmail", "Student email", "email")}{textField("studentPhone", "Student phone", "tel")}{textField("studentGrade", "Student grade")}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">{contactFields("parentContact", "Parent")}{contactFields("tutorContact", "Tutor")}{contactFields("managerContact", "Manager")}</div>
      </Section>
      <Section title="Teaching record">
        {textField("topicTaught", "Primary topic taught")}
        <div className="space-y-2">
          <Field label="Topics covered"><input className={control} value={newTopic} placeholder="Add a topic and press Enter" onChange={e => { setNewTopic(e.target.value); setDirty(true); setMessage(""); }} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }} /></Field>
          <button type="button" onClick={addTopic} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">Add topic</button>
          <ul className="flex flex-wrap gap-2">{draft.topicsCovered.map(topic => <li key={topic} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-800">{topic} <button type="button" aria-label={`Remove topic ${topic}`} onClick={() => update("topicsCovered", draft.topicsCovered.filter(t => t !== topic))}>×</button></li>)}</ul>
        </div>
        {feedback("workCompleted", "Work completed")}
        <fieldset><legend className="text-sm font-medium text-slate-700">Comprehension & engagement rating</legend><div className="flex items-center gap-2 mt-2">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" aria-label={`Rate ${star} out of 5`} aria-pressed={draft.studentPerformanceRating === star} onClick={() => update("studentPerformanceRating", star)} className="rounded-lg p-1 focus:ring-2 focus:ring-indigo-500"><Star className={`w-6 h-6 ${star <= draft.studentPerformanceRating ? "text-amber-500 fill-amber-400" : "text-slate-300"}`} /></button>)}<span className="text-sm">{draft.studentPerformanceRating} / 5</span></div></fieldset>
        {feedback("studentPerformanceNotes", "Detailed student review", 5)}
        {feedback("classOverview", "Class overview", 4)}{feedback("remarks", "Remarks")}{feedback("teacherNotes", "Private teacher notes & observations")}
      </Section>
      <Section title="Progress & next steps">
        {feedback("previousHomework", "Previous homework")}
        <Field label="Previous homework completion"><select className={control} value={draft.homeworkStatus} onChange={e => update("homeworkStatus", e.target.value as ReportInput["homeworkStatus"])}>{Object.entries(homeworkStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        {feedback("assignmentGiven", "Homework / assignment given")}
        <div className="grid sm:grid-cols-3 gap-4">{textField("testName", "Test name / topic")}
          <Field label="Test marks"><input type="number" min="0" max={draft.testMaxMarks ?? undefined} step="any" className={control} value={draft.testMarks ?? ""} onChange={e => update("testMarks", e.target.value === "" ? null : e.target.valueAsNumber)} /></Field>
          <Field label="Maximum marks"><input type="number" min="0.01" step="any" className={control} value={draft.testMaxMarks ?? ""} onChange={e => update("testMaxMarks", e.target.value === "" ? null : e.target.valueAsNumber)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">{textField("nextTestDate", "Next test date", "date")}{textField("nextTestTime", "Next test time", "time")}</div>
        {feedback("nextTestDetails", "Next test details")}{feedback("nextSessionPlan", "Next session learning plan")}
      </Section>
      <Section title="Student’s full timetable">
        <p className="text-sm text-slate-500">All recorded classes across subjects and tutors, including past and upcoming sessions. A copy is saved with this report.</p>
        <ReportTimetable entries={timetable} currentSessionId={session.id} />
      </Section>
      <Section title="Technical issues">
        <Field label="Did technical issues occur?"><select className={control} value={draft.technicalIssuesOccurred ? "yes" : "no"} onChange={e => update("technicalIssuesOccurred", e.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></select></Field>
        {draft.technicalIssuesOccurred && <>{feedback("technicalIssueDescription", "Technical issue description")}{feedback("technicalIssueImpact", "Impact on the class")}</>}
      </Section>
    </fieldset>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
    <div className="flex flex-wrap justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Link href="/teacher/reports" aria-disabled={busy} onClick={e => { if (busy || (dirty && !window.confirm("Leave without saving your changes?"))) e.preventDefault(); }} className="px-3 py-2 text-sm font-semibold text-slate-600">Cancel</Link>
      <div className="flex flex-wrap gap-3"><button type="submit" value="draft" formNoValidate disabled={busy || !!connectionError} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Save draft</button>
        <button type="submit" value="publish" disabled={busy || !!connectionError} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save & submit report"}</button></div>
    </div>
  </form>;
}
