"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Menu, Search } from "lucide-react";
import { useLMS } from "@/lib/store";

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({ onOpenMobileMenu, title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { user, role, setIsCommandPaletteOpen, notifications } = useLMS();
  const unread = notifications.filter((n) => n.targetRole === role && !n.read).length;
  const roleLabel = role === "TEACHER" ? "Lead Educator" : role === "STUDENT" ? "Student" : "Administrator";

  return (
    <header className="min-h-18 h-auto py-3 shrink-0 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6 md:px-7 gap-3 transition-all">
      {/* Left: Back Button + Mobile Menu + Title or Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Back Button with hover tooltip */}
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-all shadow-2xs group relative flex items-center justify-center cursor-pointer shrink-0"
          title="Back to previous page"
          aria-label="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-700" />
          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
            Go back
          </div>
        </button>

        {/* Optional Title & Subtitle or Search Bar */}
        {title ? (
          <div className="min-w-0 pr-2 hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
        ) : null}

        {/* Global Search / Command Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="h-10 w-full max-w-[380px] rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/60 px-3.5 flex items-center gap-2.5 text-slate-600 hover:text-slate-900 text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">Search commands, students, subjects...</span>
          <kbd className="hidden lg:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Role, Avatar & Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label={`${unread} unread notifications`}
          title={`${unread} unread notifications`}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="hidden md:flex flex-col text-right border-l border-slate-200 pl-4 leading-none">
          <strong className="text-xs sm:text-sm text-slate-900">{user.name}</strong>
          <span className="text-[11px] text-slate-500 mt-0.5">{roleLabel}</span>
        </div>

        <img
          src={user.avatar}
          alt={user.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-slate-100 border border-slate-200"
        />

        <button
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          onClick={async () => {
            try {
              await fetch("/api/manage", { method: "DELETE" });
            } catch {}
            localStorage.removeItem("onetoone_identity");
            window.location.href = "/login";
          }}
          title="Sign out of workspace"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

