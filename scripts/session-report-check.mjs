import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../lib/session-report.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { normalizeReportTime, reportDurationSeconds, studentTimetable, buildSessionReport, validateSessionReport } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

assert.equal(normalizeReportTime("12:00 AM"), "00:00");
assert.equal(normalizeReportTime("12:00 PM"), "12:00");
assert.equal(normalizeReportTime("4:09 pm"), "16:09");
assert.equal(normalizeReportTime("23:59:30"), "23:59:30");
for (const time of ["24:00", "10:60", "0:00 PM", "13:00 AM", "bad"]) assert.equal(normalizeReportTime(time), "");
assert.equal(reportDurationSeconds("23:45", "00:15"), 1800);
assert.equal(reportDurationSeconds("09:00", "09:00"), 0);
assert.equal(reportDurationSeconds("09:00", ""), 0);
assert.equal(reportDurationSeconds("09:00:10", "09:01:20"), 70);

const session = { id: "session", studentId: "student", teacherId: "tutor", studentName: "Student", teacherName: "Tutor", subject: "Math", topic: "Fractions", date: "2026-09-20", scheduledTime: "09:00", actualStartTime: "09:05 AM", actualEndTime: "10:01 AM", actualDurationSeconds: 3375, durationMinutes: 56, status: "COMPLETED" };
const schedule = [session, { ...session, id: "other-tutor", teacherId: "other", date: "2026-09-21" }, { ...session, id: "group", studentId: "other-student", studentIds: ["student"], date: "2026-09-22" }, { ...session, id: "unrelated", studentId: "other-student" }];
const timetable = studentTimetable(schedule, "student");
assert.deepEqual(timetable.map(s => s.sessionId), ["session", "other-tutor", "group"]);
assert.equal("studentIds" in timetable[2], false);
const inputs = { session, reports: [], assignments: [], submissions: [], timetable,
  student: { name: "Student", email: "student@example.test", phone: "111", grade: "8", parentContact: { name: "Parent", email: "parent@example.test", phone: "222" } },
  tutor: { name: "Tutor", email: "tutor@example.test", phone: "333" } };
const initial = buildSessionReport(inputs);
assert.equal(initial.date, session.date);
assert.equal(initial.startTime, "09:05");
assert.equal(initial.durationSeconds, 3375);
assert.equal(initial.studentEmail, "student@example.test");
assert.equal(initial.parentContact.name, "Parent");
assert.equal(initial.homeworkStatus, "NOT_SET");
assert.equal(validateSessionReport(initial, true), null);
assert.match(validateSessionReport({ ...initial, completionStatus: "PARTIAL" }, true), /reason/i);
assert.equal(validateSessionReport({ ...initial, completionStatus: "PARTIAL" }, false), null);
assert.match(validateSessionReport({ ...initial, technicalIssuesOccurred: true }, true), /technical/i);
for (const [testMarks, testMaxMarks] of [[21, 20], [-1, 20], [0, 0], [null, 20], [1, null], [NaN, 20]]) {
  assert.match(validateSessionReport({ ...initial, testMarks, testMaxMarks }, true), /marks/i);
}
assert.equal(validateSessionReport({ ...initial, testMarks: 0, testMaxMarks: 20 }, true), null);
assert.equal(validateSessionReport({ ...initial, testMarks: 12.5, testMaxMarks: 20 }, true), null);
const existing = { ...initial, id: "report", createdAt: "2026-09-20T12:00:00Z", date: "2026-09-18", status: "SAVED", studentEmail: "", testMarks: 0, testMaxMarks: 20,
  completionStatus: "PARTIAL", partialReason: "Ran out of time", workCompleted: "Questions 1–8", classOverview: "Revision", remarks: "Continue next time",
  studentPerformanceRating: 4, studentPerformanceNotes: "Detailed\nreview", teacherNotes: "Private", previousHomework: "Worksheet", homeworkStatus: "PARTIAL",
  assignmentGiven: "Questions 9–10", nextSessionPlan: "Decimals", testName: "Quiz", nextTestDate: "2026-09-30", nextTestTime: "09:30", nextTestDetails: "Decimals",
  managerContact: { name: "Manager", email: "manager@example.test", phone: "444" }, technicalIssuesOccurred: true, technicalIssueDescription: "Connection lost", technicalIssueImpact: "Lost 5 minutes" };
const reopened = buildSessionReport({ ...inputs, existing: JSON.parse(JSON.stringify(existing)) });
assert.deepEqual(reopened, existing, "Every saved field survives rehydration, including zero marks and cleared contact details");
const homework = { id: "hw", kind: "HOMEWORK", title: "Worksheet", subject: "Math", assignedStudentIds: ["student"], createdAt: "2026-09-19T10:00:00Z" };
assert.equal(buildSessionReport({ ...inputs, assignments: [homework], submissions: [{ assignmentId: "hw", studentId: "student", status: "REVIEWED", submittedAt: "2026-09-19T18:00:00Z" }] }).homeworkStatus, "COMPLETED");
const previous = { ...existing, sessionId: "previous", date: "2026-09-19", assignmentGiven: "Earlier homework" };
assert.equal(buildSessionReport({ ...inputs, reports: [previous] }).previousHomework, "Earlier homework");
assert.equal(buildSessionReport({ ...inputs, reports: [{ ...previous, status: "DRAFT" }] }).previousHomework, "");
console.log("PASS: legacy times, overnight/zero durations, full timetable scope, prefill, conditional validation, homework, and report round trip.");
