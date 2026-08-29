"use client";

import React, { useState, ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "./CommandPalette";
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#fbfbfd] text-slate-900 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      {!hideSidebar && (
        <div className="hidden md:flex h-full shrink-0">
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
