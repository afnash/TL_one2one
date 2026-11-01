"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, LogOut, Menu, Search } from "lucide-react";
import { useLMS } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({ onOpenMobileMenu, title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { user, role, setIsCommandPaletteOpen, notifications, logout, markNotificationRead } = useLMS();
  const mine = notifications.filter((n) => n.targetRole === role && (!n.userId || n.userId === user.id || role === "SUPERADMIN"));
  const unread = mine.filter((n) => !n.read).length;
  const roleLabel =
    role === "TEACHER" ? "Teacher" : role === "STUDENT" ? "Student" : role === "MANAGER" ? "Manager" : "Administrator";
  const initials = (user.name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const signOut = async () => {
    await logout();
    window.location.href = role === "SUPERADMIN" ? "/manage" : "/login";
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 rounded-xl border bg-card px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileMenu} aria-label="Open navigation">
          <Menu />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back to previous page">
          <ArrowLeft />
        </Button>

        {title && (
          <div className="hidden min-w-0 pr-2 lg:block">
            <h1 className="truncate text-base font-semibold leading-tight text-foreground">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="h-9 w-full max-w-sm justify-start gap-2 bg-muted/50 font-normal text-muted-foreground"
        >
          <Search />
          <span className="truncate">Search…</span>
          <kbd className="ml-auto hidden rounded border bg-card px-1.5 py-0.5 text-[10px] font-medium lg:inline-block">⌘K</kbd>
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
              <Bell />
              {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-card" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mine.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {[...mine].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20).map((n) => (
                  <DropdownMenuItem key={n.id} asChild onSelect={() => markNotificationRead(n.id)}>
                    <Link href={n.link || "#"} className="flex flex-col items-start gap-0.5">
                      <span className={n.read ? "text-sm text-muted-foreground" : "text-sm font-medium"}>{n.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-1.5" aria-label="Account menu">
              <Avatar className="size-8">
                {user.avatar && user.avatar !== "/icon.jpg" && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start text-left leading-tight md:flex">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-[11px] font-normal text-muted-foreground">{roleLabel}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="block text-sm font-medium text-foreground">{user.name}</span>
                <span className="block text-xs text-muted-foreground">{roleLabel}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={signOut}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
