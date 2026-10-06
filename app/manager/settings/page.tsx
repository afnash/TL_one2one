"use client";

import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Building2, Mail, Phone, MapPin, ShieldCheck, User } from "lucide-react";

export default function ManagerSettingsPage() {
  const { user } = useLMS();

  return (
    <AppShell headerTitle="Account Settings" headerSubtitle="Department manager profile and access permissions">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-extrabold text-xl">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 mt-1">
                <Building2 className="w-3 h-3" />
                Department Manager
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Email Address</span>
              <p className="font-semibold text-slate-800">{user.email || "manager@onetoone.com"}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Role Level</span>
              <p className="font-semibold text-slate-800">MANAGER (Full Roster & Assignment Rights)</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
