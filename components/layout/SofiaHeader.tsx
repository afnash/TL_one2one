"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  ChevronDown,
  Video,
  BookOpen,
  Layers,
  FolderOpen,
  TrendingUp,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SofiaHeaderProps {
  activeTab?: "overview" | "courses" | "opportunities" | "applications";
}

export function SofiaHeader({ activeTab }: SofiaHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, switchRole } = useLMS();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Determine current active tab from pathname if not provided
  const currentTab = activeTab || (
    pathname.includes("/courses")
      ? "courses"
      : pathname.includes("/opportunities")
      ? "opportunities"
      : pathname.includes("/applications")
      ? "applications"
      : "overview"
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format initials
  const displayName = user.name && user.name !== "Student" ? user.name : "Ruvais P";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RP";

  const navLinks = [
    { label: "Overview", href: "/student/dashboard", key: "overview" },
    { label: "Courses", href: "/student/courses", key: "courses" },
    { label: "Opportunities", href: "/student/opportunities", key: "opportunities" },
    { label: "Applications", href: "/student/applications", key: "applications" },
  ];

  const handleSignOut = async () => {
    try {
      await fetch("/api/manage", { method: "DELETE" });
    } catch {
      // ignore
    }
    localStorage.removeItem("onetoone_identity");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo + Primary Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Sofia Logo with distinct turquoise dot */}
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1 group select-none py-1"
            aria-label="Sofia Home"
          >
            <div className="flex items-baseline">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bec9] mr-0.5 mb-1 inline-block shrink-0 animate-pulse" />
              <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0f2a4a] lowercase font-sans">
                sofia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-full border border-slate-200/60">
            {navLinks.map((link) => {
              const isActive = currentTab === link.key;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-150",
                    isActive
                      ? "bg-[#43c4d1] text-[#0a2640] shadow-xs scale-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: User Profile Dropdown & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              aria-expanded={profileOpen}
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300">
                {initials}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-800">
                {displayName}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-500 transition-transform duration-200",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
                {/* Header User details */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#43c4d1]/20 text-[#0a2640] flex items-center justify-center font-extrabold text-sm border border-[#43c4d1]/40">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user.email || "student@sofia.edu"}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      Enrolled Student
                    </span>
                  </div>
                </div>

                {/* Quick Tools */}
                <div className="space-y-0.5 pt-1">
                  <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Classroom Tools
                  </p>
                  <Link
                    href="/student/sessions"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>Live 1:1 Classes & Video</span>
                  </Link>
                  <Link
                    href="/student/assignments"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Homework & Assignments</span>
                  </Link>
                  <Link
                    href="/student/whiteboards"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>Whiteboard Canvas</span>
                  </Link>
                  <Link
                    href="/student/materials"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                    <span>Study Vault & Materials</span>
                  </Link>
                  <Link
                    href="/student/progress"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Progress & Reports</span>
                  </Link>
                </div>

                {/* Workspace Switcher */}
                <div className="pt-2 border-t border-slate-100 space-y-0.5">
                  <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Workspace
                  </p>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      switchRole("TEACHER");
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Teacher Studio
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">Switch →</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      switchRole("SUPERADMIN");
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Admin Console
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Sign Out */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-150">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const isActive = currentTab === link.key;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold text-center transition-colors",
                    isActive
                      ? "bg-[#43c4d1] text-[#0a2640]"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <Link
              href="/student/sessions"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Classes</span>
            </Link>
            <Link
              href="/student/assignments"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Homework</span>
            </Link>
            <Link
              href="/student/whiteboards"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Whiteboards</span>
            </Link>
            <Link
              href="/student/materials"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Materials</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
