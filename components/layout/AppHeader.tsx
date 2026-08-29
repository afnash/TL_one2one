"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { UserRole } from "@/types";
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  ChevronDown,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  LogOut,
  Settings,
  BookOpen,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({ onOpenMobileMenu, title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const {
    role,
    user,
    switchRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsCommandPaletteOpen,
  } = useLMS();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user.name.split(" ")[0];
  const dynamicGreeting = `${getGreeting()}, ${firstName}`;
  const dynamicSubtitle =
    role === "TEACHER"
      ? "Ready for today's 1-on-1 teaching sessions?"
      : role === "STUDENT"
      ? "Here's what's waiting for you today."
      : "Platform management & analytics overview.";

  const unreadNotifications = notifications.filter(
    (n) => n.targetRole === role && !n.read
  );

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setIsRoleMenuOpen(false);
    if (newRole === "TEACHER") router.push("/teacher/dashboard");
    else if (newRole === "STUDENT") router.push("/student/dashboard");
    else router.push("/admin/dashboard");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      {/* Left: Mobile Hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg md:hidden hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{title || dynamicGreeting}</span>
            {role === "TEACHER" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                <GraduationCap className="w-3 h-3" /> Teacher Portal
              </span>
            )}
            {role === "STUDENT" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
                <BookOpen className="w-3 h-3" /> Student Space
              </span>
            )}
            {role === "SUPERADMIN" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 rounded-full border border-purple-200/60">
                <Shield className="w-3 h-3" /> Superadmin
              </span>
            )}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {subtitle || dynamicSubtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button (Cmd+K) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search (students, boards, etc.)</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Prototype Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Role: {role}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Perspective
              </div>
              <button
                onClick={() => handleRoleChange("TEACHER")}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors",
                  role === "TEACHER" ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Alex Thomas (Teacher)</span>
              </button>
              <button
                onClick={() => handleRoleChange("STUDENT")}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors",
                  role === "STUDENT" ? "bg-emerald-50 text-emerald-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Rahul Menon (Student)</span>
              </button>
              <button
                onClick={() => handleRoleChange("SUPERADMIN")}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors",
                  role === "SUPERADMIN" ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Superadmin</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  Notifications ({unreadNotifications.length})
                </span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 my-1">
                {notifications
                  .filter((n) => n.targetRole === role)
                  .map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "p-2 rounded-lg text-xs transition-colors cursor-pointer",
                        n.read ? "bg-white text-slate-500 hover:bg-slate-50" : "bg-indigo-50/50 text-slate-800 font-medium"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))}

                {notifications.filter((n) => n.targetRole === role).length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push(
                      role === "TEACHER"
                        ? "/teacher/settings"
                        : role === "STUDENT"
                        ? "/student/settings"
                        : "/admin/settings"
                    );
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
