// Install the isolated browser dependency with:
// npm install --prefix node_modules/.report-test --no-package-lock --no-save playwright
// Run against a local dev server. All collection requests are intercepted; no real records are changed.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : "../node_modules/.report-test/node_modules/playwright/index.mjs");
const base = process.argv[2] || "http://localhost:3100";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Use a local test server");
const tutor = { id: "test-tutor", name: "Test Tutor", email: "tutor@example.test", phone: "111111", avatar: "/icon.jpg", subjects: ["Math"], rating: 4, totalStudents: 1, totalSessions: 2, status: "active", joinedDate: "2026-01-01" };
const student = { id: "test-student", name: "Test Student", email: "student@example.test", phone: "222222", avatar: "/icon.jpg", grade: "8", subjects: ["Math"], teacherId: tutor.id, teacherName: tutor.name, overallProgress: 50, pendingAssignmentsCount: 0, status: "active", joinedDate: "2026-01-01", attendanceRate: 100 };
const session = { id: "test-session", teacherId: tutor.id, teacherName: tutor.name, teacherAvatar: tutor.avatar, studentId: student.id, studentName: student.name, studentAvatar: student.avatar, subject: "Math", topic: "Fractions", date: "2026-09-20", scheduledTime: "09:00", actualStartTime: "09:05 AM", actualEndTime: "10:01 AM", actualDurationSeconds: 3375, durationMinutes: 56, status: "COMPLETED" };
const legacy = { id: "legacy-report", sessionId: "past-session", teacherId: tutor.id, studentId: student.id, studentName: student.name, subject: "Math", date: "2026-09-19", startTime: "9:00 AM", endTime: "10:00 AM", durationSeconds: 3600, durationMinutes: 60, topicTaught: "Legacy lesson", topicsCovered: ["Addition"], assignmentGiven: "Earlier homework", studentPerformanceRating: 3, studentPerformanceNotes: "Earlier review", teacherNotes: "Earlier private notes", nextSessionPlan: "Fractions", status: "SAVED", createdAt: "2026-09-19T10:00:00Z" };
const tables = {
  lms_teachers: [tutor], lms_students: [student], lms_subjects: [],
  lms_sessions: [session, { ...session, id: "past-session", date: "2026-09-19", topic: "Legacy lesson" },
    { ...session, id: "other-tutor-session", teacherId: "other-tutor", teacherName: "Other Tutor", date: "2026-09-23", subject: "Science", status: "SCHEDULED" },
    { ...session, id: "group-session", studentId: "another-student", studentIds: [student.id], teacherId: "other-tutor", date: "2026-09-24", topic: "Group revision" },
    { ...session, id: "unrelated-session", studentId: "another-student", teacherId: "other-tutor", topic: "Unrelated lesson" }],
  lms_sessionreports: [legacy], lms_assignments: [], lms_submissions: [], lms_whiteboards: [], lms_materials: [], lms_notifications: [],
};
let failReportSave = false;
let saveDelay = 0;
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  context.setDefaultTimeout(15000);
  await context.addInitScript(id => localStorage.setItem("onetoone_identity", JSON.stringify({ role: "TEACHER", id })), tutor.id);
  await context.route("**/rest/v1/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/rpc/lms_patch")) {
      const { p_table, p_id, p_patch } = route.request().postDataJSON();
      if (p_table === "lms_sessionreports") {
        if (saveDelay) await new Promise(resolve => setTimeout(resolve, saveDelay));
        if (failReportSave) { await route.fulfill({ status: 503, json: { message: "Test save failure" } }); return; }
      }
      const rows = tables[p_table];
      assert.ok(rows, `Unexpected write to ${p_table}`);
      const index = rows.findIndex(row => row.id === p_id);
      const saved = { ...(index >= 0 ? rows[index] : {}), ...p_patch, id: p_id };
      if (index < 0) rows.push(saved); else rows[index] = saved;
      await route.fulfill({ status: 204 });
    } else {
      assert.equal(route.request().method(), "GET", "Only intercepted RPC writes are allowed");
      const table = url.pathname.split("/").at(-1);
      assert.ok(tables[table], `Unexpected table ${table}`);
      // Exercise asynchronous hydration rather than relying on a warm store.
      if (table === "lms_sessionreports") await new Promise(resolve => setTimeout(resolve, 350));
      await route.fulfill({ json: tables[table].map(data => ({ data })) });
    }
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("dialog", dialog => dialog.accept());
  await page.goto(`${base}/teacher/reports`);
  await page.getByRole("link", { name: "End Session report" }).click();
  const form = page.locator("form");
  await page.getByLabel("Session date", { exact: true }).waitFor();
  assert.equal(await page.getByLabel("Session date", { exact: true }).inputValue(), session.date);
  assert.equal(await page.getByLabel("Start time", { exact: true }).inputValue(), "09:05");
  assert.equal(await page.getByLabel("Student email", { exact: true }).inputValue(), student.email);
  assert.equal(await page.getByLabel("Tutor email", { exact: true }).inputValue(), tutor.email);
  assert.equal(await page.getByLabel("Previous homework", { exact: true }).inputValue(), "Earlier homework");
  assert.equal(await page.locator("output").textContent(), "56.25 minutes");
  assert.equal(await page.getByRole("cell", { name: "Other Tutor", exact: true }).count(), 1);
  assert.equal(await page.getByText("Group revision", { exact: true }).count(), 1);
  assert.equal(await page.getByText("Unrelated lesson", { exact: true }).count(), 0);
  console.log("Browser: prefill and complete timetable passed");
  await page.getByLabel("Start time", { exact: true }).fill("23:45");
  await page.getByLabel("End time", { exact: true }).fill("00:15");
  assert.equal(await page.locator("output").textContent(), "30 minutes");
  await page.getByLabel("End time", { exact: true }).fill("23:45");
  assert.equal(await page.locator("output").textContent(), "0 minutes");
  await page.getByLabel("Start time", { exact: true }).fill("09:05");
  await page.getByLabel("End time", { exact: true }).fill("10:01");
  await page.getByLabel("Class completion", { exact: true }).selectOption("PARTIAL");
  await page.getByRole("button", { name: "Save & submit report" }).click();
  await form.getByRole("alert").waitFor();
  assert.match(await form.getByRole("alert").textContent(), /reason/);
  const fields = {
    "Session date": "2026-09-20", "Reason for partial completion": "Need another lesson for the final exercise", "Student email": "updated-student@example.test", "Student phone": "222333", "Student grade": "9",
    "Parent name": "Test Parent", "Parent email": "parent@example.test", "Parent phone": "+91 9000000001",
    "Tutor name": "Updated Tutor", "Tutor email": "updated-tutor@example.test", "Tutor phone": "+91 9000000002",
    "Manager name": "Test Manager", "Manager email": "manager@example.test", "Manager phone": "+91 9000000003",
    "Primary topic taught": "Fraction operations", "Work completed": "Questions 1–8\nReviewed corrections", "Detailed student review": "Explains equivalent fractions clearly.\nNeeds practice simplifying answers.",
    "Class overview": "Revision and guided practice", "Remarks": "Continue final exercise", "Private teacher notes & observations": "Keep pacing steady",
    "Previous homework": "Worksheet 3", "Homework / assignment given": "Finish questions 9–12", "Test name / topic": "Fractions quiz", "Test marks": "0", "Maximum marks": "20",
    "Next test date": "2026-09-30", "Next test time": "09:30", "Next test details": "Equivalent fractions and simplification", "Next session learning plan": "Decimal conversion",
  };
  for (const [label, value] of Object.entries(fields)) await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Previous homework completion", { exact: true }).selectOption("PARTIAL");
  await page.getByRole("button", { name: "Rate 4 out of 5" }).click();
  await page.getByLabel("Topics covered", { exact: true }).fill("Equivalent fractions");
  await page.getByRole("button", { name: "Add topic", exact: true }).click();
  await page.getByLabel("Topics covered", { exact: true }).fill("Simplification"); // Also save a pending tag.
  await page.getByLabel("Did technical issues occur?", { exact: true }).selectOption("yes");
  fields["Technical issue description"] = "Audio dropped twice";
  fields["Impact on the class"] = "Lost 5 minutes; repeated instructions";
  for (const label of ["Technical issue description", "Impact on the class"]) await page.getByLabel(label, { exact: true }).fill(fields[label]);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await form.getByText("Draft saved. You can reopen it from Reports.", { exact: true }).waitFor();
  console.log("Browser: full draft saved");
  const savedDraft = structuredClone(tables.lms_sessionreports.find(r => r.sessionId === session.id));
  assert.equal(savedDraft.status, "DRAFT");
  assert.equal(savedDraft.testMarks, 0);
  assert.equal(savedDraft.durationSeconds, 3375);
  assert.equal(savedDraft.timetable.length, 4);
  assert.equal(tables.lms_sessions.find(s => s.id === session.id).reportId, savedDraft.id);
  assert.equal(tables.lms_students[0].lastSessionDate, session.date);
  await page.reload();
  await page.getByLabel("Session date", { exact: true }).waitFor();
  for (const [label, value] of Object.entries(fields)) assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), value, `Draft reopened: ${label}`);
  assert.equal(await page.getByLabel("Previous homework completion", { exact: true }).inputValue(), "PARTIAL");
  assert.equal(await page.getByRole("button", { name: "Rate 4 out of 5" }).getAttribute("aria-pressed"), "true");
  assert.equal(await page.getByRole("button", { name: "Remove topic Simplification" }).count(), 1);
  console.log("Browser: draft reload preserved all fields");
  saveDelay = 700;
  await page.getByRole("button", { name: "Save & submit report" }).click();
  await page.getByRole("button", { name: "Saving…", exact: true }).waitFor();
  assert.match(page.url(), /\/report$/);
  assert.equal(await page.getByRole("button", { name: "Saving…", exact: true }).isDisabled(), true);
  await page.waitForURL(`${base}/teacher/reports`);
  console.log("Browser: submission confirmed");
  const saved = tables.lms_sessionreports.find(r => r.sessionId === session.id);
  assert.deepEqual(saved, { ...savedDraft, status: "SAVED" });
  assert.equal(tables.lms_sessionreports.filter(r => r.sessionId === session.id).length, 1);
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Fraction operations" }) });
  await card.getByText("Full report details", { exact: true }).click();
  for (const text of ["Test Parent", "Test Manager", "Audio dropped twice", "0 / 20", "Finish questions 9–12"]) assert.ok(await card.getByText(text, { exact: false }).count(), `Report display: ${text}`);
  await card.getByRole("link", { name: "Reopen report" }).click();
  for (const [label, value] of Object.entries(fields)) assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), value, `Submitted report reopened: ${label}`);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Form fits mobile viewport");
  failReportSave = true;
  await page.getByLabel("Remarks", { exact: true }).fill("Unsaved text survives a failed request");
  await page.getByRole("button", { name: "Save & submit report" }).click();
  await form.getByRole("alert").waitFor();
  assert.match(await form.getByRole("alert").textContent(), /Test save failure/);
  assert.equal(await page.getByLabel("Remarks", { exact: true }).inputValue(), "Unsaved text survives a failed request");
  assert.match(page.url(), /\/report$/);
  assert.equal(tables.lms_sessionreports.find(r => r.sessionId === session.id).remarks, fields.Remarks);
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("PASS: prefill, full timetable, conditional validation, draft/reload, submit/reopen, all fields, zero marks, pending tags, save confirmation, mobile layout, and failed-save retention.");
} finally { await browser.close(); }
