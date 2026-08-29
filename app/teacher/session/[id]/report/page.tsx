"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  FileText,
  Clock,
  Calendar,
  User,
  Star,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Save,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionReportPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const { sessions, students, createSessionReport, updateStudent } = useLMS();

  const currentSession = sessions.find((s) => s.id === sessionId) || {
    id: sessionId,
    studentId: "s1",
    studentName: "Rahul Menon",
    studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    subject: "Mathematics",
    topic: "Quadratic Equations — Roots & Factorisation",
    actualStartTime: "04:00 PM",
    actualEndTime: "04:52 PM",
    durationMinutes: 52,
    actualDurationSeconds: 3120,
    date: new Date().toISOString().split("T")[0],
  };

  // Form State
  const [sessionDate, setSessionDate] = useState<string>(
    currentSession.date || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>(currentSession.actualStartTime || "04:00 PM");
  const [endTime, setEndTime] = useState<string>(currentSession.actualEndTime || "04:52 PM");
  const [durationMinutes, setDurationMinutes] = useState<number>(
    currentSession.durationMinutes || 52
  );

  const [topicTaught, setTopicTaught] = useState<string>(
    currentSession.topic || "Quadratic Equations & Roots"
  );
  const [topicsCovered, setTopicsCovered] = useState<string[]>([
    "Factorisation Method",
    "Quadratic Formula Derivation",
    "Real Roots Discriminant Analysis",
  ]);
  const [newTopicTag, setNewTopicTag] = useState<string>("");
  const [assignmentGiven, setAssignmentGiven] = useState<string>(
    "Complete questions 1–10 on Algebra Homework whiteboard"
  );
  const [rating, setRating] = useState<number>(5);
  const [performanceNotes, setPerformanceNotes] = useState<string>(
    "Rahul grasped the factorisation steps quickly and independently derived the discriminant conditions. Exceptional focus during interactive board calculations."
  );
  const [teacherNotes, setTeacherNotes] = useState<string>(
    "Student is ready to transition to quadratic vertex equations and graph plotting."
  );
  const [nextSessionPlan, setNextSessionPlan] = useState<string>(
    "Quadratic Graph Transformations & Vertex Forms"
  );

  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Dynamic duration calculation whenever start or end time changes
  const calculateDuration = (start: string, end: string) => {
    // Attempt standard parse
    const sMatch = start.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    const eMatch = end.match(/(\d+):(\d+)\s*(AM|PM)?/i);

    if (sMatch && eMatch) {
      let sHours = parseInt(sMatch[1], 10);
      const sMins = parseInt(sMatch[2], 10);
      const sMeridiem = sMatch[3]?.toUpperCase();
      if (sMeridiem === "PM" && sHours < 12) sHours += 12;
      if (sMeridiem === "AM" && sHours === 12) sHours = 0;

      let eHours = parseInt(eMatch[1], 10);
      const eMins = parseInt(eMatch[2], 10);
      const eMeridiem = eMatch[3]?.toUpperCase();
      if (eMeridiem === "PM" && eHours < 12) eHours += 12;
      if (eMeridiem === "AM" && eHours === 12) eHours = 0;

      const totalStartMins = sHours * 60 + sMins;
      const totalEndMins = eHours * 60 + eMins;
      let diff = totalEndMins - totalStartMins;
      if (diff < 0) diff += 24 * 60;
      if (diff > 0) setDurationMinutes(diff);
    }
  };

  const handleAddTopicTag = () => {
    if (newTopicTag.trim() && !topicsCovered.includes(newTopicTag.trim())) {
      setTopicsCovered([...topicsCovered, newTopicTag.trim()]);
      setNewTopicTag("");
    }
  };

  const handleRemoveTopicTag = (tag: string) => {
    setTopicsCovered(topicsCovered.filter((t) => t !== tag));
  };

  const handleSaveReport = (exitAfter: boolean = false) => {
    const newReport = createSessionReport({
      sessionId,
      teacherId: "t1",
      studentId: currentSession.studentId || "s1",
      studentName: currentSession.studentName || "Rahul Menon",
      studentAvatar: currentSession.studentAvatar,
      subject: currentSession.subject || "Mathematics",
      date: sessionDate,
      startTime,
      endTime,
      durationSeconds: durationMinutes * 60,
      durationMinutes,
      topicTaught,
      topicsCovered,
      assignmentGiven,
      studentPerformanceRating: rating,
      studentPerformanceNotes: performanceNotes,
      teacherNotes,
      nextSessionPlan,
    });

    // Update student progress slightly
    if (currentSession.studentId) {
      updateStudent(currentSession.studentId, {
        lastSessionDate: sessionDate,
      });
    }

    setIsSaved(true);

    if (exitAfter) {
      setTimeout(() => {
        router.push("/teacher/sessions");
      }, 500);
    }
  };

  return (
    <AppShell
      headerTitle="Post-Session Report"
      headerSubtitle="Review and record student performance immediately after class"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Banner Alert: Auto Inherited Data */}
        <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-indigo-950">
                1-to-1 Live Session Concluded Successfully
              </h2>
              <p className="text-xs text-indigo-700 mt-0.5">
                Start/End timestamps and exact session duration have been automatically populated from the live classroom timer.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg shadow-2xs">
              {currentSession.subject}
            </span>
          </div>
        </div>

        {/* Report Form Card */}
        <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-8">
          {/* Section 1: Session Metadata & Dynamic Timestamps */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Session Time & Duration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Session Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      calculateDuration(e.target.value, endTime);
                    }}
                    placeholder="04:00 PM"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      calculateDuration(startTime, e.target.value);
                    }}
                    placeholder="04:52 PM"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Computed Duration
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{durationMinutes} minutes</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Student & Curriculum Coverage */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Student & Topic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student Name
                </label>
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={currentSession.studentAvatar}
                    alt={currentSession.studentName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {currentSession.studentName}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentSession.subject}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Topic Taught
              </label>
              <input
                type="text"
                value={topicTaught}
                onChange={(e) => setTopicTaught(e.target.value)}
                placeholder="e.g. Quadratic Equations — Roots & Factorisation"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Interactive Topics Covered Tag Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subtopics / Concepts Covered
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {topicsCovered.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopicTag(tag)}
                      className="hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicTag}
                  onChange={(e) => setNewTopicTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTopicTag();
                    }
                  }}
                  placeholder="Add a subtopic tag (press Enter)..."
                  className="flex-1 px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTopicTag}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Student Evaluation & Performance */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Student Performance Rating & Notes
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Comprehension & Engagement Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6",
                        star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5
                    ? "5 / 5 (Exceptional Mastery)"
                    : rating === 4
                    ? "4 / 5 (Strong Understanding)"
                    : rating === 3
                    ? "3 / 5 (Satisfactory Progress)"
                    : `${rating} / 5`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student Performance Feedback
              </label>
              <textarea
                rows={3}
                value={performanceNotes}
                onChange={(e) => setPerformanceNotes(e.target.value)}
                placeholder="Describe how the student performed during problem solving..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Homework / Assignment Given
              </label>
              <input
                type="text"
                value={assignmentGiven}
                onChange={(e) => setAssignmentGiven(e.target.value)}
                placeholder="e.g. Complete questions 1–10 on whiteboard"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Private Teacher Notes & Observations
              </label>
              <textarea
                rows={2}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Internal notes for tracking student trajectory..."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Next Session Learning Plan
              </label>
              <input
                type="text"
                value={nextSessionPlan}
                onChange={(e) => setNextSessionPlan(e.target.value)}
                placeholder="e.g. Transition into Quadratic Graph Transformations"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/teacher/dashboard")}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveReport(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveReport(true)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <span>Save & View Sessions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
