"use client";

import React, { useState, ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "./CommandPalette";
import { RAGStudyChatbot } from "@/components/chat/RAGStudyChatbot";
import { useLMS } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

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
  const { loading, saving, role, user, switchRole } = useLMS();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/admin/")) {
      switchRole("SUPERADMIN");
    } else if (pathname.startsWith("/manager/")) {
      if (role !== "MANAGER" && role !== "SUPERADMIN") {
        switchRole("MANAGER");
      } else if (!loading && role === "MANAGER" && !user.id) {
        router.replace("/login");
      }
    } else if (!loading && (!user.id || !pathname.startsWith("/" + role.toLowerCase() + "/"))) {
      router.replace("/login");
    }
  }, [loading, pathname, user.id, role, router, switchRole]);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full gap-4 overflow-clip bg-background p-0 text-foreground md:p-3">
      {!hideSidebar && (
        <div className="hidden h-full shrink-0 md:flex">
          <AppSidebar />
        </div>
      )}

      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="left" className="w-64 gap-0 p-0 md:hidden" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex h-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <AppHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-3 pb-20 pt-2 md:px-1">
          {saving && (
            <p role="status" className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-md animate-in fade-in-0 duration-150">
              <Spinner /> Saving changes…
            </p>
          )}
          {loading ? (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading workspace">
              <Skeleton className="h-8 w-56" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <CommandPalette />
      <RAGStudyChatbot />
    </div>
  );
}
