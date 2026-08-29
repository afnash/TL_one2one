"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Shield, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState("OneToOne LMS Platform");
  const [domain, setDomain] = useState("app.onetoone.io");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AppShell
      headerTitle="Superadmin Settings"
      headerSubtitle="Global platform configuration, security policies, and integrations"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <form onSubmit={handleSave} className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Production Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {isSaved && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Configuration saved
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Update Settings
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
