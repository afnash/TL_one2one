"use client";

import React, { ReactNode } from "react";
import { SofiaHeader } from "./SofiaHeader";
import { CommandPalette } from "./CommandPalette";
import { useLMS } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface SofiaStudentLayoutProps {
  children: ReactNode;
  activeTab?: "overview" | "courses" | "opportunities";
}

export function SofiaStudentLayout({ children, activeTab }: SofiaStudentLayoutProps) {
  const { loading, saving, connectionError, role, user, switchRole } = useLMS();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/admin/")) {
      switchRole("SUPERADMIN");
    } else if (!loading && (!user.id || !pathname.startsWith("/student/"))) {
      if (role !== "STUDENT") {
        router.replace("/login");
      }
    }
  }, [loading, pathname, user.id, role, router, switchRole]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30] flex flex-col font-sans selection:bg-[#43c4d1] selection:text-[#0a2640]">
      {/* Top Header */}
      <SofiaHeader activeTab={activeTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {connectionError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm flex items-center justify-between"
          >
            <span>{connectionError}</span>
            <button onClick={() => window.location.reload()} className="underline font-bold">
              Reload
            </button>
          </div>
        )}
        {saving && (
          <p role="status" className="text-xs text-[#059669] mb-3 font-medium">
            Saving progress...
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-[#43c4d1] border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading Sofia workspace...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
