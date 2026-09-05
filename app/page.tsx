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
  Zap,
  Pencil,
  Eraser,
  FolderOpen,
  TrendingUp,
  ChevronDown,
  UserCheck,
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<"TEACHER" | "STUDENT">("TEACHER");

  // Mini Sandbox State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#2563eb");
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
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw sample math formula
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillStyle = "#1e3a8a";
    ctx.fillText("f(x) = 2x² + 4x + 1", 30, 45);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText("✓ Vertex: (-1, -1)", 30, 75);

    // Draw curve
    ctx.strokeStyle = "#2563eb";
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
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo with icon.jpg */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="OneToOne LMS home">
            <Image
              src="/icon.jpg"
              alt="OneToOne Logo"
              width={130}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Platform Features
            </a>
            <a href="#workspaces" className="hover:text-blue-600 transition-colors">
              Teacher & Student Screens
            </a>
            <a href="#whiteboard-demo" className="hover:text-blue-600 transition-colors">
              Interactive Canvas
            </a>
            <a href="#why-us" className="hover:text-blue-600 transition-colors">
              Why OneToOne
            </a>
          </nav>

          {/* Top Right: Login Button with Dropdown + Role Screen Direct Launch */}
          <div className="flex items-center gap-3" id="login-dropdown-container">
            {/* Quick Demo Access Buttons */}
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Student</span>
              </Link>
              <Link
                href="/teacher/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Teacher</span>
              </Link>
            </div>

            {/* Main Login Icon & Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                aria-expanded={loginMenuOpen}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Workspaces</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", loginMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu Showing Teacher / Student Screens */}
              {loginMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5">
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
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          Teacher Workspace
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-md">
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
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          Student Portal
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded-md">
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
                      className="flex items-center justify-between p-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
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
                      className="flex items-center justify-between p-2 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Solid Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-blue-800">
                  1:1 Live Learning & Interactive Whiteboard Platform
                </span>
              </div>

              {/* Hero Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Personalized Learning. <br />
                <span className="text-blue-600">
                  Real-Time Collaboration.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect teachers and students in real-time. Combine 1-to-1 live video, interactive digital whiteboards, streamlined homework distribution, and instant feedback in one clean workspace.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Launch Teacher Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Open Student Portal</span>
                </Link>

                <a
                  href="#whiteboard-demo"
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Try Live Canvas</span>
                </a>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="text-amber-500 font-bold">★★★★★</span>
                  <span>4.9/5 Rating</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Sync</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Instant Assignment Grading</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with Solid Cards */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none p-3 bg-slate-100 rounded-3xl border border-slate-200 shadow-md">
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-xs">
                  <Image
                    src="/images/lms-hero.jpg"
                    alt="LMS Platform with interactive whiteboard and homework tools"
                    width={1000}
                    height={1000}
                    priority
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Floating Badge 1: Live Class Active */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Live 1:1 Session</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[10px] text-slate-500">Mathematics & Science • Active</p>
                  </div>
                </div>

                {/* Floating Badge 2: Assignment Solved */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Assignment Solved</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md">
                        10/10 Marks
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Reviewed with feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT BANNER RIBBON */}
      <section className="bg-slate-900 text-white py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm font-semibold tracking-wide">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-400" />
            <span>1-to-1 HD Live Classes</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Interactive Whiteboard</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Smart Assignments & Homework</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Automated Progress Reports</span>
          </div>
        </div>
      </section>

      {/* DUAL WORKSPACE SHOWCASE: TEACHER VS STUDENT SCREENS */}
      <section id="workspaces" className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Interactive Role Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Two Dedicated Workspaces. One Seamless Platform.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore how OneToOne powers both the teacher's lesson control and the student's problem-solving space.
            </p>

            {/* Switcher Tab Buttons */}
            <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-200 border border-slate-300 mt-4">
              <button
                type="button"
                onClick={() => setActiveScreenTab("TEACHER")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all",
                  activeScreenTab === "TEACHER"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>Teacher Workspace Screen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScreenTab("STUDENT")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all",
                  activeScreenTab === "STUDENT"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Portal Screen</span>
              </button>
            </div>
          </div>

          {/* Screen Showcase Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {/* Left Feature Summary for Active Role */}
            <div className="lg:col-span-5 space-y-6">
              {activeScreenTab === "TEACHER" ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Teacher Control Studio</span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    Teach with clarity, assign with ease, and review effortlessly.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Dynamic Assignment Builder:</strong> Create questions that automatically render as cards on the student's personal canvas.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Live Session Controls:</strong> Launch real-time 1:1 sessions, broadcast concepts, and generate structured session reports.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Visual Whiteboard Grading:</strong> Annotate directly on student working with question marks breakdown and feedback.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/teacher/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Teacher Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/teacher/assignments/new"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>Create Assignment</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Interactive Portal</span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    Solve on canvas, master concepts, and track your progress.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Personal Whiteboard Canvas:</strong> Solve homework exercises with pen, shapes, and eraser tools directly on the board.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>One-Click Submission:</strong> Submit work directly to your teacher when ready with celebration confetti and instant status tracking.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Resource Vault & History:</strong> Revisit past whiteboard sessions, download study materials, and review teacher notes anytime.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/student/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Student Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/student/assignments"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600"
                    >
                      <span>View My Assignments</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Image Preview */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                <Image
                  src="/images/lms-showcase.jpg"
                  alt="Student and Teacher LMS Experience"
                  width={900}
                  height={900}
                  className="w-full h-auto object-cover"
                />

                {/* Bottom Bar with Logo */}
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/icon.jpg"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="h-7 w-auto object-contain"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {activeScreenTab === "TEACHER" ? "Teacher Lesson & Grading Canvas" : "Student Solution & Whiteboard Workspace"}
                      </p>
                      <p className="text-[11px] text-slate-500">Live synchronized collaboration</p>
                    </div>
                  </div>
                  <Link
                    href={activeScreenTab === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors"
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
      <section id="features" className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Comprehensive Tools For 1:1 Education
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Engineered for focused personal tutoring, interactive problem-solving, and continuous learning progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Interactive Canvas
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Infinite Whiteboards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Draw geometry, write math formulas, drop sticky notes, and solve complex problems seamlessly with responsive digital ink.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Assignments & Homework
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Smart Task Builder
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Easily compose problem sets, assign them to individual students or broadcast to the entire class, and grade on canvas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mb-6 shadow-xs">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Live Classroom
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              1-to-1 Video & Audio
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated real-time video and synchronized whiteboard sessions tailored for uninterrupted focused tutoring.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Feedback Loop
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Instant Visual Grading
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide question-by-question scoring, personalized teacher comments, and milestone achievement tracking.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-6 shadow-xs">
              <FolderOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Resource Hub
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Curated Study Vault
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keep lesson materials, past whiteboard notes, and reference guides organized in each student's repository.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Analytics & Reports
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">
              Session Summaries
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track attendance, lesson topics, duration, and homework completion with post-session reports.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE WHITEBOARD SANDBOX TEASER */}
      <section id="whiteboard-demo" className="py-20 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Interactive Canvas Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Try the Digital Ink. <br />
                <span className="text-blue-400">Simple and responsive.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Test drawing in your browser. In the full OneToOne workspace, both student and teacher collaborate simultaneously on an infinite canvas with math tools, formula highlighters, and sticky notes.
              </p>

              {/* Sandbox Controls */}
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
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
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      !isEraser ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Pen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEraser(true)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      isEraser ? "bg-slate-600 text-white" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                    {["#2563eb", "#0f172a", "#059669", "#d97706", "#dc2626"].map((c) => (
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
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Full Canvas Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mini Canvas */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-700">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-slate-800 font-bold">Interactive Canvas Sandbox</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold">Ready</span>
                </div>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-80 sm:h-96 rounded-xl cursor-crosshair touch-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="why-us" className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            User Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Trusted By Educators & Students
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            See how OneToOne creates structured, productive 1:1 learning environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-500 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Being able to set up math problems directly on the student's whiteboard before our class starts saves significant preparation time. The grading workflow is clean and straightforward."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                AJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Alex Johnson</p>
                <p className="text-[10px] text-slate-400">Senior Mathematics Tutor</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-500 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "I work through equations directly on the canvas and submit when done. Seeing teacher annotations and corrections right on my steps makes learning math much easier."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                AN
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Ananya Nair</p>
                <p className="text-[10px] text-slate-400">Student</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex text-amber-500 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Automatic session reports keep parents informed on topics covered and pending homework without requiring manual email updates after every single class."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                SP
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sarah Patel</p>
                <p className="text-[10px] text-slate-400">Science & Chemistry Tutor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLID BOTTOM CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-slate-900 text-white text-center space-y-6 shadow-xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-slate-800 text-blue-400 px-3.5 py-1.5 rounded-full">
            Get Started
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Start Teaching & Learning on OneToOne.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Jump directly into the teacher workspace or student portal to explore interactive assignments and collaborative whiteboards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Launch Teacher Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/student/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Launch Student Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER WITH LOGO */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.jpg"
              alt="OneToOne Logo"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-bold text-slate-600">
            <Link href="/teacher/dashboard" className="hover:text-blue-600 transition-colors">
              Teacher Workspace
            </Link>
            <Link href="/student/dashboard" className="hover:text-blue-600 transition-colors">
              Student Workspace
            </Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Role Switcher
            </Link>
            <Link href="/manage" className="hover:text-blue-600 transition-colors">
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
