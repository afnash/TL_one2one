"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  BarChart3,
  BookOpen,
  FolderOpen,
  GraduationCap,
  History,
  LayoutDashboard,
  Layers,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

const teacher = [
  ["Dashboard", "/teacher/dashboard", LayoutDashboard],
  ["Students", "/teacher/students", Users],
  ["Sessions", "/teacher/sessions", Video],
  ["Whiteboards", "/teacher/whiteboards", Layers],
  ["Assignments", "/teacher/assignments", BookOpen],
  ["Materials", "/teacher/materials", FolderOpen],
  ["History", "/teacher/history", History],
  ["Reports", "/teacher/reports", BarChart3],
  ["Settings", "/teacher/settings", Settings],
] as const;

const student = [
  ["Home", "/student/dashboard", LayoutDashboard],
  ["Sessions", "/student/sessions", Video],
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

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const path = usePathname();
  const { role } = useLMS();
  const items = role === "TEACHER" ? teacher : role === "STUDENT" ? student : admin;

  return (
    <aside className="w-72 h-full flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
      <Link href="/" className="h-20 px-6 flex items-center border-b border-slate-100">
        <Image
          src="/icon.jpg"
          alt="OneToOne Logo"
          width={130}
          height={42}
          className="h-9 w-auto object-contain"
          priority
        />
      </Link>
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {items.map(([label, href, Icon]) => {
          const active = path === href || (href.split("/").length > 3 && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              className={cn(
                "h-12 px-4 rounded-xl flex items-center gap-3.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {role === "TEACHER" && (
        <Link
          href="/manage"
          className="mx-4 mb-4 h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-100"
        >
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Admin Portal</span>
        </Link>
      )}
    </aside>
  );
}
