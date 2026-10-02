"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SofiaStudentLayout } from "@/components/layout/SofiaStudentLayout";
import { INITIAL_OPPORTUNITIES, getStoredApplications, saveStoredApplications } from "@/lib/sofia-data";
import { Opportunity, OpportunityApplication } from "@/types";
import {
  Search,
  ChevronDown,
  ArrowRight,
  MapPin,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpportunitiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("All");
  const [workplaceFilter, setWorkplaceFilter] = useState("All");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);

  const filtered = INITIAL_OPPORTUNITIES.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.company && opp.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEmployment =
      employmentFilter === "All" ||
      opp.type.toLowerCase() === employmentFilter.toLowerCase();

    const matchesWorkplace =
      workplaceFilter === "All" ||
      opp.workplace.toLowerCase() === workplaceFilter.toLowerCase();

    return matchesSearch && matchesEmployment && matchesWorkplace;
  });

  const handleApply = (opp: Opportunity) => {
    const current = getStoredApplications();
    if (!current.some((a) => a.opportunityId === opp.id)) {
      const newApp: OpportunityApplication = {
        id: `app-${Date.now()}`,
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        company: opp.company || "Sofia Partner Network",
        appliedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "UNDER_REVIEW",
        type: opp.type,
        workplace: opp.workplace,
      };
      saveStoredApplications([newApp, ...current]);
    }
    setAppliedSuccess(opp.id);
    setTimeout(() => {
      setSelectedOpp(null);
      setAppliedSuccess(null);
      router.push("/student/applications");
    }, 1200);
  };

  return (
    <SofiaStudentLayout activeTab="opportunities">
      <div className="space-y-8 pb-16">
        {/* Header with Title & "My applications" Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-[#15803d]">
              Beyond the curriculum
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
              Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Explore roles selected for your learning community and see what you need before applying.
            </p>
          </div>

          <Link
            href="/student/applications"
            className="px-4 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors self-start shadow-xs"
          >
            My applications
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles or companies"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43c4d1] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Employment Filter Dropdown */}
          <div className="relative">
            <select
              value={employmentFilter}
              onChange={(e) => setEmploymentFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#43c4d1] cursor-pointer shadow-xs"
            >
              <option value="All">All employment</option>
              <option value="Project">Project</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Workplace Filter Dropdown */}
          <div className="relative">
            <select
              value={workplaceFilter}
              onChange={(e) => setWorkplaceFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#43c4d1] cursor-pointer shadow-xs"
            >
              <option value="All">All workplaces</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Opportunity Card List */}
        <div className="space-y-4">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Pale green OP avatar circle */}
                <div className="w-11 h-11 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] font-bold text-xs flex items-center justify-center shrink-0 border border-[#c8e6c9]">
                  OP
                </div>

                <div className="space-y-1.5">
                  {/* Tag */}
                  {opp.eligible && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-semibold">
                      Eligible
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0c1e33] leading-snug">
                    {opp.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500">
                    {opp.description}
                  </p>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span>
                      {opp.type} • {opp.workplace}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location || opp.workplace}
                    </span>
                    <span>•</span>
                    <span>{opp.compensation}</span>
                  </div>
                </div>
              </div>

              {/* View details button on right */}
              <button
                onClick={() => setSelectedOpp(opp)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0c1e33] hover:text-[#43c4d1] transition-colors shrink-0 self-end sm:self-center"
              >
                <span>View details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No matching opportunities found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Detail & Quick Apply Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-xs font-semibold">
                  Eligible for Sofia Students
                </span>
                <h3 className="text-2xl font-extrabold text-[#0c1e33]">
                  {selectedOpp.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedOpp.company} • {selectedOpp.type} ({selectedOpp.workplace})
                </p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-800">Role Overview</p>
              <p>{selectedOpp.description}</p>
            </div>

            {selectedOpp.requirements && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Community Eligibility & Requirements
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedOpp.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Compensation: <strong>{selectedOpp.compensation}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApply(selectedOpp)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                >
                  {appliedSuccess === selectedOpp.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Apply with Sofia Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SofiaStudentLayout>
  );
}
