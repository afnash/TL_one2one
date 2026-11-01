import type { UserRole } from "@/types";
import type { SessionIdentity } from "./session";
import { dummyVerify, HashBusy, hashPassword, needsRehash, safeEqual, verifyPassword } from "./passwords";
import { safeResourceUrl } from "./supabase";
import { supabaseAdminRequest } from "./supabase-server";

export const TABLES = ["lms_managers", "lms_teachers", "lms_students", "lms_subjects", "lms_sessions", "lms_whiteboards", "lms_assignments", "lms_submissions", "lms_materials", "lms_sessionreports", "lms_notifications"] as const;
export type Table = typeof TABLES[number];
export const isTable = (value: string): value is Table => (TABLES as readonly string[]).includes(value);

export const ACCOUNT_TABLES: { table: Table; role: Exclude<UserRole, "SUPERADMIN"> }[] = [
  { table: "lms_managers", role: "MANAGER" },
  { table: "lms_teachers", role: "TEACHER" },
  { table: "lms_students", role: "STUDENT" },
];
const OWN_ROW: Partial<Record<Table, UserRole>> = { lms_managers: "MANAGER", lms_teachers: "TEACHER", lms_students: "STUDENT" };
export const isAccountTable = (table: Table) => Boolean(OWN_ROW[table]);

export type Row = Record<string, unknown> & { id: string };
export class Denied extends Error {
  constructor(message = "You do not have permission to change this record", readonly status = 403) { super(message); }
}
const deny = (message?: string, status?: number): never => { throw new Denied(message, status); };

// ---------- PostgREST helpers ----------
const quote = (value: string) => `"${value.replace(/["\\]/g, "\\$&")}"`;
const eq = (field: string, value: string) => `data->>${field}=eq.${encodeURIComponent(value)}`;
const within = (field: string, values: Iterable<string>) => {
  const list = [...new Set(values)].filter(Boolean);
  return list.length ? `${field === "id" ? "id" : `data->>${field}`}=in.(${encodeURIComponent(list.map(quote).join(","))})` : null;
};
const contains = (field: string, value: string) => `data->${field}=cs.${encodeURIComponent(JSON.stringify([value]))}`;

const PAGE = 1000;
async function fetchRows(table: string, filter: string | null): Promise<Row[]> {
  if (filter === null) return [];
  const rows: Row[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await supabaseAdminRequest<{ data: Row }[]>(`/rest/v1/${table}?select=data&order=id&offset=${offset}&limit=${PAGE}${filter ? `&${filter}` : ""}`);
    rows.push(...page.map(row => row.data));
    if (page.length < PAGE) return rows;
  }
}
// Union of several filtered queries (PostgREST has no jsonb array-overlap filter).
async function fetchAny(table: string, filters: (string | null)[]) {
  const seen = new Map<string, Row>();
  for (const rows of await Promise.all(filters.map(filter => fetchRows(table, filter)))) for (const row of rows) seen.set(row.id, row);
  return [...seen.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
export async function fetchRow(table: string, id: string): Promise<Row | null> {
  const rows = await supabaseAdminRequest<{ data: Row }[]>(`/rest/v1/${table}?select=data&id=eq.${encodeURIComponent(id)}`);
  return rows[0]?.data ?? null;
}

// ---------- Caller scope ----------
const text = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const participants = (session: Row) => [text(session.studentId), ...list(session.studentIds)].filter(Boolean);

export interface Scope {
  session: SessionIdentity;
  self: Row | null;
  studentIds: Set<string>;   // teacher: own students; manager: managed students
  teacherIds: Set<string>;   // manager: managed teachers; student: own teacher
  sessions: Row[];           // teacher: sessions taught; student: sessions attended
  assignments: Row[];        // teacher: own; student: assigned to them
}

const scopeCache = new Map<string, { scope: Promise<Scope>; expires: number }>();

// Reads are polled every 2s per table, so scope is cached briefly for GETs. Writes
// always pass fresh=true so a just-revoked relationship cannot be used to write.
export function loadScope(session: SessionIdentity, fresh = false) {
  const key = `${session.role}:${session.id}`;
  const cached = scopeCache.get(key);
  if (!fresh && cached && cached.expires > Date.now()) return cached.scope;
  const scope = buildScope(session);
  if (scopeCache.size > 2000) scopeCache.clear();
  scopeCache.set(key, { scope, expires: Date.now() + 3000 });
  scope.catch(() => scopeCache.delete(key));
  return scope;
}

// Called after the caller's own write so their next read reflects it immediately.
export const invalidateScope = (session: SessionIdentity) => scopeCache.delete(`${session.role}:${session.id}`);

async function buildScope(session: SessionIdentity): Promise<Scope> {
  const scope: Scope = { session, self: null, studentIds: new Set(), teacherIds: new Set(), sessions: [], assignments: [] };
  const { role, id } = session;
  if (role === "MANAGER") {
    scope.self = await fetchRow("lms_managers", id);
    const teachers = await fetchRows("lms_teachers", eq("managerId", id));
    scope.teacherIds = new Set(teachers.map(t => t.id));
    const students = await fetchAny("lms_students", [eq("managerId", id), within("teacherId", scope.teacherIds)]);
    scope.studentIds = new Set(students.map(s => s.id));
  } else if (role === "TEACHER") {
    const [self, students, sessions, assignments] = await Promise.all([
      fetchRow("lms_teachers", id), fetchRows("lms_students", eq("teacherId", id)),
      fetchRows("lms_sessions", eq("teacherId", id)), fetchRows("lms_assignments", eq("teacherId", id)),
    ]);
    Object.assign(scope, { self, studentIds: new Set(students.map(s => s.id)), sessions, assignments });
  } else if (role === "STUDENT") {
    const [self, sessions, assignments] = await Promise.all([
      fetchRow("lms_students", id),
      fetchAny("lms_sessions", [eq("studentId", id), contains("studentIds", id)]),
      fetchRows("lms_assignments", contains("assignedStudentIds", id)),
    ]);
    scope.self = self;
    scope.sessions = sessions.filter(s => participants(s).includes(id));
    scope.assignments = assignments.filter(a => list(a.assignedStudentIds).includes(id));
    if (text(self?.teacherId)) scope.teacherIds.add(text(self?.teacherId));
  }
  return scope;
}

// ---------- Read visibility ----------
type Visibility = "full" | "directory" | false;

// Non-sensitive fields other roles may see of an account they are related to.
const DIRECTORY: Partial<Record<Table, string[]>> = {
  lms_managers: ["id", "name", "email", "avatar", "phone", "location", "status"],
  lms_teachers: ["id", "name", "email", "avatar", "phone", "bio", "title", "subjects", "rating", "status", "managerId", "managerName"],
};

const managerOwns = (scope: Scope, row: Row) =>
  scope.teacherIds.has(text(row.teacherId)) || scope.studentIds.has(text(row.studentId)) || list(row.studentIds).some(id => scope.studentIds.has(id));

function boardVisible(scope: Scope, row: Row) {
  const { role, id } = scope.session;
  if (role === "MANAGER") return scope.teacherIds.has(text(row.teacherId)) || scope.studentIds.has(text(row.studentId));
  if (role === "TEACHER") return text(row.teacherId) === id || scope.studentIds.has(text(row.studentId)) || scope.sessions.some(s => s.whiteboardId === row.id);
  return text(row.studentId) === id || scope.sessions.some(s => s.whiteboardId === row.id) || scope.assignments.some(a => a.whiteboardId === row.id);
}

async function checkLinkedBoard(patch: Record<string, unknown>, existing: Row | null, uid: string, S: Set<string>) {
  if (!changed(patch, existing, "whiteboardId") || !text(patch.whiteboardId)) return;
  const board = await fetchRow("lms_whiteboards", text(patch.whiteboardId));
  if (board && board.teacherId !== uid && !S.has(text(board.studentId))) deny("You can only link boards that belong to you or your students.");
}

function visibility(scope: Scope, table: Table, row: Row): Visibility {
  const { role, id } = scope.session;
  if (role === "SUPERADMIN") return "full";
  const self = scope.self;
  switch (table) {
    case "lms_subjects": return "full";
    case "lms_managers":
      if (row.id === id && role === "MANAGER") return "full";
      return role === "MANAGER" || row.id === text(self?.managerId) ? "directory" : false;
    case "lms_teachers":
      if (role === "TEACHER") return row.id === id ? "full" : false;
      if (role === "MANAGER") return scope.teacherIds.has(row.id) ? "full" : "directory";
      return scope.teacherIds.has(row.id) || scope.assignments.some(a => a.teacherId === row.id) ? "directory" : false;
    case "lms_students":
      if (role === "STUDENT") return row.id === id ? "full" : false;
      return scope.studentIds.has(row.id) ? "full" : false;
    case "lms_sessions":
      if (role === "MANAGER") return managerOwns(scope, row) && "full";
      return scope.sessions.some(s => s.id === row.id) && "full";
    case "lms_whiteboards": return boardVisible(scope, row) && "full";
    case "lms_assignments":
      if (role === "MANAGER") return scope.teacherIds.has(text(row.teacherId)) && "full";
      return scope.assignments.some(a => a.id === row.id) && "full";
    case "lms_submissions":
      if (role === "MANAGER") return scope.studentIds.has(text(row.studentId)) && "full";
      if (role === "TEACHER") return scope.assignments.some(a => a.id === row.assignmentId) && "full";
      return row.studentId === id && "full";
    case "lms_materials": return materialVisible(scope, row) && "full";
    case "lms_sessionreports":
      if (role === "STUDENT") return row.studentId === id && "full";
      if (role === "TEACHER") return (row.teacherId === id || scope.studentIds.has(text(row.studentId))) && "full";
      return (scope.teacherIds.has(text(row.teacherId)) || scope.studentIds.has(text(row.studentId))) && "full";
    case "lms_notifications": return row.userId === id && "full";
  }
}

export function materialVisible(scope: Scope, row: Row) {
  const { role, id } = scope.session;
  if (role === "SUPERADMIN") return true;
  if (role === "MANAGER") return scope.teacherIds.has(text(row.teacherId));
  if (role === "TEACHER") return row.teacherId === id;
  return row.assignedTo === "ALL" ? scope.teacherIds.has(text(row.teacherId)) : list(row.assignedTo).includes(id);
}

// Narrows the database query; `visibility` stays the authoritative check.
function readFilters(scope: Scope, table: Table): (string | null)[] | Row[] {
  const { role, id } = scope.session;
  const self = scope.self;
  if (role === "SUPERADMIN" || table === "lms_subjects") return [""];
  const S = scope.studentIds, T = scope.teacherIds;
  switch (table) {
    case "lms_managers": return role === "MANAGER" ? [""] : [within("id", [text(self?.managerId)])];
    case "lms_teachers":
      if (role === "TEACHER") return [within("id", [id])];
      if (role === "MANAGER") return [""];
      return [within("id", [...T, ...scope.assignments.map(a => text(a.teacherId))])];
    case "lms_students": return [within("id", role === "STUDENT" ? [id] : S)];
    // Group sessions list students in a jsonb array, which PostgREST cannot overlap-filter.
    case "lms_sessions": return role === "MANAGER" ? [""] : scope.sessions;
    case "lms_whiteboards":
      if (role === "MANAGER") return [within("teacherId", T), within("studentId", S)];
      return [role === "TEACHER" ? eq("teacherId", id) : eq("studentId", id), role === "TEACHER" ? within("studentId", S) : null,
        within("id", [...scope.sessions, ...scope.assignments].map(r => text(r.whiteboardId)))];
    case "lms_assignments": return role === "MANAGER" ? [within("teacherId", T)] : scope.assignments;
    case "lms_submissions":
      if (role === "STUDENT") return [eq("studentId", id)];
      return role === "TEACHER" ? [within("assignmentId", scope.assignments.map(a => a.id))] : [within("studentId", S)];
    case "lms_materials":
      if (role === "STUDENT") return [within("teacherId", T), contains("assignedTo", id)];
      return [role === "TEACHER" ? eq("teacherId", id) : within("teacherId", T)];
    case "lms_sessionreports":
      if (role === "STUDENT") return [eq("studentId", id)];
      return [role === "TEACHER" ? eq("teacherId", id) : within("teacherId", T), within("studentId", S)];
    case "lms_notifications": return [eq("userId", id)];
  }
}

export async function readVisible(scope: Scope, table: Table, offset: number, limit: number) {
  const filters = readFilters(scope, table);
  // One plain query filter: let the database page the result. If the visibility check
  // drops any row of the page (so page boundaries could shift), fall back to the full read.
  if (filters.length === 1 && typeof filters[0] === "string") {
    const page = (await supabaseAdminRequest<{ data: Row }[]>(`/rest/v1/${table}?select=data&order=id&offset=${offset}&limit=${limit}${filters[0] ? `&${filters[0]}` : ""}`)).map(row => row.data);
    const levels = page.map(row => visibility(scope, table, row));
    if (levels.every(Boolean)) return page.map((row, index) => levels[index] === "full" ? sanitize(row) : Object.fromEntries((DIRECTORY[table] || ["id"]).filter(k => k in row).map(k => [k, row[k]])));
  }
  const rows = filters.every(item => item === null || typeof item === "string")
    ? await fetchAny(table, filters as (string | null)[])
    : filters as Row[];
  const out: Record<string, unknown>[] = [];
  for (const row of rows) {
    const level = visibility(scope, table, row);
    if (level === "full") out.push(sanitize(row));
    else if (level === "directory") out.push(Object.fromEntries((DIRECTORY[table] || ["id"]).filter(k => k in row).map(k => [k, row[k]])));
  }
  return out.slice(offset, offset + limit);
}

// Never send password material or the revocation counter to the browser.
export function sanitize<T extends Record<string, unknown>>(row: T) {
  if (!row || typeof row !== "object") return row;
  const { password, passwordHash, tokenVersion: _tv, ...rest } = row;
  void _tv;
  if (password === undefined && passwordHash === undefined) return rest as unknown as T;
  return { ...rest, hasPassword: Boolean(passwordHash || password) } as unknown as T;
}

// ---------- Write authorization ----------
const SERVER_FIELDS = ["passwordHash", "hasPassword", "tokenVersion"];
// Fields a user may change on their own account; email/password go through /api/auth/credentials.
const PROFILE_FIELDS = ["name", "phone", "avatar", "bio", "timezone", "title", "location"];
const NOTIFICATION_FIELDS = ["id", "userId", "targetRole", "title", "message", "timestamp", "read", "type", "link"];
const STUDENT_SUBMISSION_FIELDS = ["id", "assignmentId", "assignmentTitle", "studentId", "studentName", "studentAvatar", "subject", "submittedAt", "status", "maxScore", "whiteboardId"];
const GRADING_FIELDS = ["status", "score", "teacherFeedback", "questionMarks"];
const STUDENT_SESSION_FIELDS = ["mediaState", "raisedHands", "codeDocument", "codeRun"];

const onlyFields = (patch: Record<string, unknown>, allowed: string[]) => {
  for (const key of Object.keys(patch)) if (key !== "id" && !allowed.includes(key)) deny();
};
const changed = (patch: Record<string, unknown>, existing: Row | null, key: string) =>
  key in patch && JSON.stringify(patch[key]) !== JSON.stringify(existing?.[key]);

function canEditCode(session: Row, userId: string) {
  return session.status === "LIVE" && (text(session.codeEditorId) || text(session.teacherId)) === userId && participants(session).concat(text(session.teacherId)).includes(userId);
}

function checkAssignmentDates(patch: Record<string, unknown>, existing: Row | null) {
  if ("dueDate" in patch && patch.dueDate !== "" && patch.dueDate != null) {
    const due = text(patch.dueDate);
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(due) ? Date.parse(`${due}T00:00:00Z`) : NaN;
    if (Number.isNaN(parsed) || new Date(parsed).toISOString().slice(0, 10) !== due) deny("Enter a valid due date (YYYY-MM-DD).", 400);
    // New assignments cannot be due before yesterday (allows for time zones).
    if (!existing && parsed < Date.now() - 36 * 3600 * 1000) deny("The due date cannot be in the past.", 400);
  }
  if ("dueTime" in patch && patch.dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(text(patch.dueTime))) deny("Enter a valid due time (HH:MM).", 400);
}

// Scores and per-question marks must be finite numbers between 0 and their maximum.
function checkMarks(patch: Record<string, unknown>, submission: Row, assignment: Row | undefined) {
  const questions = Array.isArray(assignment?.questions) ? assignment!.questions as { id?: unknown; maxScore?: unknown }[] : [];
  const computed = questions.reduce((total, q) => total + (Number(q.maxScore) || 0), 0);
  const max = Number(submission.maxScore) > 0 ? Number(submission.maxScore) : computed > 0 ? computed : 10;
  const valid = (value: unknown, limit: number) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= limit;
  if ("score" in patch && patch.score != null && !valid(patch.score, max)) deny(`Score must be a number between 0 and ${max}.`, 400);
  if ("questionMarks" in patch && patch.questionMarks != null) {
    const marks = patch.questionMarks;
    if (typeof marks !== "object" || Array.isArray(marks)) deny("Invalid marks.", 400);
    for (const [questionId, mark] of Object.entries(marks as Record<string, { marks?: unknown }>)) {
      const limit = Number(questions.find(q => q.id === questionId)?.maxScore) || max;
      if (!mark || typeof mark !== "object" || !valid(mark.marks, limit)) deny(`Marks must be a number between 0 and ${limit}.`, 400);
    }
  }
}

export interface WriteResult { patch: Record<string, unknown>; previous?: Record<string, unknown>; }

// Decides from the stored row (never the client's `previous`) whether the caller may
// apply `patch`. May rewrite the patch to the parts the caller is allowed to change.
export async function authorizeWrite(scope: Scope, table: Table, id: string, existing: Row | null, input: Record<string, unknown>): Promise<WriteResult> {
  const patch = Object.fromEntries(Object.entries(input).filter(([key]) => !SERVER_FIELDS.includes(key)));
  if (!isAccountTable(table)) delete patch.password;
  const next = { ...existing, ...patch, id } as Row;
  const { role, id: uid } = scope.session;
  const S = scope.studentIds, T = scope.teacherIds;
  const admin = role === "SUPERADMIN";

  switch (table) {
    case "lms_subjects":
      if (role !== "SUPERADMIN" && role !== "MANAGER") deny();
      break;

    case "lms_managers": case "lms_teachers": case "lms_students": {
      if (OWN_ROW[table] === role && id === uid) {
        if (!existing) deny();
        onlyFields(patch, PROFILE_FIELDS);
        break;
      }
      if (admin) break;
      if (table === "lms_teachers" && role === "MANAGER") {
        if ((existing && existing.managerId !== uid) || next.managerId !== uid) deny("You can only manage teachers assigned to you.");
        break;
      }
      if (table === "lms_students" && role === "MANAGER") {
        const owns = (row: Row) => row.managerId === uid || T.has(text(row.teacherId));
        if ((existing && !owns(existing)) || !owns(next)) deny("You can only manage students in your department.");
        break;
      }
      if (table === "lms_students" && role === "TEACHER") {
        if ((existing && existing.teacherId !== uid) || next.teacherId !== uid) deny("You can only manage your own students.");
        // Teachers set the first password of a student they create; resets go through a manager or admin.
        if (existing && typeof patch.password === "string" && patch.password) deny("Ask a manager or administrator to reset this student's password.");
        // Sign-in email and active/inactive state are managed by managers and administrators.
        if (existing && (changed(patch, existing, "email") || changed(patch, existing, "status"))) deny("Ask a manager or administrator to change this student's email or status.");
        if (!existing && patch.status !== undefined && patch.status !== "active") deny("New students start as active.");
        if (changed(patch, existing, "managerId") && ![existing?.managerId, scope.self?.managerId, "", null].includes(patch.managerId as string)) deny();
        break;
      }
      deny();
      break;
    }

    case "lms_sessions": {
      if (patch.meetingLink && (typeof patch.meetingLink !== "string" || !/^https?:\/\//i.test(patch.meetingLink))) deny("Enter a valid http(s) meeting link.", 400);
      if (admin) break;
      if (role === "MANAGER") { if ((existing && !managerOwns(scope, existing)) || !managerOwns(scope, next)) deny(); break; }
      if (role === "TEACHER") {
        if ((existing && existing.teacherId !== uid) || next.teacherId !== uid) deny("You can only change your own sessions.");
        await checkLinkedBoard(patch, existing, uid, S);
        const before = existing ? participants(existing) : [];
        if ((changed(patch, existing, "studentId") || changed(patch, existing, "studentIds")) && participants(next).some(s => !S.has(s) && !before.includes(s))) deny("You can only schedule sessions with your own students.");
        break;
      }
      // Students: own media state, own raised hand, and the code editor when it is their turn.
      if (!existing || !participants(existing).includes(uid)) deny();
      onlyFields(patch, STUDENT_SESSION_FIELDS);
      const result: WriteResult = { patch: {} };
      if ("mediaState" in patch) {
        const mine = (patch.mediaState as Record<string, unknown> | undefined)?.[uid] as { cameraOn?: unknown; micOn?: unknown } | undefined;
        result.patch.mediaState = { ...(existing!.mediaState as object || {}), [uid]: { cameraOn: mine?.cameraOn === true, micOn: mine?.micOn === true } };
      }
      if ("raisedHands" in patch) {
        const base = list(existing!.raisedHands);
        const raised = list(patch.raisedHands).includes(uid);
        result.patch.raisedHands = raised ? [...new Set([...base, uid])] : base.filter(h => h !== uid);
        result.previous = { raisedHands: base };
      }
      if ("codeDocument" in patch || "codeRun" in patch) {
        if (!canEditCode(existing!, uid)) deny("It is not your turn to edit the code.");
        if ("codeDocument" in patch) result.patch.codeDocument = patch.codeDocument;
        if ("codeRun" in patch) result.patch.codeRun = patch.codeRun;
      }
      return result;
    }

    case "lms_whiteboards": {
      if (admin) break;
      if (role === "MANAGER") { if ((existing && !boardVisible(scope, existing)) || !boardVisible(scope, next)) deny(); break; }
      if (role === "TEACHER") {
        if (existing ? !boardVisible(scope, existing) || !boardVisible(scope, next)
          : next.teacherId !== uid || (text(next.studentId) && !S.has(text(next.studentId)))) deny("You can only edit boards for your own classes and students.");
        break;
      }
      if (!existing) {
        const assignment = scope.assignments.find(a => a.id === next.assignmentId);
        const teacherOk = !text(next.teacherId) || T.has(text(next.teacherId)) || assignment?.teacherId === next.teacherId;
        if (next.studentId !== uid || next.sessionId || next.category === "ASSIGNMENT_QUESTION" || !teacherOk) deny();
        if (next.assignmentId ? !assignment || id !== `work-${assignment.id}-${uid}` : id.startsWith("work-")) deny();
        break;
      }
      if (existing.studentId === uid) { onlyFields(patch, ["elements", "lastEdited", "thumbnail", "title"]); break; }
      const session = scope.sessions.find(s => s.whiteboardId === id);
      const canWriteLive = session && session.status === "LIVE" && (participants(session).length <= 1 || list(session.writerIds).includes(uid));
      if (!canWriteLive) deny("Ask your teacher for writing access.");
      onlyFields(patch, ["elements", "lastEdited"]);
      break;
    }

    case "lms_assignments": {
      checkAssignmentDates(patch, existing);
      if (admin) break;
      if (role === "MANAGER") { if ((existing && !T.has(text(existing.teacherId))) || !T.has(text(next.teacherId))) deny(); break; }
      if (role !== "TEACHER" || (existing && existing.teacherId !== uid) || next.teacherId !== uid) deny();
      await checkLinkedBoard(patch, existing, uid, S);
      const before = list(existing?.assignedStudentIds);
      if (list(next.assignedStudentIds).some(s => !S.has(s) && !before.includes(s))) deny("You can only assign work to your own students.");
      break;
    }

    case "lms_submissions": {
      if (admin) break;
      if (role === "STUDENT") {
        if (next.studentId !== uid || (existing && existing.studentId !== uid)) deny();
        if (existing && changed(patch, existing, "assignmentId")) deny();
        if (existing?.status === "REVIEWED") deny("This assignment has already been graded.");
        onlyFields(patch, STUDENT_SUBMISSION_FIELDS);
        const assignment = scope.assignments.find(a => a.id === next.assignmentId);
        if (!assignment || (!existing && id !== `${assignment.id}-${uid}`)) deny();
        if ("status" in patch && patch.status !== "SUBMITTED") deny();
        if ("whiteboardId" in patch) {
          const board = await fetchRow("lms_whiteboards", text(patch.whiteboardId));
          if (!board || board.studentId !== uid) deny("Assignment board not found");
        }
        const questions = Array.isArray(assignment!.questions) ? assignment!.questions as { maxScore?: unknown }[] : [];
        patch.maxScore = questions.reduce((total, q) => total + (Number(q.maxScore) || 0), 0) || 10;
        break;
      }
      if (!existing) deny();
      const allowed = role === "TEACHER" ? scope.assignments.some(a => a.id === existing!.assignmentId) : role === "MANAGER" && S.has(text(existing!.studentId));
      if (!allowed) deny("Only the assignment's teacher can grade this submission.");
      onlyFields(patch, GRADING_FIELDS);
      if ("status" in patch && patch.status !== "REVIEWED") deny();
      checkMarks(patch, existing!, scope.assignments.find(a => a.id === existing!.assignmentId));
      break;
    }

    case "lms_materials": {
      if ("url" in patch && patch.url && !safeResourceUrl(text(patch.url))) deny("Enter a valid http(s) link or upload a file.");
      if (admin) break;
      if (role === "MANAGER") { if ((existing && !T.has(text(existing.teacherId))) || !T.has(text(next.teacherId))) deny(); break; }
      if (role !== "TEACHER" || (existing && existing.teacherId !== uid) || next.teacherId !== uid) deny();
      break;
    }

    case "lms_sessionreports": {
      if (admin) break;
      if (role === "MANAGER") {
        const owns = (row: Row) => T.has(text(row.teacherId)) || S.has(text(row.studentId));
        if ((existing && !owns(existing)) || !owns(next)) deny();
        break;
      }
      if (role !== "TEACHER" || (existing && existing.teacherId !== uid) || next.teacherId !== uid) deny();
      if (!S.has(text(next.studentId)) && !scope.sessions.some(s => s.id === next.sessionId && participants(s).includes(text(next.studentId)))) deny("You can only report on your own students.");
      break;
    }

    case "lms_notifications": {
      if (existing) {
        if (existing.userId === uid) { onlyFields(patch, ["read"]); break; }
        if (!admin) deny();
        break;
      }
      if (admin) break;
      onlyFields(patch, NOTIFICATION_FIELDS);
      if (next.link !== undefined && (typeof next.link !== "string" || !next.link.startsWith("/") || next.link.startsWith("//"))) deny();
      const target = text(next.userId);
      let allowed = target === uid;
      if (role === "STUDENT") allowed ||= T.has(target) || scope.assignments.some(a => a.teacherId === target);
      if (role === "TEACHER") allowed ||= S.has(target) || scope.sessions.some(s => participants(s).includes(target)) || scope.assignments.some(a => list(a.assignedStudentIds).includes(target));
      if (role === "MANAGER") allowed ||= S.has(target) || T.has(target);
      if (!allowed) deny();
      break;
    }
  }
  return { patch };
}

export function authorizeDelete(scope: Scope, table: Table, existing: Row) {
  const { role, id: uid } = scope.session;
  if (role === "SUPERADMIN") return;
  const S = scope.studentIds, T = scope.teacherIds;
  const manager = role === "MANAGER", teacher = role === "TEACHER";
  const ok = (() => {
    switch (table) {
      case "lms_managers": return false;
      case "lms_teachers": return manager && existing.managerId === uid;
      case "lms_students": return manager && (existing.managerId === uid || T.has(text(existing.teacherId)));
      case "lms_subjects": return manager;
      case "lms_sessions": return manager ? managerOwns(scope, existing) : teacher && existing.teacherId === uid;
      case "lms_whiteboards": return manager ? boardVisible(scope, existing) : teacher ? existing.teacherId === uid : existing.studentId === uid && !existing.assignmentId;
      case "lms_assignments": case "lms_materials": return manager ? T.has(text(existing.teacherId)) : teacher && existing.teacherId === uid;
      case "lms_sessionreports": return manager ? T.has(text(existing.teacherId)) || S.has(text(existing.studentId)) : teacher && existing.teacherId === uid;
      case "lms_submissions": return manager ? S.has(text(existing.studentId)) : teacher && scope.assignments.some(a => a.id === existing.assignmentId);
      case "lms_notifications": return existing.userId === uid;
    }
  })();
  if (!ok) deny("You do not have permission to delete this record");
}

// ---------- Account helpers ----------
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
const escapeLike = (value: string) => value.replace(/[\\%_*]/g, "\\$&");

// Case-insensitive lookup; the ilike only narrows, the exact compare decides.
export async function findAccountsByEmail(email: string) {
  const target = normalizeEmail(email);
  const found: { table: Table; role: Exclude<UserRole, "SUPERADMIN">; account: Row }[] = [];
  // One request per table, run together; results are read back in table order.
  const results = await Promise.all(ACCOUNT_TABLES.map(({ table }) =>
    supabaseAdminRequest<{ data: Row }[]>(`/rest/v1/${table}?select=data&limit=20&data->>email=ilike.${encodeURIComponent(escapeLike(target))}`)));
  ACCOUNT_TABLES.forEach(({ table, role }, i) => {
    for (const { data } of results[i]) if (normalizeEmail(text(data.email)) === target) found.push({ table, role, account: data });
  });
  return found;
}

export async function assertEmailAvailable(email: string, id: string) {
  if ((await findAccountsByEmail(email)).some(match => match.account.id !== id)) deny("That email address is already in use.");
}

const patchAccount = (table: string, id: string, patch: Record<string, unknown>) =>
  supabaseAdminRequest("/rest/v1/rpc/lms_patch", { method: "POST", body: JSON.stringify({ p_table: table, p_id: id, p_patch: patch, p_previous: {} }) });

// Checks a password against a stored record, upgrading low-cost hashes (and, only with
// the ALLOW_PLAINTEXT_PASSWORDS migration switch, plaintext) once the password is proven.
export async function checkAccountPassword(table: string, account: Row, password: string) {
  const hash = typeof account.passwordHash === "string" ? account.passwordHash : "";
  if (hash) {
    // Older hashes were made from trimmed input.
    const valid = await verifyPassword(password, hash) || (password !== password.trim() && await verifyPassword(password.trim(), hash));
    if (valid && needsRehash(hash)) await patchAccount(table, account.id, { passwordHash: await hashPassword(password) }).catch(error => console.error("Rehash failed:", error));
    return valid;
  }
  // Legacy plaintext records are NOT accepted unless ALLOW_PLAINTEXT_PASSWORDS=true (a
  // temporary migration switch). Run scripts/hash-legacy-passwords.mjs instead.
  if (process.env.ALLOW_PLAINTEXT_PASSWORDS === "true" && typeof account.password === "string" && account.password) {
    // Legacy plaintext record: accept once, then replace it with a hash.
    const valid = safeEqual(password, account.password) || safeEqual(password.trim(), account.password);
    if (valid) await patchAccount(table, account.id, { passwordHash: await hashPassword(password), password: null });
    return valid;
  }
  return dummyVerify(password);
}

// Clients send a plain `password` when an admin sets one; store only its hash,
// blank any legacy plaintext value and revoke existing sessions of that account.
export async function preparePatch(table: Table, id: string, patch: Record<string, unknown>, existing: Row | null) {
  const { password, ...rest } = patch;
  if (!isAccountTable(table)) return rest;
  if (typeof rest.email === "string") {
    rest.email = normalizeEmail(rest.email);
    if (!rest.email) deny("Email is required.", 400);
    await assertEmailAvailable(rest.email as string, id);
  }
  const bump = () => { rest.tokenVersion = (Number(existing?.tokenVersion) || 0) + 1; };
  if (typeof password === "string" && password) {
    if (password.length < 8) deny("Passwords must be at least 8 characters.", 400);
    if (password.length > 256) deny("Passwords must be at most 256 characters.", 400);
    Object.assign(rest, { passwordHash: await hashPassword(password).catch(error => { throw error instanceof HashBusy ? new Denied(error.message, 503) : error; }), password: null });
    if (existing) bump();
  }
  if (existing && rest.status === "inactive" && existing.status !== "inactive" && rest.tokenVersion === undefined) bump();
  return rest;
}

export function stripSecrets(previous: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(previous || {}).filter(([key]) => key !== "password" && !SERVER_FIELDS.includes(key)));
}
