"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  ChevronDown, 
  Clock, 
  Download, 
  Eye, 
  Filter, 
  GraduationCap, 
  Search, 
  Star, 
  Table as TableIcon, 
  TrendingUp, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  X
} from "lucide-react";
import { SessionReport } from "@/types";
import { useLMS } from "@/lib/store";
import { SessionReportDetails } from "./SessionReportDetails";

interface ExcelSessionReportsProps {
  reports: SessionReport[];
  title?: string;
  subtitle?: string;
  canEdit?: boolean;
}

export function ExcelSessionReports({
  reports,
  title = "Student Academic Reports",
  subtitle = "Interactive spreadsheet and detailed audit records for your assigned students",
  canEdit = true,
}: ExcelSessionReportsProps) {
  const { directory } = useLMS();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"spreadsheet" | "cards">("spreadsheet");
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(null);

  // Extract unique subjects
  const subjects = useMemo(() => {
    const list = new Set(reports.map(r => r.subject).filter(Boolean));
    return Array.from(list);
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        !q ||
        r.studentName?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.topicTaught?.toLowerCase().includes(q) ||
        r.tutorContact?.name?.toLowerCase().includes(q) ||
        r.managerContact?.name?.toLowerCase().includes(q) ||
        r.studentPerformanceNotes?.toLowerCase().includes(q) ||
        r.topicsCovered?.some(t => t.toLowerCase().includes(q));

      const matchSubject = selectedSubject === "ALL" || r.subject === selectedSubject;
      const matchStatus = selectedStatus === "ALL" || (r.completionStatus || "COMPLETED") === selectedStatus;

      return matchSearch && matchSubject && matchStatus;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [reports, searchTerm, selectedSubject, selectedStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = filteredReports.length;
    const avgRating = total > 0 
      ? (filteredReports.reduce((acc, r) => acc + (r.studentPerformanceRating || 0), 0) / total).toFixed(1)
      : "0.0";
    const totalMinutes = filteredReports.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const completedCount = filteredReports.filter(r => (r.completionStatus || "COMPLETED") === "COMPLETED").length;
    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 100;

    return { total, avgRating, totalHours, completionRate };
  }, [filteredReports]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredReports.length) return;

    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Duration (Mins)",
      "Student Name",
      "Grade",
      "Subject",
      "Teacher",
      "Manager",
      "Primary Topic Taught",
      "Topics Covered",
      "Status",
      "Performance Rating (1-5)",
      "Student Review",
      "Work Completed",
      "Class Overview",
      "Private Notes",
      "Homework Status",
      "Assignment Given",
      "Test Name",
      "Test Marks",
      "Test Max Marks",
      "Next Session Plan",
      "Technical Issues",
    ];

    const rows = filteredReports.map((r) => [
      `"${r.date || ""}"`,
      `"${r.startTime || ""}"`,
      `"${r.endTime || ""}"`,
      r.durationMinutes || 0,
      `"${(r.studentName || "").replace(/"/g, '""')}"`,
      `"${(r.studentGrade || "").replace(/"/g, '""')}"`,
      `"${(r.subject || "").replace(/"/g, '""')}"`,
      `"${(r.tutorContact?.name || "").replace(/"/g, '""')}"`,
      `"${(r.managerContact?.name || "").replace(/"/g, '""')}"`,
      `"${(r.topicTaught || "").replace(/"/g, '""')}"`,
      `"${(r.topicsCovered?.join("; ") || "").replace(/"/g, '""')}"`,
      `"${r.completionStatus || "COMPLETED"}"`,
      r.studentPerformanceRating || 0,
      `"${(r.studentPerformanceNotes || "").replace(/"/g, '""')}"`,
      `"${(r.workCompleted || "").replace(/"/g, '""')}"`,
      `"${(r.classOverview || "").replace(/"/g, '""')}"`,
      `"${(r.teacherNotes || "").replace(/"/g, '""')}"`,
      `"${r.homeworkStatus || "NOT_SET"}"`,
      `"${(r.assignmentGiven || "").replace(/"/g, '""')}"`,
      `"${(r.testName || "").replace(/"/g, '""')}"`,
      r.testMarks ?? "",
      r.testMaxMarks ?? "",
      `"${(r.nextSessionPlan || "").replace(/"/g, '""')}"`,
      `"${r.technicalIssuesOccurred ? "YES: " + (r.technicalIssueDescription || "") : "NO"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OneToOne_Academic_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports Logged</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Total sessions reviewed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Rating</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          <span className="text-[11px] text-slate-400">Student comprehension score</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Teaching Time</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalHours} <span className="text-sm font-normal text-slate-400">hrs</span></p>
          <span className="text-[11px] text-slate-400">Recorded active instructional time</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.completionRate}%</p>
          <span className="text-[11px] text-slate-400">Full class completion</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, topic, teacher, feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL">Partial</option>
          </select>

          {/* View Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode("spreadsheet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "spreadsheet"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Detailed Cards
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download complete filtered table as CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid View */}
      {viewMode === "spreadsheet" ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[680px]">
            <table className="w-full border-collapse text-left text-xs">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-md z-10 border-b border-slate-300 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap w-12 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[110px]">Date & Time</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[140px]">Student</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[110px]">Subject</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[130px]">Teacher</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[180px]">Topic Taught</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[100px] text-center">Duration</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[80px] text-center">Rating</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[100px] text-center">Status</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[120px]">Homework</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[110px]">Test Score</th>
                  <th className="py-3 px-3.5 border-r border-slate-200 whitespace-nowrap min-w-[180px]">Next Session Plan</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {filteredReports.map((report, idx) => {
                  const isPartial = report.completionStatus === "PARTIAL";
                  return (
                    <tr
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-400 font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Date & Time */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{report.date}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {report.startTime} - {report.endTime}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900 truncate">{report.studentName}</div>
                        <div className="text-[10px] text-slate-500">{report.studentGrade || "Grade 10"}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                          {report.subject}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 whitespace-nowrap text-slate-800">
                        {report.tutorContact?.name || "Teacher"}
                      </td>

                      {/* Topic Taught */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200">
                        <span className="font-semibold text-slate-900 line-clamp-1">{report.topicTaught}</span>
                        {report.topicsCovered?.length > 0 && (
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {report.topicsCovered.join(", ")}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 text-center whitespace-nowrap font-mono text-emerald-800 font-bold">
                        {report.durationMinutes || 0}m
                      </td>

                      {/* Rating */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {report.studentPerformanceRating || 0}/5
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPartial
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {report.completionStatus || "COMPLETED"}
                        </span>
                      </td>

                      {/* Homework */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 whitespace-nowrap text-[11px] text-slate-600">
                        {report.homeworkStatus?.replace(/_/g, " ") || "None"}
                      </td>

                      {/* Test */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200 whitespace-nowrap text-[11px]">
                        {report.testName ? (
                          <span className="font-semibold text-slate-800">
                            {report.testMarks != null ? `${report.testMarks}/${report.testMaxMarks}` : "Scheduled"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Next Plan */}
                      <td className="py-2.5 px-3.5 border-r border-slate-200">
                        <span className="text-slate-600 line-clamp-1">
                          {report.nextSessionPlan || "Regular progression"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs transition-colors"
                          title="View Full Report Record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detailed Cards View */
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <SessionReportDetails key={report.id} report={report} editable={canEdit} />
          ))}
        </div>
      )}

      {!filteredReports.length && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-base font-semibold text-slate-700">No session reports match your current filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting &quot;All Subjects&quot;.</p>
        </div>
      )}

      {/* Side / Modal Preview when row is clicked */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Session Report: {selectedReport.studentName} — {selectedReport.subject}
                </h3>
                <p className="text-xs text-slate-500">{selectedReport.date} · {selectedReport.durationMinutes} minutes</p>
              </div>
              <div className="flex items-center gap-3">
                {canEdit && (
                  <Link
                    href={`/teacher/session/${selectedReport.sessionId}/report`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Edit Report
                  </Link>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <SessionReportDetails report={selectedReport} editable={canEdit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
