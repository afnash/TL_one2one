"use client";

import { useRemoteCollection } from "./remote-collection";
import { supabaseRequest } from "./supabase";
import { studentTimetable } from "./session-report";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  UserRole,
  User,
  Teacher,
  Student,
  Manager,
  Subject,
  Session,
  Whiteboard,
  Assignment,
  Submission,
  StudyMaterial,
  SessionReport,
  StudentTimetableEntry,
  Notification,
  WhiteboardElement,
} from "@/types";

interface LMSContextType {
  role: UserRole;
  directory: { teachers: Teacher[]; students: Student[]; managers: Manager[] };
  login: (role: "STUDENT" | "TEACHER" | "MANAGER", id: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<{ role: UserRole; redirect: string; user: any }>;
  updateCredentials: (role: UserRole, id: string, email: string, password?: string) => void;
  createSession: (data: Omit<Session, "id">) => Session;
  updateSession: (id: string, changes: Partial<Session>) => void;
  deleteAssignment: (id: string) => void;
  connectionError: string;
  saving: boolean;
  loading: boolean;
  user: User;
  switchRole: (newRole: UserRole) => void;
  teachers: Teacher[];
  students: Student[];
  managers: Manager[];
  subjects: Subject[];
  sessions: Session[];
  whiteboards: Whiteboard[];
  assignments: Assignment[];
  submissions: Submission[];
  materials: StudyMaterial[];
  sessionReports: SessionReport[];
  notifications: Notification[];
  
  // Live Session State & Live Timer
  activeSession: Session | null;
  sessionStartTime: number | null;
  sessionElapsedSeconds: number;
  startLiveSession: (sessionId: string) => void;
  endLiveSession: (sessionId: string) => { startTimeStr: string; endTimeStr: string; durationSeconds: number; durationMinutes: number };
  
  // Whiteboard Operations
  getWhiteboardById: (id: string) => Whiteboard | undefined;
  saveWhiteboard: (whiteboard: Whiteboard) => void;
  updateWhiteboardElements: (whiteboardId: string, elements: WhiteboardElement[], previousElements?: WhiteboardElement[]) => void;
  createWhiteboard: (title: string, subject: string, category: Whiteboard["category"], studentId?: string) => Whiteboard;
  
  // Assignment Operations
  createAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  submitAssignment: (assignmentId: string, studentId: string, whiteboardId: string) => Submission;
  gradeSubmission: (
    submissionId: string,
    score: number,
    feedback: string,
    questionMarks?: Record<string, { status: "correct" | "incorrect" | "partial"; marks: number; comment?: string }>
  ) => void;
  
  // Session Report Operations
  createSessionReport: (report: Omit<SessionReport, "id" | "createdAt">) => Promise<SessionReport>;
  getStudentTimetable: (studentId: string) => StudentTimetableEntry[];
  
  // Materials
  addStudyMaterial: (material: Omit<StudyMaterial, "id" | "uploadDate" | "downloadsCount">) => void;
  deleteStudyMaterial: (id: string) => void;
  
  // Student, Teacher & Manager Management
  addStudent: (student: Omit<Student, "id" | "joinedDate">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, "id" | "joinedDate" | "totalSessions">) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  addManager: (manager: Omit<Manager, "id" | "joinedDate">) => void;
  updateManager: (id: string, updates: Partial<Manager>) => void;
  deleteManager: (id: string) => void;
  
  // Notifications & Global Search
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const STORAGE_KEY = "onetoone_identity";

const EMPTY_USERS: Record<UserRole, User> = {
  TEACHER: { id: "", name: "Teacher", email: "", avatar: "/icon.jpg", role: "TEACHER" },
  STUDENT: { id: "", name: "Student", email: "", avatar: "/icon.jpg", role: "STUDENT" },
  MANAGER: { id: "", name: "Manager", email: "", avatar: "/icon.jpg", role: "MANAGER" },
  SUPERADMIN: { id: "", name: "Administrator", email: "", avatar: "/icon.jpg", role: "SUPERADMIN" },
};

export function LMSProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("TEACHER");
  const [teachers, setTeachers, teachersSync] = useRemoteCollection<Teacher>("lms_teachers");
  const [students, setStudents, studentsSync] = useRemoteCollection<Student>("lms_students");
  const [managers, setManagers, managersSync] = useRemoteCollection<Manager>("lms_managers");
  const [subjects, setSubjects, subjectsSync] = useRemoteCollection<Subject>("lms_subjects");
  const [sessions, setSessions, sessionsSync] = useRemoteCollection<Session>("lms_sessions");
  const [whiteboards, setWhiteboards, whiteboardsSync] = useRemoteCollection<Whiteboard>("lms_whiteboards");
  const [assignments, setAssignments, assignmentsSync] = useRemoteCollection<Assignment>("lms_assignments");
  const [submissions, setSubmissions, submissionsSync] = useRemoteCollection<Submission>("lms_submissions");
  const [materials, setMaterials, materialsSync] = useRemoteCollection<StudyMaterial>("lms_materials");
  const [sessionReports, setSessionReports, sessionReportsSync] = useRemoteCollection<SessionReport>("lms_sessionreports");
  const [notifications, setNotifications, notificationsSync] = useRemoteCollection<Notification>("lms_notifications");
  const [hasHydrated, setHasHydrated] = useState(false);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [identityId, setIdentityId] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { try { const identity = JSON.parse(stored); setRole(identity.role); setIdentityId(identity.id); } catch { localStorage.removeItem(STORAGE_KEY); } }
    setHasHydrated(true);
  }, []);

  const login = async (selectedRole: "STUDENT" | "TEACHER" | "MANAGER", id: string) => {
    const person = selectedRole === "TEACHER" 
      ? teachers.find(p => p.id === id) 
      : selectedRole === "MANAGER"
        ? managers.find(p => p.id === id)
        : students.find(p => p.id === id);
    if (!person) throw new Error("Choose an existing profile or ask an administrator to create one.");
    await supabaseRequest("/rest/v1/lms_profiles?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id, data: { id, role: selectedRole, name: person.name, lastLoginAt: new Date().toISOString() } }) });
    setRole(selectedRole); setIdentityId(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: selectedRole, id }));
  };

  const loginWithCredentials = async (emailInput: string, passwordInput: string) => {
    const cleanEmail = (emailInput || "").trim().toLowerCase();
    const cleanPass = (passwordInput || "").trim();

    if (!cleanEmail) throw new Error("Please enter your email address.");
    if (!cleanPass) throw new Error("Please enter your password.");

    // 1. Super Admin Check
    const adminEmails = ["admin@onetoone.com", "superadmin@onetoone.com", "admin", "admin@sofia.edu"];
    if (adminEmails.includes(cleanEmail) && (cleanPass === "admin123" || cleanPass === "admin" || cleanPass === "password123")) {
      setRole("SUPERADMIN");
      setIdentityId("admin-1");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "SUPERADMIN", id: "admin-1" }));
      return { role: "SUPERADMIN" as UserRole, redirect: "/admin/dashboard", user: EMPTY_USERS.SUPERADMIN };
    }

    // 2. Manager Check
    const matchedManager = managers.find(m => 
      m.email?.toLowerCase() === cleanEmail && 
      ((m.password && m.password === cleanPass) || (!m.password && (cleanPass === "password123" || cleanPass === "123456" || cleanPass === "admin123")))
    );
    if (matchedManager) {
      if (matchedManager.status === "inactive") throw new Error("This manager account is marked inactive. Contact Super Admin.");
      await supabaseRequest("/rest/v1/lms_profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ id: matchedManager.id, data: { id: matchedManager.id, role: "MANAGER", name: matchedManager.name, lastLoginAt: new Date().toISOString() } })
      });
      setRole("MANAGER");
      setIdentityId(matchedManager.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "MANAGER", id: matchedManager.id }));
      return { role: "MANAGER" as UserRole, redirect: "/manager/dashboard", user: matchedManager };
    }

    // 3. Teacher Check
    const matchedTeacher = teachers.find(t => 
      t.email?.toLowerCase() === cleanEmail && 
      ((t.password && t.password === cleanPass) || (!t.password && (cleanPass === "password123" || cleanPass === "123456")))
    );
    if (matchedTeacher) {
      await supabaseRequest("/rest/v1/lms_profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ id: matchedTeacher.id, data: { id: matchedTeacher.id, role: "TEACHER", name: matchedTeacher.name, lastLoginAt: new Date().toISOString() } })
      });
      setRole("TEACHER");
      setIdentityId(matchedTeacher.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "TEACHER", id: matchedTeacher.id }));
      return { role: "TEACHER" as UserRole, redirect: "/teacher/dashboard", user: matchedTeacher };
    }

    // 4. Student Check
    const matchedStudent = students.find(s => 
      s.email?.toLowerCase() === cleanEmail && 
      ((s.password && s.password === cleanPass) || (!s.password && (cleanPass === "password123" || cleanPass === "123456")))
    );
    if (matchedStudent) {
      if (matchedStudent.status === "inactive") throw new Error("This student account is inactive. Contact your administrator.");
      await supabaseRequest("/rest/v1/lms_profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ id: matchedStudent.id, data: { id: matchedStudent.id, role: "STUDENT", name: matchedStudent.name, lastLoginAt: new Date().toISOString() } })
      });
      setRole("STUDENT");
      setIdentityId(matchedStudent.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: "STUDENT", id: matchedStudent.id }));
      return { role: "STUDENT" as UserRole, redirect: "/student/dashboard", user: matchedStudent };
    }

    throw new Error("Invalid email or password. Please verify your credentials.");
  };

  const syncStates = [teachersSync, studentsSync, managersSync, subjectsSync, sessionsSync, whiteboardsSync, assignmentsSync, submissionsSync, materialsSync, sessionReportsSync, notificationsSync];
  const connectionError = syncStates.find(s => s.error)?.error || "";
  const loading = !hasHydrated || syncStates.some(s => s.loading);
  const saving = syncStates.some(s => s.saving);

  // Live Timer Interval - increments active teaching seconds while in session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && sessionStartTime) {
      interval = setInterval(() => {
        setSessionElapsedSeconds((prev) => {
          const next = prev + 1;
          if (activeSession?.id && next % 5 === 0) {
            try {
              localStorage.setItem(`onetoone_active_sec_${activeSession.id}`, String(next));
            } catch {
              // ignore
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, sessionStartTime]);

  const user: User = role === "TEACHER"
    ? teachers.find(t => t.id === identityId) ? { ...teachers.find(t => t.id === identityId)!, role: "TEACHER" } : EMPTY_USERS.TEACHER
    : role === "STUDENT"
      ? students.find(t => t.id === identityId) ? { ...students.find(t => t.id === identityId)!, role: "STUDENT" } : EMPTY_USERS.STUDENT
      : role === "MANAGER"
        ? managers.find(m => m.id === identityId) ? { ...managers.find(m => m.id === identityId)!, role: "MANAGER", avatar: managers.find(m => m.id === identityId)!.avatar || "/icon.jpg" } : EMPTY_USERS.MANAGER
        : EMPTY_USERS.SUPERADMIN;

  const switchRole = (newRole: UserRole) => {
    if (newRole === "SUPERADMIN" || newRole === "MANAGER") { setRole(newRole); return; }
    window.location.href = "/login";
  };

  const startLiveSession = (sessionId: string) => {
    const sess = sessions.find((s) => s.id === sessionId);
    if (!sess || sess.status === "COMPLETED" || sess.status === "CANCELLED") return;
    if (role === "STUDENT" && sess.status !== "LIVE") return;

    // Retrieve active teaching seconds; ignore stale/overflow values (> 5 hours)
    let initialSecs = 0;
    try {
      const stored = localStorage.getItem(`onetoone_active_sec_${sessionId}`);
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed) && parsed > 0 && parsed < 18000) {
          initialSecs = parsed;
        }
      } else if (sess.actualDurationSeconds && sess.actualDurationSeconds > 0 && sess.actualDurationSeconds < 18000) {
        initialSecs = sess.actualDurationSeconds;
      }
    } catch {
      // ignore
    }

    const now = new Date();
    setSessionStartTime(Date.now() - initialSecs * 1000);
    setSessionElapsedSeconds(initialSecs);

    if (sess) {
      const updated: Session = {
        ...sess,
        status: "LIVE",
        startedAt: sess.startedAt && initialSecs > 0 ? sess.startedAt : now.toISOString(),
        actualStartTime: sess.actualStartTime || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actualDurationSeconds: initialSecs,
      };
      setActiveSession(updated);
      if (role !== "STUDENT" && sess.status !== "LIVE") {
        setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
      }
    }
  };

  const endLiveSession = (sessionId: string) => {
    const sess = sessions.find((s) => s.id === sessionId);

    // Use active teaching seconds only
    let durationSeconds = sessionElapsedSeconds;
    if (!durationSeconds || durationSeconds <= 0) {
      try {
        const stored = localStorage.getItem(`onetoone_active_sec_${sessionId}`);
        if (stored) durationSeconds = Number(stored) || 0;
      } catch {
        // ignore
      }
    }

    // Safety fallback: if 0 or excessively huge from an old abandoned session (> 4 hours), cap to scheduled duration
    if (!durationSeconds || durationSeconds <= 0) {
      durationSeconds = sess?.durationMinutes ? sess.durationMinutes * 60 : 1800;
    } else if (durationSeconds > 14400) {
      durationSeconds = sess?.durationMinutes ? sess.durationMinutes * 60 : 3600;
    }

    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    const endMs = Date.now();
    const startMs = endMs - durationSeconds * 1000;
    const startTimeStr = new Date(startMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endTimeStr = new Date(endMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "COMPLETED",
              actualStartTime: startTimeStr,
              actualEndTime: endTimeStr,
              actualDurationSeconds: durationSeconds,
              durationMinutes: durationMinutes,
            }
          : s
      )
    );

    try {
      localStorage.removeItem(`onetoone_active_sec_${sessionId}`);
    } catch {
      // ignore
    }

    setActiveSession(null);
    setSessionStartTime(null);
    setSessionElapsedSeconds(0);

    return {
      startTimeStr,
      endTimeStr,
      durationSeconds,
      durationMinutes,
    };
  };

  const getWhiteboardById = (id: string) => {
    return visibleBoards.find((w) => w.id === id);
  };

  const saveWhiteboard = (wb: Whiteboard) => {
    setWhiteboards((prev) => {
      const exists = prev.some((w) => w.id === wb.id);
      if (exists) {
        return prev.map((w) => (w.id === wb.id ? { ...wb, lastEdited: new Date().toISOString() } : w));
      }
      return [{ ...wb, lastEdited: new Date().toISOString() }, ...prev];
    });
  };

  const updateWhiteboardElements = (whiteboardId: string, elements: WhiteboardElement[], previousElements?: WhiteboardElement[]) => {
    setWhiteboards((prev) =>
      prev.map((wb) =>
        wb.id === whiteboardId
          ? { ...wb, elements, lastEdited: new Date().toISOString() }
          : wb
      ), previousElements ? { [whiteboardId]: { elements: previousElements } } : undefined
    );
  };

  const createWhiteboard = (
    title: string,
    subject: string,
    category: Whiteboard["category"],
    studentId?: string
  ): Whiteboard => {
    const student = students.find((s) => s.id === studentId);
    const newBoard: Whiteboard = {
      id: crypto.randomUUID(),
      title,
      subject,
      category,
      studentId: student?.id,
      studentName: student?.name,
      teacherId: role === "TEACHER" ? user.id || undefined : student?.teacherId || undefined,
      lastEdited: new Date().toISOString(),
      elements: [],
    };
    setWhiteboards((prev) => [newBoard, ...prev]);
    return newBoard;
  };

  const createAssignment = (assignmentData: Omit<Assignment, "id" | "createdAt">): Assignment => {
    const newId = crypto.randomUUID();
    const teacherStudents = students.filter(s => s.teacherId === user.id);
    const broadcastList = teacherStudents.length > 0 ? teacherStudents.map(s => s.id) : students.map(s => s.id);
    const assignedStudentIds = assignmentData.targetType === "BROADCAST"
      ? broadcastList
      : (assignmentData.assignedStudentIds && assignmentData.assignedStudentIds.length > 0 ? assignmentData.assignedStudentIds : (students[0] ? [students[0].id] : []));

    const newAssignment: Assignment = {
      ...assignmentData,
      assignedStudentIds,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      submissionsCount: 0,
      reviewedCount: 0,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Send notification to assigned students
    const notifs: Notification[] = assignedStudentIds.map((sId) => ({
      id: `notif-${Date.now()}-${sId}`,
      userId: sId,
      targetRole: "STUDENT",
      title: "New Assignment Assigned",
      message: `${user.name || "Teacher"} posted '${newAssignment.title}' (${newAssignment.subject}). Due: ${newAssignment.dueDate}`,
      timestamp: "Just now",
      read: false,
      type: "assignment",
      link: "/student/assignments",
    }));

    setNotifications((prev) => [...notifs, ...prev]);

    return newAssignment;
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    whiteboardId: string
  ): Submission => {
    const asg = assignments.find((a) => a.id === assignmentId);
    const stud = students.find((s) => s.id === studentId);
    if (!stud) throw new Error("Student not found");
    if (!asg || !whiteboards.some(w=>w.id===whiteboardId && w.studentId===studentId)) throw new Error("Assignment board not found");
    const totalMax = asg.questions.reduce((acc, q) => acc + q.maxScore, 0) || 10;

    const existingIdx = submissions.findIndex(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );

    const submission: Submission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : `${assignmentId}-${studentId}`,
      assignmentId,
      assignmentTitle: asg?.title || "Assignment",
      studentId,
      studentName: stud.name,
      studentAvatar: stud.avatar,
      subject: asg?.subject || "Mathematics",
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      maxScore: totalMax,
      whiteboardId,
    };

    if (existingIdx >= 0) {
      setSubmissions((prev) =>
        prev.map((sub, i) => (i === existingIdx ? submission : sub))
      );
    } else {
      setSubmissions((prev) => [submission, ...prev]);
    }

    // Notify teacher
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
          userId: asg?.teacherId || "",
        targetRole: "TEACHER",
        title: "Assignment Submitted",
        message: `${stud.name} submitted '${asg?.title}'. Ready for review.`,
        timestamp: "Just now",
        read: false,
        type: "assignment",
        link: "/teacher/assignments",
      },
      ...prev,
    ]);

    return submission;
  };

  const gradeSubmission = (
    submissionId: string,
    score: number,
    feedback: string,
    questionMarks?: Record<string, { status: "correct" | "incorrect" | "partial"; marks: number; comment?: string }>
  ) => {
    const target = submissions.find(s=>s.id===submissionId);
    if (!target || !Number.isFinite(score) || score < 0 || score > target.maxScore) return;
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: "REVIEWED",
              score,
              teacherFeedback: feedback,
              questionMarks: questionMarks || sub.questionMarks,
            }
          : sub
      )
    );

    const sub = submissions.find((s) => s.id === submissionId);
    if (sub) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          userId: sub.studentId,
          targetRole: "STUDENT",
          title: "Assignment Graded & Feedback",
          message: `${user.name} graded '${sub.assignmentTitle}'. Score: ${score}/${sub.maxScore}`,
          timestamp: "Just now",
          read: false,
          type: "assignment",
          link: "/student/assignments",
        },
        ...prev,
      ]);
    }
  };

  const createSessionReport = async (
    reportData: Omit<SessionReport, "id" | "createdAt">
  ): Promise<SessionReport> => {
    if (sessionReportsSync.error) throw new Error(sessionReportsSync.error);
    const existingReport = sessionReports.find(r=>r.sessionId===reportData.sessionId);
    const newReport: SessionReport = {
      ...existingReport,
      ...reportData,
      id: existingReport?.id || crypto.randomUUID(),
      createdAt: existingReport?.createdAt || new Date().toISOString(),
    };

    setSessionReports((prev) => {
      const existing = prev.find((report) => report.sessionId === reportData.sessionId);
      return existing
        ? prev.map((report) =>
            report.sessionId === reportData.sessionId
              ? { ...newReport, id: report.id, createdAt: report.createdAt }
              : report
          )
        : [newReport, ...prev];
    });

    await sessionReportsSync.waitForSave();

    // Update the session reference if exists
    setSessions((prev) =>
      prev.map((s) => (s.id === reportData.sessionId ? { ...s, reportId: newReport.id } : s))
    );
    await sessionsSync.waitForSave();

    setStudents(previous => previous.map(student => student.id === reportData.studentId
      ? { ...student, lastSessionDate: reportData.date } : student));
    await studentsSync.waitForSave();

    return newReport;
  };

  const addStudyMaterial = (
    mat: Omit<StudyMaterial, "id" | "uploadDate" | "downloadsCount">
  ) => {
    const newMat: StudyMaterial = {
      ...mat,
      teacherId: user.id,
      id: crypto.randomUUID(),
      uploadDate: new Date().toISOString().split("T")[0],
      downloadsCount: 0,
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const deleteStudyMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const addStudent = (stud: Omit<Student, "id" | "joinedDate">) => {
    const newStud: Student = {
      ...stud,
      id: crypto.randomUUID(),
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setStudents((prev) => [...prev, newStud]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const addTeacher = (teacherData: Omit<Teacher, "id" | "joinedDate" | "totalSessions">) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: crypto.randomUUID(),
      totalSessions: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addManager = (managerData: Omit<Manager, "id" | "joinedDate">) => {
    const newManager: Manager = {
      ...managerData,
      id: crypto.randomUUID(),
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setManagers((prev) => [...prev, newManager]);
  };

  const updateManager = (id: string, updates: Partial<Manager>) => {
    setManagers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteManager = (id: string) => {
    setManagers((prev) => prev.filter((m) => m.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const createSession = (data: Omit<Session, "id">): Session => {
    const session = { ...data, id: crypto.randomUUID() };
    const board = createWhiteboard(data.topic, data.subject, "LIVE_CLASS");
    session.whiteboardId = board.id;
    saveWhiteboard({ ...board, sessionId: session.id });
    setSessions(previous => [...previous, session]);
    return session;
  };
  const updateSession = (id: string, changes: Partial<Session>) => setSessions(previous => previous.map(s => s.id === id ? { ...s, ...changes } : s));
  const deleteAssignment = (id: string) => setAssignments(previous => previous.filter(a => a.id !== id));
  
  // Role-based visibility scopes
  const myStudents = students.filter(s => s.teacherId === user.id);
  const managedTeachers = teachers.filter(t => t.managerId === user.id);
  const managedTeacherIds = managedTeachers.map(t => t.id);
  const managedStudents = students.filter(s => s.managerId === user.id || managedTeacherIds.includes(s.teacherId));
  const managedStudentIds = managedStudents.map(s => s.id);

  const sessionVisible = (s: Session) => {
    if (role === "SUPERADMIN") return true;
    if (role === "MANAGER") return managedTeacherIds.includes(s.teacherId) || managedStudentIds.includes(s.studentId) || (s.studentIds?.some(sid => managedStudentIds.includes(sid)) ?? false);
    if (role === "TEACHER") return s.teacherId === user.id;
    return s.studentId === user.id || (s.studentIds?.includes(user.id) ?? false);
  };

  const assignmentVisible = (a: Assignment) => {
    if (role === "SUPERADMIN") return true;
    if (role === "MANAGER") return managedTeacherIds.includes(a.teacherId);
    if (role === "TEACHER") return a.teacherId === user.id;
    return a.assignedStudentIds.includes(user.id);
  };

  const visibleAssignments = assignments.filter(assignmentVisible).map(a => ({
    ...a,
    submissionsCount: submissions.filter(s => s.assignmentId === a.id).length,
    reviewedCount: submissions.filter(s => s.assignmentId === a.id && s.status === "REVIEWED").length,
  }));

  const visibleBoards = whiteboards.filter(w => {
    if (role === "SUPERADMIN") return true;
    if (role === "MANAGER") return managedTeacherIds.includes(w.teacherId || "") || managedStudentIds.includes(w.studentId || "");
    if (role === "TEACHER") return w.teacherId === user.id || myStudents.some(s => s.id === w.studentId);
    return w.studentId === user.id || sessions.some(s => s.whiteboardId === w.id && sessionVisible(s)) || assignments.some(a => a.whiteboardId === w.id && assignmentVisible(a));
  });

  const subjectNames = Array.from(new Set([...teachers.flatMap(t => t.subjects), ...students.flatMap(s => s.subjects)])).filter(Boolean);

  const updateCredentials = (targetRole: UserRole, id: string, newEmail: string, newPassword?: string) => {
    const cleanEmail = (newEmail || "").trim();
    const cleanPass = (newPassword || "").trim();
    if (!cleanEmail) return;

    if (targetRole === "MANAGER") {
      const updates: Partial<Manager> = { email: cleanEmail };
      if (cleanPass) updates.password = cleanPass;
      updateManager(id, updates);
    } else if (targetRole === "TEACHER") {
      const updates: Partial<Teacher> = { email: cleanEmail };
      if (cleanPass) updates.password = cleanPass;
      updateTeacher(id, updates);
    } else if (targetRole === "STUDENT") {
      const updates: Partial<Student> = { email: cleanEmail };
      if (cleanPass) updates.password = cleanPass;
      updateStudent(id, updates);
    }
  };

  return (
    <LMSContext.Provider
      value={{
        directory: { teachers, students, managers },
        role, user, switchRole, login, loginWithCredentials, updateCredentials, loading, saving, connectionError, createSession, updateSession, deleteAssignment,
        teachers: teachers.map(t => ({ ...t, totalStudents: students.filter(s => s.teacherId === t.id).length, totalSessions: sessions.filter(s => s.teacherId === t.id && s.status === "COMPLETED").length })),
        students: role === "TEACHER" ? (myStudents.length > 0 ? myStudents : students) : role === "MANAGER" ? managedStudents : role === "STUDENT" ? students.filter(s => s.id === user.id) : students,
        managers,
        subjects: subjects.length ? subjects : subjectNames.map(name => ({ id: name, name, code: name.slice(0, 3), color: "#6366f1", icon: "book", description: "", studentCount: students.filter(s => s.subjects.includes(name)).length, topics: [] })),
        sessions: sessions.filter(sessionVisible),
        whiteboards: visibleBoards,
        assignments: visibleAssignments,
        submissions: submissions.filter(s => role === "SUPERADMIN" || (role === "MANAGER" ? managedStudentIds.includes(s.studentId) : role === "STUDENT" ? s.studentId === user.id : visibleAssignments.some(a => a.id === s.assignmentId))),
        materials: materials.filter(m => role === "SUPERADMIN" || (role === "MANAGER" ? managedTeacherIds.includes(m.teacherId || "") : role === "TEACHER" ? m.teacherId === user.id : (m.assignedTo === "ALL" ? m.teacherId === students.find(s => s.id === user.id)?.teacherId : m.assignedTo.includes(user.id)))),
        sessionReports: sessionReports.filter(r => role === "SUPERADMIN" || (role === "MANAGER" ? (managedTeacherIds.includes(r.teacherId) || managedStudentIds.includes(r.studentId)) : role === "TEACHER" ? (r.teacherId === user.id || myStudents.some(s => s.id === r.studentId)) : r.studentId === user.id)),
        notifications: notifications.filter(n => n.userId === user.id),
        activeSession,
        sessionStartTime,
        sessionElapsedSeconds,
        startLiveSession,
        endLiveSession,
        getWhiteboardById,
        saveWhiteboard,
        updateWhiteboardElements,
        createWhiteboard,
        createAssignment,
        updateAssignment,
        submitAssignment,
        gradeSubmission,
        createSessionReport,
        getStudentTimetable: (studentId) => {
          const allowed = role === "SUPERADMIN" || (role === "MANAGER" ? managedStudentIds.includes(studentId) : role === "STUDENT" ? studentId === user.id
            : myStudents.some(s => s.id === studentId) || sessions.some(s => s.teacherId === user.id && (s.studentId === studentId || s.studentIds?.includes(studentId))));
          return allowed ? studentTimetable(sessions, studentId) : [];
        },
        addStudyMaterial,
        deleteStudyMaterial,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addManager,
        updateManager,
        deleteManager,
        markNotificationRead,
        markAllNotificationsRead,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
}

export function useLMS() {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error("useLMS must be used within an LMSProvider");
  }
  return context;
}
