"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SofiaStudentLayout } from "@/components/layout/SofiaStudentLayout";
import { getStoredApplications, saveStoredApplications } from "@/lib/sofia-data";
import { OpportunityApplication } from "@/types";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  Building2,
  Trash2,
} from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setApplications(getStoredApplications());
    setHasLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    setApplications(updated);
    saveStoredApplications(updated);
  };

  return (
    <SofiaStudentLayout activeTab="applications">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-[#15803d]">
              Your progress
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
              My applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              See every opportunity you applied to through Tella and follow its current status.
            </p>
          </div>

          <Link
            href="/student/opportunities"
            className="px-4 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors self-start shadow-xs"
          >
            Find opportunities
          </Link>
        </div>

        {/* State: Empty or Populated */}
        {hasLoaded && applications.length === 0 ? (
          /* Empty State Matching Screenshot */
          <div className="w-full bg-white/70 rounded-3xl border border-dashed border-sky-200/90 p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
            {/* Check Circle Icon */}
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-slate-600" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-[#0c1e33]">
                No applications yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Applications submitted through Tella will appear here. External employer applications are not tracked.
              </p>
            </div>

            {/* Green button */}
            <div className="pt-2">
              <Link
                href="/student/opportunities"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all active:scale-95"
              >
                <span>Browse opportunities</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Populated State with Active Applications */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Submitted Applications ({applications.length})
              </p>
              <button
                onClick={() => {
                  setApplications([]);
                  saveStoredApplications([]);
                }}
                className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear demo list</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                        {app.status === "UNDER_REVIEW"
                          ? "Under Review"
                          : app.status === "SHORTLISTED"
                          ? "Shortlisted"
                          : app.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Applied {app.appliedDate}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#0c1e33]">
                      {app.opportunityTitle}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.company}</span>
                      <span>•</span>
                      <span>{app.type} ({app.workplace})</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRemove(app.id)}
                      className="text-xs text-slate-400 hover:text-red-500 p-2"
                      title="Withdraw application"
                    >
                      Withdraw
                    </button>
                    <Link
                      href="/student/opportunities"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      View Role
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SofiaStudentLayout>
  );
}
