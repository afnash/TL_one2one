"use client";
import { Bell, Menu, Search } from "lucide-react";
import { useLMS } from "@/lib/store";
interface AppHeaderProps { onOpenMobileMenu?: () => void; title?: string; subtitle?: string }
export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const { user, role, setIsCommandPaletteOpen, notifications } = useLMS();
  const unread=notifications.filter(n=>n.targetRole===role&&!n.read).length;
  const roleLabel=role==="TEACHER"?"Lead Educator":role==="STUDENT"?"Student":"Administrator";
  return <header className="h-20 shrink-0 rounded-xl bg-[#f8f9ff]/80 backdrop-blur-xl shadow-[0_2px_12px_rgba(32,48,75,.04)] flex items-center justify-between px-6 md:px-8">
    <div className="flex items-center gap-3 flex-1"><button onClick={onOpenMobileMenu} className="md:hidden p-2 text-[#464554]" aria-label="Open navigation"><Menu className="w-5 h-5"/></button><button onClick={()=>setIsCommandPaletteOpen(true)} className="h-10 w-full max-w-[480px] rounded-full bg-[#e5eeff] px-5 flex items-center gap-3 text-[#0b1c30] text-sm md:text-base"><Search className="w-5 h-5 text-[#464554]"/><span>Search anything...</span></button></div>
    <div className="flex items-center gap-4 md:gap-5"><button className="text-xs text-slate-500" onClick={async()=>{await fetch("/api/manage",{method:"DELETE"});localStorage.removeItem("onetoone_identity");window.location.href="/login";}}>Sign out</button><button className="relative p-2 text-[#464554]" aria-label={`${unread} unread notifications`}><Bell className="w-6 h-6"/>{unread>0&&<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-[#f8f9ff]"/>}</button><div className="hidden sm:flex flex-col text-right border-l border-[#c7c4d7] pl-5 leading-none"><strong className="text-sm text-[#0b1c30]">{user.name}</strong><span className="text-xs text-[#464554] mt-1">{roleLabel}</span></div><img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#e1e0ff]"/></div>
  </header>;
}
