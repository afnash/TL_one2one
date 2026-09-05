"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  LogIn,
  GraduationCap,
  Users,
  CheckCircle2,
  Award,
  Check,
  Star,
  Zap,
  Play,
  Pencil,
  Eraser,
  Palette,
  ShieldCheck,
  FolderOpen,
  TrendingUp,
  Clock,
  ChevronDown,
  UserCheck,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<"TEACHER" | "STUDENT">("TEACHER");

  // Mini Sandbox State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Close login dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#login-dropdown-container")) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize Canvas Demo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw initial demo formula
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    // Draw subtle grid dots
    for (let x = 20; x < canvas.offsetWidth; x += 30) {
      for (let y = 20; y < canvas.offsetHeight; y += 30) {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw sample math formula
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillStyle = "#4338ca";
    ctx.fillText("f(x) = 2x² + 4x + 1", 30, 45);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText("✓ Vertex: (-1, -1)", 30, 75);

    // Draw curve
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 150);
    ctx.quadraticCurveTo(80, 220, 160, 100);
    ctx.stroke();

    // Draw arrow
    ctx.fillStyle = "#64748b";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("✏️ Try drawing here with your mouse!", 30, canvas.offsetHeight - 25);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? "#ffffff" : penColor;
    ctx.lineWidth = isEraser ? 20 : brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSandbox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Redraw grid
    for (let x = 20; x < canvas.offsetWidth; x += 30) {
      for (let y = 20; y < canvas.offsetHeight; y += 30) {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background colorful ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/25 via-purple-300/20 to-pink-300/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-5 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-200/30 via-sky-200/20 to-indigo-200/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1400px] left-10 w-[550px] h-[550px] bg-gradient-to-tr from-amber-200/25 via-rose-200/15 to-purple-200/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Modern Glassmorphic Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="OneToOne LMS home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              1:1
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                one<span className="text-indigo-600 font-black">to</span>one
                <span className="text-pink-500 font-bold">.</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                1-to-1 Learning Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Platform Features
            </a>
            <a href="#workspaces" className="hover:text-indigo-600 transition-colors">
              Teacher & Student Screens
            </a>
            <a href="#whiteboard-demo" className="hover:text-indigo-600 transition-colors">
              Interactive Canvas
            </a>
            <a href="#why-us" className="hover:text-indigo-600 transition-colors">
              Why OneToOne
            </a>
          </nav>

          {/* Top Right: Login Button with Dropdown + Role Screen Direct Launch */}
          <div className="flex items-center gap-3" id="login-dropdown-container">
            {/* Quick Demo Access Buttons */}
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student</span>
              </Link>
              <Link
                href="/teacher/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50/80 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Teacher</span>
              </Link>
            </div>

            {/* Main Login Icon & Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all transform active:scale-95"
                aria-expanded={loginMenuOpen}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Workspaces</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", loginMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu Showing Teacher / Student Screens */}
              {loginMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Workspace / Screen
                    </p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      Direct access or switch profiles
                    </p>
                  </div>

                  <Link
                    href="/teacher/dashboard"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-indigo-50/80 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                          Teacher Workspace
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full">
                          Educator
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Create assignments, whiteboard lessons & grade work
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/student/dashboard"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-purple-50/80 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                          Student Portal
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full">
                          Learner
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Solve homework on canvas, join classes & track scores
                      </p>
                    </div>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <Link
                      href="/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        Choose Specific Profile
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/manage"
                      onClick={() => setLoginMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <span>Admin Management Console</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Vibrant Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span className="text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ Next-Gen 1:1 Live Learning & Infinite Whiteboard Platform
                </span>
              </div>

              {/* Hero Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
                Little Sparks. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Boundless Breakthroughs.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect passionate teachers and curious students in real-time. Combine 1-to-1 video, infinite interactive whiteboards, instant assignment feedback, and personalized lesson tracking in one unified workspace.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Users className="w-4 h-4" />
                  <span>Launch Teacher Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-200 shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>Explore Student Space</span>
                </Link>

                <a
                  href="#whiteboard-demo"
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white/80 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Try Live Canvas</span>
                </a>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold"
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="text-amber-500">★★★★★</span>
                  <span>4.9/5 Rating</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-Time Sync</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-600">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant Assignment Grading</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with Floating Glass Cards */}
            <div className="lg:col-span-6 relative">
              {/* Outer decorative glowing ring */}
              <div className="relative mx-auto max-w-md lg:max-w-none p-3 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-xl border border-white/80 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                  <Image
                    src="/images/lms-hero.jpg"
                    alt="Vibrant 3D LMS Platform with interactive whiteboard, video sessions and homework grading"
                    width={1000}
                    height={1000}
                    priority
                    className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                  />
                </div>

                {/* Floating Badge 1: Live Class Active */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 animate-bounce duration-1000">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">Live 1:1 Session</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-slate-500">Calculus & Vectors • Alex & Ananya</p>
                  </div>
                </div>

                {/* Floating Badge 2: Assignment Solved */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900">Assignment Solved</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                        10/10 Marks
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Reviewed with instant feedback</p>
                  </div>
                </div>

                {/* Floating Badge 3: Whiteboard Tool */}
                <div className="hidden sm:flex absolute top-1/2 -right-6 -translate-y-1/2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/80 items-center gap-2 text-xs font-bold text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Infinite Shared Canvas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT BANNER RIBBON */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm font-bold tracking-wide">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>1-to-1 HD Live Classes</span>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Infinite Interactive Whiteboard</span>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Smart Assignments & Homework</span>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Automated Progress Reports</span>
          </div>
        </div>
      </section>

      {/* DUAL WORKSPACE SHOWCASE: TEACHER VS STUDENT SCREENS */}
      <section id="workspaces" className="py-20 lg:py-28 bg-white border-y border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Role Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Two Dedicated Workspaces. One Harmonious Classroom.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience how OneToOne optimizes both the teacher's lesson control and the student's problem-solving journey.
            </p>

            {/* Switcher Tab Buttons */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-4">
              <button
                type="button"
                onClick={() => setActiveScreenTab("TEACHER")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  activeScreenTab === "TEACHER"
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-500/20"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Teacher Workspace Screen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScreenTab("STUDENT")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  activeScreenTab === "STUDENT"
                    ? "bg-white text-purple-700 shadow-sm ring-1 ring-purple-500/20"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Student Portal Screen</span>
              </button>
            </div>
          </div>

          {/* Screen Showcase Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {/* Left Feature Summary for Active Role */}
            <div className="lg:col-span-5 space-y-6">
              {activeScreenTab === "TEACHER" ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Teacher Control Studio</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    Teach with clarity, assign with ease, and review effortlessly.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Dynamic Assignment Builder:</strong> Formulate questions that automatically spawn as interactive cards on the student's whiteboard.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Live Session Controls:</strong> Launch real-time 1:1 sessions, broadcast concepts, and generate structured session reports in one click.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Visual Whiteboard Grading:</strong> Annotate directly on the student's submitted steps with score breakdown and feedback.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/teacher/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Teacher Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/teacher/assignments/new"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      <span>Create Assignment</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Interactive Portal</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    Solve on canvas, master concepts, and celebrate milestones.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Dedicated Workspace Canvas:</strong> Solve math and science exercises with digital pen, geometric shapes, and eraser tools.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>One-Click Submission:</strong> Submit work when ready with celebratory confetti animations and instant teacher notification.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Resource Vault & History:</strong> Revisit past whiteboard sessions, download study materials, and track star rewards.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/student/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Student Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/student/assignments"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900"
                    >
                      <span>View My Assignments</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive Image Preview */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <Image
                  src="/images/lms-showcase.jpg"
                  alt="Interactive Student and Teacher LMS Experience"
                  width={900}
                  height={900}
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                />

                {/* Role Switcher Floating Watermark */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/80 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      1:1
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {activeScreenTab === "TEACHER" ? "Teacher Lesson & Grading Canvas" : "Student Solution & Whiteboard Workspace"}
                      </p>
                      <p className="text-[11px] text-slate-500">Live synchronized collaboration</p>
                    </div>
                  </div>
                  <Link
                    href={activeScreenTab === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                  >
                    Enter Screen →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Everything You Need For High-Impact 1:1 Education
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Designed from the ground up for high-touch personal tutoring, interactive problem-solving, and continuous learning momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-100 hover:border-indigo-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
              Interactive Canvas
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Infinite Whiteboards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sketch geometry, write math formulas, drop sticky notes, and solve complex problems seamlessly with responsive digital ink.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-50/70 to-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
              Assignments & Homework
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Smart Task Builder
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Easily compose problem sets, assign them to individual students or broadcast to the class, and grade work on canvas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-50/70 to-white border border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center mb-6 shadow-md shadow-pink-600/20 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
              Live Classroom
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              1-to-1 Video & Audio
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crystal-clear integrated video and synchronized whiteboard sessions tailored for uninterrupted focused tutoring.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
              Feedback Loop
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Instant Visual Grading
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide question-by-question scoring, personalized teacher comments, and celebratory milestone rewards.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50/70 to-white border border-amber-100 hover:border-amber-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
              Resource Hub
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Curated Study Vault
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keep lesson materials, past whiteboard notes, and reference guides readily accessible in each student's personal vault.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-50/70 to-white border border-cyan-100 hover:border-cyan-300 shadow-xs hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-6 shadow-md shadow-cyan-600/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600">
              Analytics & Reports
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Automated Session Reports
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track attendance, duration, homework completion, and progress trajectories with post-session summaries.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE WHITEBOARD SANDBOX TEASER */}
      <section id="whiteboard-demo" className="py-20 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
                Interactive Canvas Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Try the Digital Ink. <br />
                <span className="text-indigo-400">Feel the smoothness.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test drawing right here in your browser. In the full OneToOne workspace, both student and teacher collaborate simultaneously on an infinite canvas with math tools, formula highlighters, and sticky notes.
              </p>

              {/* Sandbox Controls */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Tool Palette</span>
                  <button
                    type="button"
                    onClick={clearSandbox}
                    className="text-xs text-rose-400 hover:text-rose-300 underline"
                  >
                    Clear Canvas
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEraser(false)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      !isEraser ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEraser(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      isEraser ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                    {["#4338ca", "#ec4899", "#059669", "#d97706", "#2563eb"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setPenColor(c);
                          setIsEraser(false);
                        }}
                        style={{ backgroundColor: c }}
                        className={cn(
                          "w-5 h-5 rounded-full transition-transform",
                          penColor === c && !isEraser && "ring-2 ring-white scale-110"
                        )}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/student/whiteboards"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/30 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Full Infinite Canvas Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mini Canvas Interactive Element */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-3 shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-slate-800">Interactive Canvas Sandbox</span>
                  </div>
                  <span className="text-[11px] text-indigo-600">Live Active</span>
                </div>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-80 sm:h-96 rounded-2xl cursor-crosshair touch-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="why-us" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Loved By Learners & Educators
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Real Stories From 1:1 Classrooms
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            See how OneToOne transforms tutoring sessions into engaging, confidence-building breakthroughs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Being able to set up math problems directly on the student's whiteboard before our class starts saves me 20 minutes every session. The grading feedback loop is unbeatable."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                AJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Alex Johnson</p>
                <p className="text-[10px] text-slate-400">Senior Mathematics Tutor</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "I love drawing my steps directly on the board. Seeing my teacher's green checks and comments right on my equations made physics way less intimidating!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                AN
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Ananya Nair</p>
                <p className="text-[10px] text-slate-400">Grade 11 Student</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-4">
            <div className="flex text-amber-400 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The automatic session reports give parents instant visibility into what we worked on and what homework is due. It elevates my entire tutoring brand."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-xs">
                SP
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sarah Patel</p>
                <p className="text-[10px] text-slate-400">Science & Chemistry Educator</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIBRANT BOTTOM CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden shadow-2xl text-center space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />

          <span className="inline-block text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            🚀 Ready To Level Up Your 1:1 Learning?
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
            Start Teaching & Learning on OneToOne Today.
          </h2>

          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Jump directly into the teacher workspace or student portal to explore interactive assignments and collaborative whiteboards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 text-xs sm:text-sm font-black shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Launch Teacher Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-950/60 text-white border border-white/30 text-xs sm:text-sm font-bold backdrop-blur-md transition-all transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4 text-pink-300" />
              <span>Launch Student Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              1:1
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                one<span className="text-indigo-600">to</span>one
              </p>
              <p className="text-[11px] text-slate-400">Next-generation 1:1 learning platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-bold text-slate-600">
            <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">
              Teacher Workspace
            </Link>
            <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">
              Student Workspace
            </Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors">
              Role Switcher
            </Link>
            <Link href="/manage" className="hover:text-indigo-600 transition-colors">
              Admin Hub
            </Link>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} OneToOne LMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
