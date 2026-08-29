"use client";

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
  Subject,
  Session,
  Whiteboard,
  Assignment,
  Submission,
  StudyMaterial,
  SessionReport,
  Notification,
  WhiteboardElement,
} from "@/types";
import {
  mockUsers,
  mockTeachers,
  mockStudents,
  mockSubjects,
  mockSessions,
  mockWhiteboards,
  mockAssignments,
  mockSubmissions,
  mockMaterials,
  mockSessionReports,
  mockNotifications,
} from "@/lib/mock-data";

interface LMSContextType {
  role: UserRole;
  user: User;
  switchRole: (newRole: UserRole) => void;
  teachers: Teacher[];
  students: Student[];
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
  updateWhiteboardElements: (whiteboardId: string, elements: WhiteboardElement[]) => void;
  createWhiteboard: (title: string, subject: string, category: Whiteboard["category"], studentId?: string) => Whiteboard;
  
  // Assignment Operations
  createAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => Assignment;
  submitAssignment: (assignmentId: string, studentId: string, whiteboardId: string) => Submission;
  gradeSubmission: (
    submissionId: string,
    score: number,
    feedback: string,
    questionMarks?: Record<string, { status: "correct" | "incorrect" | "partial"; marks: number; comment?: string }>
  ) => void;
  
  // Session Report Operations
  createSessionReport: (report: Omit<SessionReport, "id" | "createdAt">) => SessionReport;
  
  // Materials
  addStudyMaterial: (material: Omit<StudyMaterial, "id" | "uploadDate" | "downloadsCount">) => void;
  deleteStudyMaterial: (id: string) => void;
  
  // Student & Teacher Management
  addStudent: (student: Omit<Student, "id" | "joinedDate">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addTeacher: (teacher: Omit<Teacher, "id" | "joinedDate" | "totalSessions">) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  
  // Notifications & Global Search
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const STORAGE_KEY = "onetoone_lms_state_v1";

export function LMSProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("TEACHER");
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>(mockWhiteboards);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [materials, setMaterials] = useState<StudyMaterial[]>(mockMaterials);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>(mockSessionReports);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Load initial state from LocalStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role) setRole(parsed.role);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.whiteboards) setWhiteboards(parsed.whiteboards);
        if (parsed.assignments) setAssignments(parsed.assignments);
        if (parsed.submissions) setSubmissions(parsed.submissions);
        if (parsed.sessionReports) setSessionReports(parsed.sessionReports);
        if (parsed.materials) setMaterials(parsed.materials);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.teachers) setTeachers(parsed.teachers);
      }
    } catch (e) {
      console.warn("Could not load stored LMS state", e);
    }
  }, []);

  // Save changes to LocalStorage
  const persistState = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          role,
          sessions,
          whiteboards,
          assignments,
          submissions,
          sessionReports,
          materials,
          students,
          teachers,
        })
      );
    } catch (e) {
      console.warn("Failed to persist LMS state", e);
    }
  }, [role, sessions, whiteboards, assignments, submissions, sessionReports, materials, students, teachers]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Live Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diffInSecs = Math.floor((now - sessionStartTime) / 1000);
        setSessionElapsedSeconds(diffInSecs);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const user =
    role === "TEACHER"
      ? mockUsers.teacher
      : role === "STUDENT"
      ? mockUsers.student
      : mockUsers.admin;

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const startLiveSession = (sessionId: string) => {
    const sess = sessions.find((s) => s.id === sessionId);
    const nowMs = Date.now();
    setSessionStartTime(nowMs);
    setSessionElapsedSeconds(0);
    
    if (sess) {
      const updated: Session = {
        ...sess,
        status: "LIVE",
        actualStartTime: new Date(nowMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setActiveSession(updated);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } else {
      // Create ad-hoc live session
      const newSess: Session = {
        id: sessionId,
        teacherId: "t1",
        teacherName: "Alex Thomas",
        teacherAvatar: mockUsers.teacher.avatar,
        studentId: "s1",
        studentName: "Rahul Menon",
        studentAvatar: mockUsers.student.avatar,
        subject: "Mathematics",
        topic: "Live 1-on-1 Interactive Session",
        date: new Date().toISOString().split("T")[0],
        scheduledTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        durationMinutes: 60,
        status: "LIVE",
        whiteboardId: "wb-live-math-rahul",
        actualStartTime: new Date(nowMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setActiveSession(newSess);
      setSessions((prev) => [newSess, ...prev]);
    }
  };

  const endLiveSession = (sessionId: string) => {
    const endMs = Date.now();
    const startMs = sessionStartTime || endMs - 3120000; // default to 52 mins if missing
    const durationSeconds = Math.max(60, Math.floor((endMs - startMs) / 1000));
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

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
    return whiteboards.find((w) => w.id === id);
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

  const updateWhiteboardElements = (whiteboardId: string, elements: WhiteboardElement[]) => {
    setWhiteboards((prev) =>
      prev.map((wb) =>
        wb.id === whiteboardId
          ? { ...wb, elements, lastEdited: new Date().toISOString() }
          : wb
      )
    );
  };

  const createWhiteboard = (
    title: string,
    subject: string,
    category: Whiteboard["category"],
    studentId: string = "s1"
  ): Whiteboard => {
    const student = students.find((s) => s.id === studentId);
    const newBoard: Whiteboard = {
      id: `wb-${Date.now()}`,
      title,
      subject,
      category,
      studentId,
      studentName: student?.name || "Rahul Menon",
      teacherId: "t1",
      lastEdited: new Date().toISOString(),
      elements: [],
    };
    setWhiteboards((prev) => [newBoard, ...prev]);
    return newBoard;
  };

  const createAssignment = (assignmentData: Omit<Assignment, "id" | "createdAt">): Assignment => {
    const newId = `asg-${Date.now()}`;
    const newAssignment: Assignment = {
      ...assignmentData,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      submissionsCount: 0,
      reviewedCount: 0,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Send notification to assigned students
    const targetStudents = assignmentData.targetType === "BROADCAST"
      ? students.map((s) => s.id)
      : assignmentData.assignedStudentIds;

    const notifs: Notification[] = targetStudents.map((sId) => ({
      id: `notif-${Date.now()}-${sId}`,
      userId: sId,
      targetRole: "STUDENT",
      title: "New Assignment Assigned",
      message: `Alex Thomas posted '${newAssignment.title}' (${newAssignment.subject}). Due: ${newAssignment.dueDate}`,
      timestamp: "Just now",
      read: false,
      type: "assignment",
      link: "/student/assignments",
    }));

    setNotifications((prev) => [...notifs, ...prev]);

    return newAssignment;
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    whiteboardId: string
  ): Submission => {
    const asg = assignments.find((a) => a.id === assignmentId);
    const stud = students.find((s) => s.id === studentId) || mockStudents[0];
    const totalMax = asg?.questions.reduce((acc, q) => acc + q.maxScore, 0) || 10;

    const existingIdx = submissions.findIndex(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );

    const submission: Submission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : `subm-${Date.now()}`,
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
        userId: "t1",
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
          message: `Alex Thomas graded '${sub.assignmentTitle}'. Score: ${score}/${sub.maxScore}`,
          timestamp: "Just now",
          read: false,
          type: "assignment",
          link: "/student/assignments",
        },
        ...prev,
      ]);
    }
  };

  const createSessionReport = (
    reportData: Omit<SessionReport, "id" | "createdAt">
  ): SessionReport => {
    const newReport: SessionReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSessionReports((prev) => [newReport, ...prev]);

    // Update the session reference if exists
    setSessions((prev) =>
      prev.map((s) => (s.id === reportData.sessionId ? { ...s, reportId: newReport.id } : s))
    );

    return newReport;
  };

  const addStudyMaterial = (
    mat: Omit<StudyMaterial, "id" | "uploadDate" | "downloadsCount">
  ) => {
    const newMat: StudyMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
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
      id: `s-${Date.now()}`,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setStudents((prev) => [...prev, newStud]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addTeacher = (teacherData: Omit<Teacher, "id" | "joinedDate" | "totalSessions">) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
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

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <LMSContext.Provider
      value={{
        role,
        user,
        switchRole,
        teachers,
        students,
        subjects,
        sessions,
        whiteboards,
        assignments,
        submissions,
        materials,
        sessionReports,
        notifications,
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
        submitAssignment,
        gradeSubmission,
        createSessionReport,
        addStudyMaterial,
        deleteStudyMaterial,
        addStudent,
        updateStudent,
        addTeacher,
        updateTeacher,
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
