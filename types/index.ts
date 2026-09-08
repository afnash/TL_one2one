export type UserRole = "TEACHER" | "STUDENT" | "SUPERADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  timezone?: string;
  title?: string;
  bio?: string;
}

export interface Teacher {
  phone?: string;
  bio?: string;
  id: string;
  name: string;
  email: string;
  avatar: string;
  subjects: string[];
  rating: number;
  totalStudents: number;
  totalSessions: number;
  status: "active" | "away" | "offline";
  joinedDate: string;
}

export interface Student {
  phone?: string;
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  subjects: string[];
  teacherId: string;
  teacherName: string;
  overallProgress: number;
  lastSessionDate?: string;
  nextSessionDate?: string;
  nextSessionTime?: string;
  pendingAssignmentsCount: number;
  status: "active" | "inactive";
  joinedDate: string;
  attendanceRate: number;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  description: string;
  studentCount: number;
  topics: string[];
}

export type SessionStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

export interface Session {
  studentIds?: string[];
  startedAt?: string;
  raisedHands?: string[];
  writerIds?: string[];
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  topic: string;
  date: string;
  scheduledTime: string;
  durationMinutes: number;
  status: SessionStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDurationSeconds?: number;
  meetingLink?: string;
  whiteboardId?: string;
  reportId?: string;
  notes?: string;
  assignmentSummary?: string;
}

export type WhiteboardElementType =
  | "pen"
  | "highlighter"
  | "eraser"
  | "line"
  | "arrow"
  | "rectangle"
  | "circle"
  | "text"
  | "stamp"
  | "sticky"
  | "image"
  | "question_card";

export interface WhiteboardElement {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  text?: string;
  imageUrl?: string;
  fontSize?: number;
  stampType?: "correct" | "incorrect" | "review" | "star";
  questionNumber?: number;
  questionText?: string;
  authorRole?: UserRole;
  authorName?: string;
  timestamp?: number;
}

export type WhiteboardCategory =
  | "LIVE_CLASS"
  | "ASSIGNMENTS"
  | "MY_WORK"
  | "PRACTICE"
  | "ASSIGNMENT_QUESTION"
  | "ASSIGNMENT_SUBMISSION";

export interface Whiteboard {
  id: string;
  title: string;
  subject: string;
  studentId?: string;
  studentName?: string;
  teacherId?: string;
  category: WhiteboardCategory;
  elements: WhiteboardElement[];
  lastEdited: string;
  thumbnail?: string;
  sessionId?: string;
  assignmentId?: string;
}

export type AssignmentStatus = "DRAFT" | "PENDING" | "SUBMITTED" | "REVIEWED" | "OVERDUE";

export interface Question {
  id: string;
  number: number;
  text: string;
  maxScore: number;
  subject: string;
  hint?: string;
}

export interface Assignment {
  kind?: "ASSIGNMENT" | "HOMEWORK";
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  description: string;
  dueDate: string;
  dueTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  instructions: string;
  targetType: "INDIVIDUAL" | "MULTIPLE" | "BROADCAST";
  assignedStudentIds: string[];
  questions: Question[];
  whiteboardId?: string;
  createdAt: string;
  submissionsCount?: number;
  reviewedCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  submittedAt: string;
  status: AssignmentStatus;
  score?: number;
  maxScore: number;
  teacherFeedback?: string;
  questionMarks?: Record<
    string,
    {
      status: "correct" | "incorrect" | "partial";
      marks: number;
      comment?: string;
    }
  >;
  whiteboardId: string;
}

export interface StudyMaterial {
  teacherId?: string;
  sizeBytes?: number;
  id: string;
  title: string;
  subject: string;
  type: "PDF" | "VIDEO" | "DOC" | "IMAGE" | "LINK";
  size: string;
  uploadDate: string;
  url: string;
  description: string;
  assignedTo: "ALL" | string[];
  downloadsCount: number;
}

export interface SessionReport {
  id: string;
  sessionId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  durationMinutes: number;
  topicTaught: string;
  topicsCovered: string[];
  assignmentGiven: string;
  studentPerformanceRating: number; // 1 to 5
  studentPerformanceNotes: string;
  teacherNotes: string;
  nextSessionPlan: string;
  status?: "DRAFT" | "SAVED";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  targetRole: UserRole;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "session" | "assignment" | "report" | "system";
  link?: string;
}
