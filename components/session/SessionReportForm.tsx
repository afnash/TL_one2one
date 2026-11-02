"use client";

import { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, AlertCircle, CheckCircle2, Save, Send } from "lucide-react";
import { useLMS } from "@/lib/store";
import { buildSessionReport, homeworkStatuses, reportDurationSeconds, validateSessionReport, type ReportInput } from "@/lib/session-report";
import type { Session, SessionReport } from "@/types";
import { ReportTimetable } from "./ReportTimetable";

const control = "mt-1.5 block h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-muted";

function Field({ label, required = false, children }: { label: string; required?: boolean; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-foreground">
        <span>{label}</span>
        {required ? (
          <span className="text-xs font-normal text-muted-foreground">
            Required
          </span>
        ) : null}
      </label>
      {cloneElement(children, { id })}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="border-b pb-3">
        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function SessionReportForm({ session, existing }: { session: Session; existing?: SessionReport }) {
  const { directory, sessionReports, assignments, submissions, getStudentTimetable, createSessionReport, connectionError } = useLMS();
  const router = useRouter();
  const timetable = getStudentTimetable(session.studentId);
  const [draft, setDraft] = useState(() => buildSessionReport({
    session,
    existing,
    student: directory.students.find(s => s.id === session.studentId),
    tutor: directory.teachers.find(t => t.id === session.teacherId),
    reports: sessionReports,
    assignments,
    submissions,
    timetable,
  }));
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
    setDirty(true);
    setMessage("");
    setError("");
  }

  function textField(
    key: "topicTaught" | "studentEmail" | "studentPhone" | "studentGrade" | "testName" | "nextTestDate" | "nextTestTime",
    label: string,
    type = "text",
    required = false
  ) {
    return (
      <Field label={label} required={required}>
        <input
          required={required}
          className={control}
          type={type}
          value={draft[key] ?? ""}
          onChange={e => update(key, e.target.value)}
        />
      </Field>
    );
  }

  function feedback(
    key: "partialReason" | "workCompleted" | "studentPerformanceNotes" | "classOverview" | "remarks" | "teacherNotes" | "previousHomework" | "assignmentGiven" | "nextTestDetails" | "nextSessionPlan" | "technicalIssueDescription" | "technicalIssueImpact",
    label: string,
    rows = 3,
    required = false
  ) {
    return (
      <Field label={label} required={required}>
        <textarea
          required={required}
          rows={rows}
          className={control}
          value={draft[key] ?? ""}
          onChange={e => update(key, e.target.value)}
        />
      </Field>
    );
  }

  function addTopic() {
    const tag = newTopic.trim();
    if (tag) update("topicsCovered", Array.from(new Set([...draft.topicsCovered, tag])));
    setNewTopic("");
  }

  async function save(publish: boolean) {
    if (busy) return;
    const report: ReportInput = {
      ...draft,
      durationSeconds,
      durationMinutes,
      timetable,
      topicsCovered: Array.from(new Set([...draft.topicsCovered, ...(newTopic.trim() ? [newTopic.trim()] : [])])),
      status: publish ? "SAVED" : "DRAFT"
    };
    const validation = validateSessionReport(report, publish);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await createSessionReport(report);
      setDraft(report);
      setNewTopic("");
      setDirty(false);
      setMessage(publish ? "Report submitted successfully." : "Draft saved. You can reopen it anytime.");
      if (publish) router.push("/teacher/reports");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the report. Your entries are retained in this form.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-6 pb-12"
      onSubmit={event => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        void save(submitter?.value !== "draft");
      }}
    >
      <p className="text-sm text-muted-foreground">
        Fill in the fields marked Required. Submitted reports are added to the master report sheet.
      </p>

      <fieldset disabled={busy} className="space-y-6 min-w-0">
        {/* Section 1: Overview */}
        <Section title="Session & Student Metadata" subtitle="Automatic link with student roster and teacher records">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Student Name"><input className={control} readOnly value={draft.studentName} /></Field>
            <Field label="Subject"><input className={control} readOnly value={draft.subject} /></Field>
            <Field label="Grade / Level"><input className={control} readOnly value={draft.studentGrade || "N/A"} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Field label="Session Date" required><input type="date" required className={control} value={draft.date} onChange={e => update("date", e.target.value)} /></Field>
            <Field label="Start Time" required><input type="time" step="1" required className={control} value={draft.startTime} onChange={e => update("startTime", e.target.value)} /></Field>
            <Field label="End Time" required><input type="time" step="1" required className={control} value={draft.endTime} onChange={e => update("endTime", e.target.value)} /></Field>
            <div className="text-sm font-medium text-foreground">
              Calculated Duration
              <output aria-live="polite" className="mt-1.5 flex h-10 items-center rounded-lg border bg-muted px-3 text-sm font-medium tabular-nums text-foreground">
                {durationMinutes} mins ({Math.round(durationSeconds / 60)}m)
              </output>
            </div>
          </div>
          <Field label="Lesson Completion Status" required>
            <select className={control} value={draft.completionStatus} onChange={e => update("completionStatus", e.target.value as ReportInput["completionStatus"])}>
              <option value="COMPLETED">Completed in Full</option>
              <option value="PARTIAL">Partially Completed</option>
            </select>
          </Field>
          {draft.completionStatus === "PARTIAL" && feedback("partialReason", "Reason for Partial Completion", 2, true)}
        </Section>

        {/* Section 2: Teaching Record & Performance */}
        <Section title="Lesson Instruction & Comprehension Record" subtitle="Details on topics taught, student understanding, and lesson observations">
          {textField("topicTaught", "Primary Topic Taught", "text", true)}
          <div className="space-y-2">
            <Field label="Subtopics Covered">
              <div className="flex gap-2 mt-1.5">
                <input
                  className={control + " !mt-0"}
                  value={newTopic}
                  placeholder="Type subtopic name and click Add"
                  onChange={e => { setNewTopic(e.target.value); setDirty(true); setMessage(""); }}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
                />
                <button type="button" onClick={addTopic} className="h-10 shrink-0 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70">
                  Add
                </button>
              </div>
            </Field>
            {draft.topicsCovered.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {draft.topicsCovered.map(topic => (
                  <li key={topic} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    <span>{topic}</span>
                    <button type="button" aria-label={`Remove topic ${topic}`} onClick={() => update("topicsCovered", draft.topicsCovered.filter(t => t !== topic))} className="text-muted-foreground hover:text-destructive">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {feedback("workCompleted", "Work Completed & Exercises Covered", 3, true)}

          <fieldset className="rounded-xl border bg-background p-4">
            <legend className="flex items-center gap-2 px-2 text-sm font-medium text-foreground">
              <span>Comprehension & Performance Rating *</span>
              <span className="text-xs font-normal text-muted-foreground">Required</span>
            </legend>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5`}
                    aria-pressed={draft.studentPerformanceRating === star}
                    onClick={() => update("studentPerformanceRating", star)}
                    className="p-1 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= draft.studentPerformanceRating ? "text-amber-500 fill-amber-400" : "text-border"}`} />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {draft.studentPerformanceRating ? `${draft.studentPerformanceRating} / 5 Stars` : "Select rating (1-5)"}
              </span>
            </div>
          </fieldset>

          {feedback("studentPerformanceNotes", "Student Performance & Understanding Observations", 4, true)}
          {feedback("classOverview", "Lesson Overview & Engagement Summary", 3)}
          {feedback("teacherNotes", "Private Teacher Notes & Internal Observations", 2)}
        </Section>

        {/* Section 3: Homework & Next Steps */}
        <Section title="Assignments, Homework & Future Plan" subtitle="Evaluation of past homework and roadmap for next session">
          {feedback("previousHomework", "Previous Homework Checked", 2)}
          <Field label="Previous Homework Status" required>
            <select className={control} value={draft.homeworkStatus} onChange={e => update("homeworkStatus", e.target.value as ReportInput["homeworkStatus"])}>
              {Object.entries(homeworkStatuses).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          {feedback("assignmentGiven", "New Homework / Assignment Assigned", 2)}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {textField("testName", "Class Test Name (Optional)")}
            <Field label="Test Marks Obtained">
              <input
                type="number"
                min="0"
                max={draft.testMaxMarks ?? undefined}
                step="any"
                className={control}
                value={draft.testMarks ?? ""}
                onChange={e => update("testMarks", e.target.value === "" ? null : e.target.valueAsNumber)}
              />
            </Field>
            <Field label="Maximum Marks">
              <input
                type="number"
                min="0.01"
                step="any"
                className={control}
                value={draft.testMaxMarks ?? ""}
                onChange={e => update("testMaxMarks", e.target.value === "" ? null : e.target.valueAsNumber)}
              />
            </Field>
          </div>

          {feedback("nextSessionPlan", "Plan for Next Lesson", 3, true)}
        </Section>

        {/* Section 4: Timetable */}
        <Section title="Student Timetable Snapshot" subtitle="Linked timetable record across all assigned educators">
          <ReportTimetable entries={timetable} currentSessionId={session.id} />
        </Section>

        {/* Section 5: Technical Issues */}
        <Section title="Technical Issues Audit" subtitle="Log any audio, video, or connectivity disruptions during the class">
          <Field label="Did Technical Issues Occur?">
            <select className={control} value={draft.technicalIssuesOccurred ? "yes" : "no"} onChange={e => update("technicalIssuesOccurred", e.target.value === "yes")}>
              <option value="no">No, Lesson went smoothly</option>
              <option value="yes">Yes, Disruptions occurred</option>
            </select>
          </Field>
          {draft.technicalIssuesOccurred && (
            <div className="space-y-4 pt-2">
              {feedback("technicalIssueDescription", "Technical Issue Description", 2, true)}
              {feedback("technicalIssueImpact", "Impact on Lesson & Time Lost", 2, true)}
            </div>
          )}
        </Section>
      </fieldset>

      {/* Error & Success Messages */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div role="status" className="flex items-center gap-2 rounded-xl border bg-secondary/50 p-3.5 text-sm text-foreground">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <Link
          href="/teacher/reports"
          aria-disabled={busy}
          onClick={e => {
            if (busy || (dirty && !window.confirm("Leave without saving your changes?"))) e.preventDefault();
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="submit"
            value="draft"
            formNoValidate
            disabled={busy || !!connectionError}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="submit"
            value="publish"
            disabled={busy || !!connectionError}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{busy ? "Submitting..." : "Submit report"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
