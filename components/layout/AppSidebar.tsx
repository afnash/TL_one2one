"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FolderOpen,
  GraduationCap,
  History,
  LayoutDashboard,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const teacher = [
  ["Dashboard", "/teacher/dashboard", LayoutDashboard],
  ["Students", "/teacher/students", Users],
  ["Sessions", "/teacher/sessions", Video],
  ["Conference", "/teacher/conference", Users],
  ["Whiteboards", "/teacher/whiteboards", Layers],
  ["Assignments", "/teacher/assignments", BookOpen],
  ["Materials", "/teacher/materials", FolderOpen],
  ["History", "/teacher/history", History],
  ["Reports", "/teacher/reports", BarChart3],
  ["Settings", "/teacher/settings", Settings],
] as const;

const student = [
  ["Overview", "/student/dashboard", LayoutDashboard],
  ["Courses", "/student/courses", BookOpen],
  ["Opportunities", "/student/opportunities", Briefcase],
  ["Applications", "/student/applications", FileCheck],
  ["Live Sessions", "/student/sessions", Video],
  ["Whiteboards", "/student/whiteboards", Layers],
  ["Assignments", "/student/assignments", BookOpen],
  ["Materials", "/student/materials", FolderOpen],
  ["Progress", "/student/progress", TrendingUp],
  ["History", "/student/history", History],
  ["Settings", "/student/settings", Settings],
] as const;

const admin = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Teachers", "/admin/teachers", GraduationCap],
  ["Students", "/admin/students", Users],
  ["Sessions", "/admin/sessions", Video],
  ["Assignments", "/admin/assignments", BookOpen],
  ["Materials", "/admin/materials", FolderOpen],
  ["Reports", "/admin/reports", BarChart3],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AppSidebar({
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const path = usePathname();
  const { role } = useLMS();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Sync with localStorage on mount if not controlled externally
  useEffect(() => {
    try {
      const saved = localStorage.getItem("onetoone_sidebar_collapsed");
      if (saved !== null) {
        setInternalCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const next = !internalCollapsed;
      setInternalCollapsed(next);
      try {
        localStorage.setItem("onetoone_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
    }
  };

  const items = role === "TEACHER" ? teacher : role === "STUDENT" ? student : admin;

  return (
    <aside
      className={cn(
        "h-full flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-300 select-none",
        isCollapsed ? "w-20" : "w-64 lg:w-70"
      )}
    >
      {/* Top Header with icon.jpg */}
      <div className="h-18 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 overflow-hidden group",
            isCollapsed && "justify-center w-full"
          )}
          title="Home"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0 group-hover:border-slate-300 transition-colors">
            <Image
              src="/icon.jpg"
              alt="Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-[#0f2a4a] block tracking-tight leading-tight">
                OneToOne
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {role === "TEACHER" ? "Teacher Studio" : role === "STUDENT" ? "Student Portal" : "Admin Panel"}
              </span>
            </div>
          )}
        </Link>

        {/* Toggle button on desktop header when expanded */}
        {!isCollapsed && (
          <button
            onClick={handleToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {items.map(([label, href, Icon]) => {
          const active =
            path === href || (href.split("/").length > 3 && path.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              title={isCollapsed ? label : undefined}
              className={cn(
                "h-11 rounded-xl flex items-center text-xs sm:text-sm font-medium transition-all group relative",
                isCollapsed
                  ? "justify-center px-0 w-full"
                  : "px-3.5 gap-3",
                active
                  ? "bg-[#43c4d1] text-[#0a2640] font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                  active ? "text-[#0a2640]" : "text-slate-500 group-hover:text-slate-800"
                )}
              />

              {!isCollapsed && <span className="truncate">{label}</span>}

              {/* Floating Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Section with Collapse Toggle & Admin portal link */}
      <div className="p-3 border-t border-slate-100 space-y-1 shrink-0">
        {role === "TEACHER" && (
          <Link
            href="/manage"
            title={isCollapsed ? "Admin Console" : undefined}
            className={cn(
              "h-10 rounded-xl flex items-center text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-100",
              isCollapsed ? "justify-center px-0" : "px-3 gap-2.5"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Admin Portal</span>}
          </Link>
        )}

        {/* Compress/Expand Button at Bottom */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-full h-10 rounded-xl flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors",
            isCollapsed ? "justify-center px-0" : "px-3 justify-between"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <span className="text-[11px] text-slate-400">Sidebar Mode</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                <ChevronLeft className="w-3.5 h-3.5" /> Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
