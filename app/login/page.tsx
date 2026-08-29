"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLMS } from "@/lib/store";
import { UserRole } from "@/types";
import {
  GraduationCap,
  BookOpen,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useLMS();

  const [selectedRole, setSelectedRole] = useState<UserRole>("TEACHER");
  const [email, setEmail] = useState("alex.thomas@edulearn.io");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "TEACHER") {
      setEmail("alex.thomas@edulearn.io");
    } else if (role === "STUDENT") {
      setEmail("rahul.menon@student.io");
    } else {
      setEmail("admin@edulearn.io");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    switchRole(selectedRole);

    setTimeout(() => {
      if (selectedRole === "TEACHER") {
        router.push("/teacher/dashboard");
      } else if (selectedRole === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#fbfbfd]">
      {/* Left Showcase Banner */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            1:1
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">OneToOne LMS</span>
            <p className="text-xs text-slate-400">Dedicated 1-on-1 Teaching Platform</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> High-Fidelity 1-on-1 Workspace
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Teaching tailored for one mind at a time.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time infinite whiteboards, individual student workspaces, frictionless homework marking, and automated post-session performance analytics.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <p className="text-xl font-extrabold text-indigo-400">1-to-1</p>
              <p className="text-xs text-slate-400">Interactive live rooms</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
              <p className="text-xl font-extrabold text-emerald-400">Auto</p>
              <p className="text-xs text-slate-400">Session reports & timing</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 OneToOne Technologies. All rights reserved.
        </div>
      </div>

      {/* Right Login Card & Demo Quick Launch */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left">
            <div className="lg:hidden inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                1:1
              </div>
              <span className="font-extrabold text-slate-900 text-lg">OneToOne</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a demo role below to explore the corresponding personalized experience.
            </p>
          </div>

          {/* 3-Role Toggle Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleSelect("TEACHER")}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all",
                selectedRole === "TEACHER"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("STUDENT")}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all",
                selectedRole === "STUDENT"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("SUPERADMIN")}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all",
                selectedRole === "SUPERADMIN"
                  ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Superadmin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Entering Workspace...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset User Details Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Active Persona:{" "}
              {selectedRole === "TEACHER"
                ? "Alex Thomas (Math & Physics)"
                : selectedRole === "STUDENT"
                ? "Rahul Menon (Grade 11)"
                : "Platform Super Administrator"}
            </p>
            <p className="text-[11px] text-slate-500">
              Mock authentication is enabled. Click <strong>Sign In</strong> to explore the full interactive portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
