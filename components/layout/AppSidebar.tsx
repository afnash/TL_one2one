"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  Video,
  Layers,
  BookOpen,
  FolderOpen,
  History,
  FileBarChart,
  Settings,
  TrendingUp,
  GraduationCap,
  BookMarked,
  Sparkles,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { role, assignments, sessions } = useLMS();

  // Active items counts
  const pendingAssignmentsCount = assignments.length;
  const upcomingSessionsCount = sessions.filter((s) => s.status === "SCHEDULED").length;

  const teacherNav: NavItem[] = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/teacher/students", icon: Users },
    {
      name: "Live Sessions",
      href: "/teacher/sessions",
      icon: Video,
      badge: upcomingSessionsCount > 0 ? `${upcomingSessionsCount}` : undefined,
    },
    { name: "Whiteboards", href: "/teacher/whiteboards", icon: Layers },
    {
      name: "Assignments",
      href: "/teacher/assignments",
      icon: BookOpen,
      badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount}` : undefined,
    },
    { name: "Study Materials", href: "/teacher/materials", icon: FolderOpen },
    { name: "Reports", href: "/teacher/reports", icon: FileBarChart },
    { name: "Settings", href: "/teacher/settings", icon: Settings },
  ];

  const studentNav: NavItem[] = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    {
      name: "My Sessions",
      href: "/student/sessions",
      icon: Video,
      badge: upcomingSessionsCount > 0 ? `${upcomingSessionsCount}` : undefined,
    },
    { name: "My Whiteboards", href: "/student/whiteboards", icon: Layers },
    {
      name: "Assignments",
      href: "/student/assignments",
      icon: BookOpen,
      badge: "1 Due",
    },
    { name: "Study Materials", href: "/student/materials", icon: FolderOpen },
    { name: "Progress", href: "/student/progress", icon: TrendingUp },
    { name: "History", href: "/student/history", icon: History },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Teachers", href: "/admin/teachers", icon: GraduationCap },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Subjects", href: "/admin/subjects", icon: BookMarked },
    { name: "Sessions", href: "/admin/sessions", icon: Video },
    { name: "Assignments", href: "/admin/assignments", icon: BookOpen },
    { name: "Materials", href: "/admin/materials", icon: FolderOpen },
    { name: "Reports", href: "/admin/reports", icon: FileBarChart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const navItems =
    role === "TEACHER" ? teacherNav : role === "STUDENT" ? studentNav : adminNav;

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-slate-200/90 select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            1:1
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">OneToOne</span>
              <span className="px-1 py-0.2 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded">PRO</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">1-ON-1 TEACHING LMS</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {role === "TEACHER" ? "Teaching Suite" : role === "STUDENT" ? "Learning Space" : "Administration"}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/teacher/dashboard" && item.href !== "/student/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all group",
                isActive
                  ? "bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                    isActive ? "bg-indigo-200 text-indigo-900" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick 1-on-1 Concept Note Box */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>1-to-1 Live Synced</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Dedicated 1-on-1 workspace for deep conceptual mastery.
          </p>
        </div>
      </div>
    </aside>
  );
}
