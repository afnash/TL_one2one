import type { Assignment, ReportContact, Session, SessionReport, Student, StudentTimetableEntry, Submission, Teacher } from "@/types";

export type ReportInput = Omit<SessionReport, "id" | "createdAt">;

export const homeworkStatuses = {
  NOT_SET: "No previous homework",
  NOT_STARTED: "Not started",
  PARTIAL: "Partially completed",
  COMPLETED: "Completed",
  NOT_CHECKED: "Not checked",
} as const;

// Older live sessions stored locale-formatted times; native time inputs need 24-hour values.
export function normalizeReportTime(value = ""): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);
  if (minute > 59 || second > 59 || hour > (match[4] ? 12 : 23) || (match[4] && hour === 0)) return "";
  if (match[4]) hour = hour % 12 + (match[4].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}${match[3] ? `:${match[3]}` : ""}`;
}

export function reportDurationSeconds(start: string, end: string): number {
  const seconds = (value: string) => {
    const normalized = normalizeReportTime(value);
    if (!normalized) return null;
    const [hours, minutes, seconds = 0] = normalized.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  const from = seconds(start), to = seconds(end);
  return from === null || to === null ? 0 : (to - from + 86400) % 86400;
}

export function studentTimetable(sessions: Session[], studentId: string): StudentTimetableEntry[] {
  return sessions.filter(s => s.studentId === studentId || s.studentIds?.includes(studentId))
    .map(s => ({ sessionId: s.id, date: s.date, startTime: normalizeReportTime(s.scheduledTime), durationMinutes: s.durationMinutes,
      subject: s.subject, topic: s.topic, tutorName: s.teacherName, status: s.status }))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

const contact = (person?: { name?: string; email?: string; phone?: string }): ReportContact => ({
  name: person?.name ?? "", email: person?.email ?? "", phone: person?.phone ?? "",
});

export function buildSessionReport({ session, existing, student, tutor, reports, assignments, submissions, timetable }: {
  session: Session; existing?: SessionReport; student?: Student; tutor?: Teacher;
  reports: SessionReport[]; assignments: Assignment[]; submissions: Submission[]; timetable: StudentTimetableEntry[];
}): ReportInput {
  const previous = reports.filter(r => r.sessionId !== session.id && r.studentId === session.studentId && r.subject === session.subject
    && r.status !== "DRAFT" && r.date <= session.date)
    .sort((a, b) => `${b.date} ${normalizeReportTime(b.startTime)}`.localeCompare(`${a.date} ${normalizeReportTime(a.startTime)}`))
    .find(r => r.date < session.date || normalizeReportTime(r.startTime) < normalizeReportTime(session.actualStartTime || session.scheduledTime));
  const homework = assignments.filter(a => a.kind === "HOMEWORK" && a.subject === session.subject
    && a.assignedStudentIds.includes(session.studentId) && a.createdAt.slice(0, 10) <= session.date);
  const completed = homework.filter(a => submissions.some(s => s.assignmentId === a.id && s.studentId === session.studentId
    && (s.status === "SUBMITTED" || s.status === "REVIEWED") && s.submittedAt.slice(0, 10) <= session.date)).length;
  const startTime = normalizeReportTime(existing?.startTime ?? session.actualStartTime ?? session.scheduledTime);
  const endTime = normalizeReportTime(existing?.endTime ?? session.actualEndTime);
  const durationSeconds = existing?.durationSeconds ?? session.actualDurationSeconds ?? reportDurationSeconds(startTime, endTime);
  return {
    sessionId: session.id, teacherId: session.teacherId, studentId: session.studentId, studentName: student?.name ?? session.studentName,
    studentAvatar: student?.avatar ?? session.studentAvatar, subject: session.subject, date: session.date,
    durationSeconds, durationMinutes: Math.round(durationSeconds / 60 * 100) / 100,
    topicTaught: session.topic, topicsCovered: [], assignmentGiven: session.assignmentSummary ?? "",
    studentPerformanceRating: 0, studentPerformanceNotes: "", teacherNotes: "", nextSessionPlan: "", status: "DRAFT",
    completionStatus: "COMPLETED", partialReason: "", studentEmail: student?.email ?? "", studentPhone: student?.phone ?? "",
    studentGrade: student?.grade ?? "", parentContact: contact(student?.parentContact),
    tutorContact: contact(tutor ?? { name: session.teacherName }), managerContact: contact(student?.managerContact),
    workCompleted: "", classOverview: "", remarks: "",
    previousHomework: previous?.assignmentGiven || homework.map(a => `${a.title}${a.description ? `: ${a.description}` : ""}`).join("\n"),
    homeworkStatus: previous?.assignmentGiven ? "NOT_CHECKED" : !homework.length ? "NOT_SET"
      : completed === homework.length ? "COMPLETED" : completed ? "PARTIAL" : "NOT_CHECKED",
    testName: "", testMarks: null, testMaxMarks: null, nextTestDate: "", nextTestTime: "", nextTestDetails: "",
    timetable, technicalIssuesOccurred: false, technicalIssueDescription: "", technicalIssueImpact: "",
    ...existing,
    startTime, endTime,
  };
}

export function validateSessionReport(report: ReportInput, publish: boolean): string | null {
  if (!report.date || !/^\d{4}-\d{2}-\d{2}$/.test(report.date)) return "Session date is required (YYYY-MM-DD).";
  if (publish && (!normalizeReportTime(report.startTime) || !normalizeReportTime(report.endTime))) return "Both start and end session times are required.";
  if (publish && !report.topicTaught?.trim()) return "Topic taught is required.";
  if (publish && (!report.studentPerformanceRating || report.studentPerformanceRating < 1)) return "Student performance rating (1 to 5 stars) is required.";
  if (publish && !report.studentPerformanceNotes?.trim()) return "Student performance and understanding notes are required.";
  if (publish && !report.workCompleted?.trim() && !report.classOverview?.trim()) return "Summary of work completed during class is required.";
  if (publish && !report.nextSessionPlan?.trim()) return "Plan for the next class is required.";
  if (publish && report.completionStatus === "PARTIAL" && !report.partialReason?.trim()) return "Add a reason for the partially completed class.";
  if (publish && report.technicalIssuesOccurred && (!report.technicalIssueDescription?.trim() || !report.technicalIssueImpact?.trim())) return "Describe the technical issues and their impact on the class.";
  const marks = report.testMarks, maximum = report.testMaxMarks;
  if (marks != null || maximum != null) {
    if (marks == null || maximum == null || !Number.isFinite(marks) || !Number.isFinite(maximum) || maximum <= 0 || marks < 0 || marks > maximum)
      return "Enter test marks between 0 and the maximum, with a maximum greater than 0.";
  }
  return null;
}
