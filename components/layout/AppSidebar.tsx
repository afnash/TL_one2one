"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  BarChart3,
  BookOpen,
  Building2,
  FolderOpen,
  GraduationCap,
  History,
  KeyRound,
  LayoutDashboard,
  Layers,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Brand } from "@/components/brand/Brand";
import { setSidebarCollapsed, useSidebarCollapsed } from "./sidebar-state";

interface AppSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const teacher = [
  ["Dashboard", "/teacher/dashboard", LayoutDashboard],
  ["Students", "/teacher/students", Users],
  ["Lessons", "/teacher/sessions", Video],
  ["Conference", "/teacher/conference", Presentation],
  ["Whiteboards", "/teacher/whiteboards", Layers],
  ["Assignments", "/teacher/assignments", BookOpen],
  ["Materials", "/teacher/materials", FolderOpen],
  ["Reports", "/teacher/reports", BarChart3],
  ["Settings", "/teacher/settings", Settings],
] as const;

const student = [
  ["Dashboard", "/student/dashboard", LayoutDashboard],
  ["Lessons", "/student/sessions", Video],
  ["Conference", "/student/conference", Presentation],
  ["Whiteboards", "/student/whiteboards", Layers],
  ["Assignments", "/student/assignments", BookOpen],
  ["Materials", "/student/materials", FolderOpen],
  ["Progress", "/student/progress", TrendingUp],
  ["History", "/student/history", History],
  ["Settings", "/student/settings", Settings],
] as const;

const admin = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Credentials", "/admin/credentials", KeyRound],
  ["Managers", "/admin/managers", Building2],
  ["Teachers", "/admin/teachers", GraduationCap],
  ["Students", "/admin/students", Users],
  ["Lessons", "/admin/sessions", Video],
  ["Assignments", "/admin/assignments", BookOpen],
  ["Materials", "/admin/materials", FolderOpen],
  ["Reports", "/admin/reports", BarChart3],
  ["Settings", "/admin/settings", Settings],
] as const;

const manager = [
  ["Dashboard", "/manager/dashboard", LayoutDashboard],
  ["Teachers", "/manager/teachers", GraduationCap],
  ["Students", "/manager/students", Users],
  ["Lessons", "/manager/sessions", Video],
  ["Reports", "/manager/reports", BarChart3],
  ["Settings", "/manager/settings", Settings],
] as const;

// Shared with the command palette so both list the same pages.
export function navItemsFor(role: string) {
  return role === "TEACHER" ? teacher : role === "STUDENT" ? student : role === "MANAGER" ? manager : admin;
}

export function AppSidebar({
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const path = usePathname();
  const { role } = useLMS();
  const storedCollapsed = useSidebarCollapsed();

  // The mobile drawer is always expanded; a controlled prop wins over the stored choice.
  const isCollapsed = onCloseMobile ? false : controlledCollapsed !== undefined ? controlledCollapsed : storedCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setSidebarCollapsed(!storedCollapsed);
  };

  const items = navItemsFor(role);

  const portalLabel =
    role === "TEACHER" ? "Teacher studio" : role === "STUDENT" ? "Student portal" : role === "MANAGER" ? "Manager" : "Admin panel";

  return (
    <aside
      className={cn(
        "flex h-full select-none flex-col overflow-hidden rounded-xl border bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        isCollapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b px-3",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {isCollapsed ? (
          <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Expand sidebar">
            <PanelLeftOpen />
          </Button>
        ) : (
          <>
            <Brand className="pl-1 [&_img]:h-9" />
            <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Collapse sidebar">
              <PanelLeftClose />
            </Button>
          </>
        )}
      </div>

      <nav
        aria-label={`${portalLabel} navigation`}
        className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {!isCollapsed && (
          <p className="px-3 pb-1 pt-1 text-xs font-medium text-muted-foreground">{portalLabel}</p>
        )}
        {items.map(([label, href, Icon]) => {
          const active = path === href || (href.split("/").length > 3 && path.startsWith(href));
          const link = (
            <Link
              href={href}
              onClick={onCloseMobile}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center" : "px-3",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              {!isCollapsed && <span className="truncate">{label}</span>}
              {!isCollapsed && active && <span className="ml-auto size-1.5 rounded-full bg-brand" />}
            </Link>
          );
          if (!isCollapsed) return <React.Fragment key={href}>{link}</React.Fragment>;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
