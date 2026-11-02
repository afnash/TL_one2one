"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Eye, Search, Star, X } from "lucide-react";
import { Stat } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const selectClass =
  "h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
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
    link.setAttribute("download", `sofiaa_Academic_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Reports logged" value={stats.total} hint="Total sessions reviewed" />
        <Stat label="Average rating" value={`${stats.avgRating} / 5`} hint="Student comprehension" />
        <Stat label="Teaching time" value={`${stats.totalHours} hrs`} hint="Recorded instructional time" />
        <Stat label="Completion rate" value={`${stats.completionRate}%`} hint="Classes completed in full" />
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-xl border bg-card p-3 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search student, topic, teacher or feedback"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search reports"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={selectClass}
            aria-label="Filter by subject"
          >
            <option value="ALL">All subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL">Partial</option>
          </select>

          <ToggleGroup
            type="single"
            variant="outline"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as typeof viewMode)}
            aria-label="View"
          >
            <ToggleGroupItem value="spreadsheet">Table</ToggleGroupItem>
            <ToggleGroupItem value="cards">Cards</ToggleGroupItem>
          </ToggleGroup>

          <Button onClick={handleExportCSV} title="Download the filtered table as CSV / Excel">
            <Download data-icon="inline-start" />
            Export
          </Button>
        </div>
      </div>

      {/* Spreadsheet Grid View */}
      {viewMode === "spreadsheet" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto max-h-[680px]">
            <table className="w-full border-collapse text-left text-xs">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-10 border-b bg-muted text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap w-12 text-center">#</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[110px]">Date & Time</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[140px]">Student</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[110px]">Subject</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[130px]">Teacher</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[180px]">Topic Taught</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[100px] text-center">Duration</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[80px] text-center">Rating</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[100px] text-center">Status</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[120px]">Homework</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[110px]">Test Score</th>
                  <th className="py-3 px-3.5 border-r border-border whitespace-nowrap min-w-[180px]">Next Session Plan</th>
                  <th className="py-3 px-3.5 whitespace-nowrap w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filteredReports.map((report, idx) => {
                  const isPartial = report.completionStatus === "PARTIAL";
                  return (
                    <tr
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-muted/60 transition-colors cursor-pointer group"
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 border-r border-border text-center text-muted-foreground font-mono text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Date & Time */}
                      <td className="py-2.5 px-3.5 border-r border-border whitespace-nowrap">
                        <span className="font-medium text-foreground block">{report.date}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {report.startTime} - {report.endTime}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="py-2.5 px-3.5 border-r border-border">
                        <div className="font-medium text-foreground truncate">{report.studentName}</div>
                        <div className="text-[10px] text-muted-foreground">{report.studentGrade || "Grade 10"}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-2.5 px-3.5 border-r border-border whitespace-nowrap">
                        <span className="text-xs text-foreground">
                          {report.subject}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="py-2.5 px-3.5 border-r border-border whitespace-nowrap text-foreground">
                        {report.tutorContact?.name || "Teacher"}
                      </td>

                      {/* Topic Taught */}
                      <td className="py-2.5 px-3.5 border-r border-border">
                        <span className="font-medium text-foreground line-clamp-1">{report.topicTaught}</span>
                        {report.topicsCovered?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {report.topicsCovered.join(", ")}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3.5 border-r border-border text-center whitespace-nowrap tabular-nums text-foreground">
                        {report.durationMinutes || 0}m
                      </td>

                      {/* Rating */}
                      <td className="py-2.5 px-3.5 border-r border-border text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                          <Star className="size-3 fill-amber-400 text-amber-500" />
                          {report.studentPerformanceRating || 0}/5
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 border-r border-border text-center whitespace-nowrap">
                        <span
                          className={isPartial ? "text-xs font-medium text-destructive" : "text-xs text-muted-foreground"}
                        >
                          {isPartial ? "Partial" : "Completed"}
                        </span>
                      </td>

                      {/* Homework */}
                      <td className="py-2.5 px-3.5 border-r border-border whitespace-nowrap text-[11px] text-muted-foreground">
                        {report.homeworkStatus?.replace(/_/g, " ") || "None"}
                      </td>

                      {/* Test */}
                      <td className="py-2.5 px-3.5 border-r border-border whitespace-nowrap text-[11px]">
                        {report.testName ? (
                          <span className="text-foreground">
                            {report.testMarks != null ? `${report.testMarks}/${report.testMaxMarks}` : "Scheduled"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Next Plan */}
                      <td className="py-2.5 px-3.5 border-r border-border">
                        <span className="text-muted-foreground line-clamp-1">
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
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-base font-medium text-foreground">No session reports match your current filters.</p>
          <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or selecting &quot;All Subjects&quot;.</p>
        </div>
      )}

      {/* Side / Modal Preview when row is clicked */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-xl border bg-background shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between rounded-t-xl border-b bg-card px-6 py-4">
              <div>
                <h3 className="font-medium text-foreground text-base">
                  Session Report: {selectedReport.studentName} · {selectedReport.subject}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedReport.date} · {selectedReport.durationMinutes} minutes</p>
              </div>
              <div className="flex items-center gap-3">
                {canEdit && (
                  <Link
                    href={`/teacher/session/${selectedReport.sessionId}/report`}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    Edit Report
                  </Link>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
