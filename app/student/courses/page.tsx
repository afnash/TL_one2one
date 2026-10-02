"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SofiaStudentLayout } from "@/components/layout/SofiaStudentLayout";
import { INITIAL_COURSES } from "@/lib/sofia-data";
import { Course } from "@/types";
import {
  BookOpen,
  Clock,
  Layers,
  Search,
  ArrowRight,
  X,
  CheckCircle2,
  Play,
  FileText,
} from "lucide-react";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.track.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SofiaStudentLayout activeTab="courses">
      <div className="space-y-8 pb-16">
        {/* Top Header */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-[#15803d]">
            My learning
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
            Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            All published courses assigned to you by your institution.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43c4d1] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing <strong className="text-slate-800">{filteredCourses.length}</strong> of{" "}
            <strong className="text-slate-800">{courses.length}</strong> Published curriculum
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isStarted = course.progress > 0;
            const isCompleted = course.progress >= 100;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base sm:text-lg font-bold text-[#0c1e33] leading-snug">
                      {course.title}
                    </h3>
                    <div className="w-9 h-9 rounded-full bg-[#e0f7fa] text-[#00838f] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-500">{course.track}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.activitiesCount} activities</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Course progress</span>
                      <span className="font-semibold text-slate-700">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          course.progress > 0 ? "bg-[#15803d]" : "bg-[#43c4d1] w-0"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-[#43c4d1] hover:brightness-95 text-[#0a2640] font-bold text-xs sm:text-sm rounded-xl transition-all"
                >
                  <span>
                    {isCompleted
                      ? "Review course"
                      : isStarted
                      ? "Continue course"
                      : "Start course"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#15803d]">
                  {selectedCourse.track}
                </span>
                <h3 className="text-2xl font-extrabold text-[#0c1e33] mt-1">
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedCourse.description}
            </p>

            {selectedCourse.currentActivity && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803d]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Current Module</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedCourse.currentActivity}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{selectedCourse.currentActivityModule}</span>
                  <span>•</span>
                  <span>{selectedCourse.currentActivityDuration}</span>
                </div>
              </div>
            )}

            {selectedCourse.skills && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Key Skills & Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                href="/student/whiteboards"
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2.5 rounded-xl bg-[#43c4d1] hover:brightness-95 text-[#0a2640] text-xs font-bold transition-colors"
              >
                Open Study Canvas →
              </Link>
            </div>
          </div>
        </div>
      )}
    </SofiaStudentLayout>
  );
}
