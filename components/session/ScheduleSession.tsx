"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { Plus, Video, Calendar, Clock, BookOpen, Users, Link as LinkIcon, X, Check, AlertCircle } from "lucide-react";

export function ScheduleSession() {
  const { user, students, directory, createSession } = useLMS();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Retrieve current teacher's profile subjects
  const currentTeacher = directory.teachers?.find((t) => t.id === user.id);
  const teacherSubjects: string[] =
    currentTeacher?.subjects?.length
      ? currentTeacher.subjects
      : (user as any).subjects?.length
      ? (user as any).subjects
      : ["Mathematics"];

  const [chosenSubject, setChosenSubject] = useState(teacherSubjects[0] || "Mathematics");

  const handleOpen = () => {
    setError("");
    setChosenSubject(teacherSubjects[0] || "Mathematics");
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl px-4 py-2.5 shadow-xs transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Schedule a 1:1 Class</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Schedule 1:1 Live Class</h2>
                  <p className="text-xs text-slate-500">Choose from your profile subjects & assign students</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                if (!selected.length) {
                  setError("Please select at least one student for this session.");
                  return;
                }

                const data = new FormData(e.currentTarget);
                const first = students.find((s) => s.id === selected[0]) || {
                  id: selected[0],
                  name: "Student",
                  avatar: "/icon.jpg",
                };

                const meetingLink = String(data.get("meetingLink") || "").trim();
                if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
                  setError("Please enter a valid HTTP or HTTPS meeting link (or leave blank).");
                  return;
                }

                createSession({
                  teacherId: user.id,
                  teacherName: user.name || "Teacher",
                  teacherAvatar: user.avatar || "/icon.jpg",
                  studentId: first.id,
                  studentName: selected.length === 1 ? first.name : `${selected.length} students`,
                  studentAvatar: (first as any).avatar || "/icon.jpg",
                  studentIds: selected,
                  topic: String(data.get("topic") || "General Tutorial").trim(),
                  subject: chosenSubject,
                  date: String(data.get("date")),
                  scheduledTime: String(data.get("time")),
                  durationMinutes: Number(data.get("duration") || 60),
                  meetingLink,
                  status: "SCHEDULED",
                  writerIds: [],
                  raisedHands: [],
                });

                setOpen(false);
                setSelected([]);
              }}
            >
              {/* Subject selector - LOCKED to Teacher Profile Subjects */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Subject (From your Teacher Profile) *</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {teacherSubjects.length} authorized subject{teacherSubjects.length > 1 ? "s" : ""}
                  </span>
                </label>
                <select
                  required
                  value={chosenSubject}
                  onChange={(e) => setChosenSubject(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {teacherSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Subjects are locked to the competencies specified in your teacher profile.
                </p>
              </div>

              {/* Topic Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic / Lesson Unit *
                </label>
                <input
                  name="topic"
                  type="text"
                  required
                  placeholder="e.g. Quadratic Equations & Graphing"
                  className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    name="time"
                    type="time"
                    required
                    defaultValue="10:00"
                    className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (mins) *
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min={15}
                    max={240}
                    defaultValue={60}
                    required
                    className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Meeting Link (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  External Meeting Link (Optional)
                </label>
                <input
                  name="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/xyz or leave empty for built-in WebRTC"
                  className="block w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Student Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Student(s) *
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50">
                  {students.map((s) => {
                    const isChecked = selected.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked ? "bg-indigo-50 text-indigo-950 font-bold" : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setSelected(
                                e.target.checked
                                  ? [...selected, s.id]
                                  : selected.filter((id) => id !== s.id)
                              )
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{s.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{s.grade}</span>
                      </label>
                    );
                  })}
                  {!students.length && (
                    <p className="text-xs text-slate-400 p-2 text-center">
                      No students currently assigned to your roster.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
