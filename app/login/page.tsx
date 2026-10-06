"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loading, connectionError, directory } = useLMS();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await loginWithCredentials(email, password);
      router.push(result.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please verify your credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError("");
  };

  const sampleManager = directory.managers?.[0];
  const sampleTeacher = directory.teachers?.[0];
  const sampleStudent = directory.students?.[0];

  return (
    <main className="min-h-screen grid place-items-center bg-[#f8fafc] p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-4">
        {/* Main Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-sm space-y-6"
        >
          {/* Logo & Header */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <Image
                src="/icon.jpg"
                alt="OneToOne Logo"
                width={130}
                height={44}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign in to your Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials. Your role automatically directs you to your portal.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 text-slate-900 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 text-slate-900 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {(error || connectionError) && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error || connectionError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy || loading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 font-bold text-xs sm:text-sm disabled:opacity-50 shadow-xs transition-all flex items-center justify-center gap-2 group"
          >
            {busy ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Bottom helper */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 font-medium transition-colors">
              ← Return to Home
            </Link>
            <button
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showQuickFill ? "Hide Demo Logins" : "Quick Demo Logins"}</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Panel */}
        {showQuickFill && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Click to Auto-fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@test.com", "admin123")}
                className="p-2.5 rounded-xl border border-amber-200/90 bg-amber-50/60 hover:bg-amber-100/80 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[10px] text-amber-700/80 mt-0.5 truncate font-mono">
                  admin@test.com
                </div>
              </button>

              {sampleManager ? (
                <button
                  type="button"
                  onClick={() => handleQuickFill(sampleManager.email, sampleManager.password || "password123")}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-purple-800">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Manager</span>
                  </div>
                  <div className="text-[10px] text-purple-700/80 mt-0.5 truncate font-mono">
                    {sampleManager.email}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickFill("manager@onetoone.com", "password123")}
                  className="p-2.5 rounded-xl border border-purple-200/90 bg-purple-50/60 hover:bg-purple-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-purple-800">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Manager</span>
                  </div>
                  <div className="text-[10px] text-purple-700/80 mt-0.5 truncate font-mono">
                    manager@onetoone.com
                  </div>
                </button>
              )}

              {sampleTeacher ? (
                <button
                  type="button"
                  onClick={() => handleQuickFill(sampleTeacher.email, sampleTeacher.password || "password123")}
                  className="p-2.5 rounded-xl border border-blue-200/90 bg-blue-50/60 hover:bg-blue-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Teacher</span>
                  </div>
                  <div className="text-[10px] text-blue-700/80 mt-0.5 truncate font-mono">
                    {sampleTeacher.email}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickFill("teacher@onetoone.com", "password123")}
                  className="p-2.5 rounded-xl border border-blue-200/90 bg-blue-50/60 hover:bg-blue-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Teacher</span>
                  </div>
                  <div className="text-[10px] text-blue-700/80 mt-0.5 truncate font-mono">
                    teacher@onetoone.com
                  </div>
                </button>
              )}

              {sampleStudent ? (
                <button
                  type="button"
                  onClick={() => handleQuickFill(sampleStudent.email, sampleStudent.password || "password123")}
                  className="p-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student</span>
                  </div>
                  <div className="text-[10px] text-emerald-700/80 mt-0.5 truncate font-mono">
                    {sampleStudent.email}
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleQuickFill("student@onetoone.com", "password123")}
                  className="p-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student</span>
                  </div>
                  <div className="text-[10px] text-emerald-700/80 mt-0.5 truncate font-mono">
                    student@onetoone.com
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
