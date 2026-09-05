"use client";

import React, { useState, ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "./CommandPalette";
import { useLMS } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  hideSidebar?: boolean;
}

export function AppShell({
  children,
  headerTitle,
  headerSubtitle,
  hideSidebar = false,
}: AppShellProps) {
  const { loading, saving, connectionError, role, user, switchRole } = useLMS();
  const pathname = usePathname(); const router = useRouter();
  useEffect(() => { if(pathname.startsWith("/admin/")) switchRole("SUPERADMIN"); else if(!loading && (!user.id || !pathname.startsWith("/"+role.toLowerCase()+"/"))) router.replace("/login"); }, [loading, pathname, user.id, role]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8f9ff] text-[#0b1c30] overflow-hidden font-sans md:pr-4 md:gap-10">
      {/* Desktop Sidebar */}
      {!hideSidebar && (
        <div className="hidden md:flex h-full w-72 shrink-0">
          <AppSidebar />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-64 h-full bg-white shadow-2xl animate-in slide-in-from-left">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <AppSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        <AppHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:px-0 md:py-6">
          {connectionError && <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{connectionError} <button onClick={()=>window.location.reload()} className="underline">Reload</button></div>}
          {saving && <p role="status" className="text-xs text-indigo-600 mb-3">Saving to Supabase?</p>}
          {loading ? <p className="p-8 text-slate-500">Loading workspace?</p> : children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
