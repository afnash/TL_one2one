"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import type { UserRole } from "@/types";
export function RoleGate({ expected, children }: { expected: UserRole; children: React.ReactNode }) {
 const { loading, role, user, switchRole, connectionError }=useLMS();const router=useRouter();
 useEffect(()=>{ if(expected==="SUPERADMIN") { if(role!==expected)switchRole(expected); } else if(!loading&&(role!==expected||!user.id))router.replace("/login"); },[loading,role,user.id,expected]);
 if(loading||role!==expected||(expected!=="SUPERADMIN"&&!user.id))return <div className="p-10 text-slate-500">Loading workspace?</div>;
 return <>{connectionError&&<div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{connectionError} <button className="underline" onClick={()=>window.location.reload()}>Reload</button></div>}{children}</>;
}
