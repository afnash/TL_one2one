import Link from "next/link";
import type { ReactNode } from "react";
import type { ReportContact, SessionReport } from "@/types";
import { homeworkStatuses } from "@/lib/session-report";
import { ReportTimetable } from "./ReportTimetable";

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{value === undefined || value === null || value === "" ? "Not recorded" : value}</dd></div>;
}

function Contact({ label, person }: { label: string; person?: ReportContact }) {
  return <Detail label={label} value={[person?.name, person?.email, person?.phone].filter(Boolean).join("\n")} />;
}

export function SessionReportDetails({ report: r, editable = false }: { report: SessionReport; editable?: boolean }) {
  return <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-bold text-slate-900">{r.topicTaught || "Session report"}</h2><p className="text-sm text-slate-600">{r.studentName} · {r.subject}</p></div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{r.status === "DRAFT" ? "Draft" : "Submitted"}</span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{r.studentPerformanceRating} / 5</span>
        {editable && <Link className="rounded-lg border border-indigo-200 px-3 py-2 text-indigo-700" href={`/teacher/session/${r.sessionId}/report`}>Reopen report</Link>}
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
      <Detail label="Session date" value={r.date} /><Detail label="Time" value={`${r.startTime || "Not recorded"} – ${r.endTime || "Not recorded"}`} />
      <Detail label="Duration" value={`${r.durationMinutes} minutes`} /><Detail label="Class completion" value={r.completionStatus === "PARTIAL" ? "Partially completed" : r.completionStatus === "COMPLETED" ? "Completed" : undefined} />
      {r.partialReason && <Detail label="Reason for partial completion" value={r.partialReason} />}
    </dl>
    <dl className="grid gap-4 sm:grid-cols-2"><Detail label="Topics covered" value={r.topicsCovered?.join(", ")} /><Detail label="Detailed student review" value={r.studentPerformanceNotes} /></dl>
    <details className="group rounded-xl border border-slate-200 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-indigo-700">Full report details</summary>
      <div className="mt-5 space-y-6">
        <section className="space-y-3"><h3 className="font-semibold">People</h3><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Student" value={[r.studentName, r.studentGrade, r.studentEmail, r.studentPhone].filter(Boolean).join("\n")} />
          <Contact label="Parent contact" person={r.parentContact} /><Contact label="Tutor details" person={r.tutorContact} /><Contact label="Manager details" person={r.managerContact} />
        </dl></section>
        <section className="space-y-3"><h3 className="font-semibold">Teaching record</h3><dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Work completed" value={r.workCompleted} /><Detail label="Class overview" value={r.classOverview} />
          <Detail label="Remarks" value={r.remarks} /><Detail label="Private teacher notes" value={r.teacherNotes} />
        </dl></section>
        <section className="space-y-3"><h3 className="font-semibold">Progress & next steps</h3><dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Previous homework" value={r.previousHomework} /><Detail label="Homework completion" value={r.homeworkStatus ? homeworkStatuses[r.homeworkStatus] : undefined} />
          <Detail label="Homework / assignment given" value={r.assignmentGiven} /><Detail label="Test name / topic" value={r.testName} />
          <Detail label="Test marks" value={r.testMarks != null && r.testMaxMarks != null ? `${r.testMarks} / ${r.testMaxMarks}` : undefined} />
          <Detail label="Next test date & time" value={[r.nextTestDate, r.nextTestTime].filter(Boolean).join(" · ")} /><Detail label="Next test details" value={r.nextTestDetails} />
          <Detail label="Next session learning plan" value={r.nextSessionPlan} />
        </dl></section>
        <section className="space-y-3"><h3 className="font-semibold">Technical issues</h3><dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Issues occurred" value={r.technicalIssuesOccurred === undefined ? undefined : r.technicalIssuesOccurred ? "Yes" : "No"} />
          {r.technicalIssueDescription && <Detail label="Description" value={r.technicalIssueDescription} />}{r.technicalIssueImpact && <Detail label="Impact on the class" value={r.technicalIssueImpact} />}
        </dl></section>
        <section className="space-y-3"><h3 className="font-semibold">Student timetable at time of report</h3><ReportTimetable entries={r.timetable ?? []} currentSessionId={r.sessionId} /></section>
      </div>
    </details>
  </article>;
}
