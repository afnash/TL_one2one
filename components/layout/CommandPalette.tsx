"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, GraduationCap, Layers, Users, Video } from "lucide-react";
import { useLMS } from "@/lib/store";
import { navItemsFor } from "./AppSidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

// Where each kind of record leads, per role. A missing entry means that role does not
// get that group in the palette.
const ROUTES: Record<string, Partial<Record<"students" | "teachers" | "assignments" | "sessions" | "materials" | "whiteboards", (id: string) => string>>> = {
  TEACHER: {
    students: (id) => `/teacher/students/${id}`,
    assignments: () => "/teacher/assignments",
    sessions: () => "/teacher/sessions",
    materials: () => "/teacher/materials",
    whiteboards: () => "/teacher/whiteboards",
  },
  STUDENT: {
    assignments: (id) => `/student/assignments/${id}`,
    sessions: () => "/student/sessions",
    materials: () => "/student/materials",
    whiteboards: () => "/student/whiteboards",
  },
  MANAGER: {
    students: () => "/manager/students",
    teachers: () => "/manager/teachers",
    sessions: () => "/manager/sessions",
  },
  SUPERADMIN: {
    students: () => "/admin/students",
    teachers: () => "/admin/teachers",
    assignments: () => "/admin/assignments",
    sessions: () => "/admin/sessions",
    materials: () => "/admin/materials",
  },
};

export function CommandPalette() {
  const router = useRouter();
  const {
    role,
    directory,
    students,
    teachers,
    sessions,
    assignments,
    whiteboards,
    materials,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
  } = useLMS();

  // Ctrl/Cmd+K toggles the palette. Escape is handled by the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  const routes = ROUTES[role] ?? {};
  const go = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const pages = navItemsFor(role);
  // Admins and managers search the directory; teachers and students their own scoped lists.
  const studentList = role === "SUPERADMIN" || role === "MANAGER" ? directory.students : students;
  const teacherList = role === "SUPERADMIN" || role === "MANAGER" ? directory.teachers : teachers;

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setIsCommandPaletteOpen}
      title="Search"
      description="Jump to a page or find a student, lesson, assignment or material."
    >
      <CommandInput placeholder="Search pages, people, lessons and materials" />
      <CommandList>
        <CommandEmpty>Nothing matches your search.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map(([label, href, Icon]) => (
            <CommandItem key={href} value={`page ${label}`} onSelect={() => go(href)}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        {routes.students && studentList.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Students">
              {studentList.map((s) => (
                <CommandItem key={s.id} value={`student ${s.name} ${s.email} ${s.subjects?.join(" ")}`} onSelect={() => go(routes.students!(s.id))}>
                  <Users />
                  <span>{s.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{s.grade}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {routes.teachers && teacherList.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Teachers">
              {teacherList.map((t) => (
                <CommandItem key={t.id} value={`teacher ${t.name} ${t.email} ${t.subjects?.join(" ")}`} onSelect={() => go(routes.teachers!(t.id))}>
                  <GraduationCap />
                  <span>{t.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.subjects?.join(", ")}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {routes.sessions && sessions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Lessons">
              {sessions.map((s) => (
                <CommandItem key={s.id} value={`lesson ${s.studentName} ${s.teacherName} ${s.subject} ${s.topic}`} onSelect={() => go(routes.sessions!(s.id))}>
                  <Video />
                  <span>{s.subject}: {s.topic}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{s.date}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {routes.assignments && assignments.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Assignments">
              {assignments.map((a) => (
                <CommandItem key={a.id} value={`assignment ${a.title} ${a.subject}`} onSelect={() => go(routes.assignments!(a.id))}>
                  <BookOpen />
                  <span>{a.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Due {a.dueDate}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {routes.materials && materials.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Materials">
              {materials.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`material ${m.title} ${m.subject} ${m.topic ?? ""} ${m.keywords?.join(" ") ?? ""}`}
                  onSelect={() => go(routes.materials!(m.id))}
                >
                  <FileText />
                  <span>{m.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{m.subject}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {routes.whiteboards && whiteboards.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Whiteboards">
              {whiteboards.map((w) => (
                <CommandItem key={w.id} value={`whiteboard ${w.title} ${w.subject}`} onSelect={() => go(routes.whiteboards!(w.id))}>
                  <Layers />
                  <span>{w.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{w.subject}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
