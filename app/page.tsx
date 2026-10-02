"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Briefcase,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<"STUDENT" | "TEACHER">("STUDENT");

  // Mini Sandbox State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#0f2a4a");
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

    // Draw subtle grid dots
    for (let x = 20; x < canvas.offsetWidth; x += 28) {
      for (let y = 20; y < canvas.offsetHeight; y += 28) {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw sample math formula
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "#0f2a4a";
    ctx.fillText("f(x) = 2x² + 4x + 1", 24, 40);

    ctx.font = "13px system-ui, sans-serif";
    ctx.fillStyle = "#15803d";
    ctx.fillText("✓ Vertex: (-1, -1)   •   Roots: Real & Distinct", 24, 68);

    // Draw curve
    ctx.strokeStyle = "#43c4d1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, 140);
    ctx.quadraticCurveTo(80, 210, 180, 90);
    ctx.stroke();

    // Draw prompt
    ctx.fillStyle = "#64748b";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("✏️ Test live pen annotations directly in your browser", 24, canvas.offsetHeight - 20);
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
    ctx.lineWidth = isEraser ? 22 : brushSize;
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

    for (let x = 20; x < canvas.offsetWidth; x += 28) {
      for (let y = 20; y < canvas.offsetHeight; y += 28) {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30] font-sans selection:bg-[#43c4d1] selection:text-[#0a2640] relative overflow-x-hidden">
      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group select-none" aria-label="Sofia LMS Home">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bec9] mb-1 inline-block shrink-0" />
            <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0f2a4a] lowercase font-sans">
              sofia
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1.5 pl-1.5 border-l border-slate-200 hidden sm:inline">
              1:1 Learning OS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#overview" className="hover:text-[#0f2a4a] transition-colors">
              Platform Overview
            </a>
            <a href="#workspaces" className="hover:text-[#0f2a4a] transition-colors">
              Role Workspaces
            </a>
            <a href="#canvas-demo" className="hover:text-[#0f2a4a] transition-colors">
              Live Whiteboard
            </a>
            <a href="#features" className="hover:text-[#0f2a4a] transition-colors">
              Curriculum & Tools
            </a>
          </nav>

          {/* Top Right Actions */}
          <div className="flex items-center gap-3" id="login-dropdown-container">
            {/* Quick Demo Launch Buttons */}
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-200">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#0a2640] hover:bg-[#43c4d1]/20 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#00838f]" />
                <span>Student</span>
              </Link>
              <Link
                href="/teacher/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Teacher</span>
              </Link>
            </div>

            {/* Dropdown Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2a4a] hover:bg-[#163a63] text-white text-xs font-bold shadow-xs transition-all"
                aria-expanded={loginMenuOpen}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Access Workspaces</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", loginMenuOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {loginMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Workspace
                    </p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      Direct single-click portal launch
                    </p>
                  </div>

                  <Link
                    href="/student/dashboard"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#e0f7fa]/60 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#e0f7fa] text-[#00838f] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#00838f]">
                          Sofia Student Portal
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#43c4d1]/20 text-[#0a2640] rounded">
                          Learner
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Courses, opportunities, live classroom & canvas
                      </p>
                    </div>
                  </Link>

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
                          Teacher Studio
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                          Educator
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Deliver 1:1 lessons, create tasks & visual grading
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
                      <span>Administrator Management Console</span>
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
      <section id="overview" className="relative pt-12 pb-20 lg:pt-18 lg:pb-28 overflow-hidden bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                <span className="text-xs font-bold text-[#15803d]">
                  Standardized 1:1 Live Teaching & Progress System
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0c1e33] leading-[1.12]">
                Personalized Learning. <br />
                <span className="text-[#00838f]">
                  Professional Outcomes.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect educators and learners in focused 1-on-1 live classrooms. Combine interactive whiteboard problem-solving, structured curriculum tracks, automated homework assessment, and career opportunities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#43c4d1] hover:brightness-95 text-[#0a2640] text-sm font-bold shadow-xs transition-all active:scale-95"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Launch Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/teacher/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0f2a4a] hover:bg-[#163a63] text-white text-sm font-bold shadow-xs transition-all active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Teacher Studio</span>
                </Link>

                <a
                  href="#canvas-demo"
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#00838f]" />
                  <span>Try Live Canvas</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="text-amber-500 font-bold">★★★★★</span>
                  <span>4.9/5 Educator Rating</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                  <span>Real-Time Sync</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Zap className="w-4 h-4 text-[#00838f]" />
                  <span>Automated Reports</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xl space-y-5">
                {/* Sofia Mock Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38bec9]" />
                    <span className="font-extrabold text-sm text-[#0f2a4a]">sofia</span>
                    <span className="text-[11px] font-semibold text-[#15803d] ml-2">
                      Pick up where you left off
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                    RP
                  </div>
                </div>

                {/* Hero Inside Card: Map AI Agent Value */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#15803d]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Continue learning</span>
                  </div>
                  <h4 className="text-base font-bold text-[#0c1e33]">
                    Map AI agent value and risk in GraphSpace
                  </h4>
                  <p className="text-xs text-slate-500">AI Agents for Managers • 20 min</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Course Progress: 28%</span>
                    <span className="px-3 py-1 rounded-md bg-[#15803d] text-white font-bold text-[11px]">
                      Resume activity →
                    </span>
                  </div>
                </div>

                {/* Two Course Mini-Cards */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Multivariable Modelling
                    </p>
                    <p className="text-[10px] text-slate-500">Math Skill Path</p>
                    <div className="w-full h-1 bg-slate-100 rounded-full">
                      <div className="h-full bg-[#43c4d1] w-0" />
                    </div>
                    <span className="block text-center py-1 text-[10px] font-bold bg-[#43c4d1] text-[#0a2640] rounded">
                      Start course
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Retail Analytics Role
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Eligible Opportunity</p>
                    <p className="text-[10px] text-slate-500">Partner Project</p>
                    <span className="block text-center py-1 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                      View details →
                    </span>
                  </div>
                </div>

                {/* Bottom Floating Live Status Pill */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">
                      Live 1:1 Room Active
                    </span>
                  </div>
                  <Link
                    href="/student/sessions"
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Enter Room →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIBBON BAR */}
      <section className="bg-[#0f2a4a] text-white py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm font-semibold tracking-wide">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#43c4d1]" />
            <span>1-to-1 HD Live Classes</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#43c4d1]" />
            <span>Interactive Whiteboard Canvas</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#43c4d1]" />
            <span>Structured Courses & Skills</span>
          </div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#43c4d1]" />
            <span>Integrated Opportunities</span>
          </div>
        </div>
      </section>

      {/* DUAL WORKSPACE SHOWCASE: STUDENT VS TEACHER */}
      <section id="workspaces" className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00838f] bg-[#e0f7fa] px-3 py-1 rounded-full">
              Standardized Role Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
              Two Tailored Portals. Zero Friction.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience the student progress dashboard alongside the educator's lesson delivery and grading studio.
            </p>

            {/* Switcher Buttons */}
            <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-200/80 border border-slate-300/80 mt-4">
              <button
                type="button"
                onClick={() => setActiveScreenTab("STUDENT")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all",
                  activeScreenTab === "STUDENT"
                    ? "bg-[#43c4d1] text-[#0a2640] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Sofia Student Portal</span>
              </button>
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
                <span>Educator Studio</span>
              </button>
            </div>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              {activeScreenTab === "STUDENT" ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#e0f7fa] text-[#00838f] text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Sofia Student Experience</span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#0c1e33] leading-tight">
                    Learn intuitively, master curriculum, and connect to opportunities.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Overview & Next Activity:</strong> Resume course activities, see required milestones, and pick up right where you left off.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Interactive Whiteboard Workspace:</strong> Solve math, physics, and coding exercises on canvas with real-time feedback.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Community Opportunities:</strong> Browse eligible partner internships and projects, and apply directly with your verified student profile.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href="/student/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#43c4d1] hover:brightness-95 text-[#0a2640] text-xs font-bold shadow-xs transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Student Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/student/courses"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00838f] hover:underline"
                    >
                      <span>Explore Courses</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Educator Control Studio</span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    Teach with clarity, assign with ease, and review effortlessly.
                  </h3>

                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Dynamic Assignment Builder:</strong> Create questions that automatically render as cards on the student's personal canvas.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>
                        <strong>Live Session Controls:</strong> Launch real-time 1:1 sessions, broadcast concepts, and generate structured session reports.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
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
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0f2a4a] hover:bg-[#163a63] text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Open Teacher Studio</span>
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
              )}
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Interactive Preview</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sandbox
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-[#0c1e33]">
                      {activeScreenTab === "STUDENT"
                        ? "Sofia Student Hub: Courses & Progress"
                        : "Teacher Studio: 1:1 Session Manager"}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {activeScreenTab === "STUDENT" ? "4 Active Modules" : "6 Active Students"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {activeScreenTab === "STUDENT"
                      ? "Seamless navigation across Overview, Courses, Opportunities, and Applications."
                      : "Complete control over live tutoring rooms, question assignments, and automated parent reports."}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">
                      Ready to experience?
                    </span>
                    <Link
                      href={activeScreenTab === "STUDENT" ? "/student/dashboard" : "/teacher/dashboard"}
                      className="px-3.5 py-1.5 rounded-lg bg-[#43c4d1] text-[#0a2640] text-xs font-bold hover:brightness-95 transition-all"
                    >
                      Enter {activeScreenTab === "STUDENT" ? "Student Portal" : "Teacher Studio"} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00838f] bg-[#e0f7fa] px-3 py-1 rounded-full">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1e33] tracking-tight">
            Comprehensive Suite For 1:1 Education
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Engineered for high-retention personalized tutoring, digital problem-solving, and continuous academic growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#e0f7fa] text-[#00838f] flex items-center justify-center mb-6 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00838f]">
              Interactive Canvas
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              Infinite Whiteboards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Draw geometry, write math formulas, drop sticky notes, and solve complex problems seamlessly with responsive digital ink.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#0f2a4a] text-white flex items-center justify-center mb-6 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Assigned Curriculum
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              Modular Courses & Paths
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track multi-activity course tracks, self-paced progress, and pick up where you left off with instant resume actions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-xs">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Live Classroom
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              1-to-1 Video & Audio
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated real-time WebRTC video and synchronized whiteboard sessions tailored for uninterrupted focused tutoring.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Feedback Loop
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              Instant Visual Grading
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide question-by-question scoring, personalized teacher comments, and milestone achievement tracking.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Career Pipeline
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              Community Opportunities
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect eligible learners with verified projects and internships directly through their Sofia educational profile.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-[#43c4d1] shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Analytics & Reports
            </span>
            <h3 className="text-xl font-bold text-[#0c1e33] mt-1 mb-3">
              Structured Session Reports
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automate parent updates with topics covered, attendance rate, ratings, and timetable continuity after each session.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE WHITEBOARD SANDBOX */}
      <section id="canvas-demo" className="py-20 bg-[#0f2a4a] text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#43c4d1] bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Interactive Canvas Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Try the Digital Ink. <br />
                <span className="text-[#43c4d1]">Simple and responsive.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Test drawing in your browser. In the full Sofia workspace, both student and teacher collaborate simultaneously on an infinite canvas with math tools, formula highlighters, and sticky notes.
              </p>

              {/* Sandbox Controls */}
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Toolbox</span>
                  <button
                    onClick={clearSandbox}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear canvas</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Colors */}
                  {["#0f2a4a", "#2563eb", "#15803d", "#ef4444"].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setPenColor(c);
                        setIsEraser(false);
                      }}
                      className={cn(
                        "w-7 h-7 rounded-full transition-transform",
                        penColor === c && !isEraser ? "scale-110 ring-2 ring-[#43c4d1]" : "opacity-80"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  {/* Eraser */}
                  <button
                    onClick={() => setIsEraser(true)}
                    className={cn(
                      "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors",
                      isEraser ? "bg-[#43c4d1] text-[#0a2640]" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/student/whiteboards"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#43c4d1] text-[#0a2640] font-bold text-xs hover:brightness-95 transition-all"
                >
                  <span>Open Full Whiteboard Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Canvas */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-3 shadow-2xl border border-slate-700 relative">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-[360px] bg-white rounded-2xl cursor-crosshair touch-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bec9]" />
            <span className="font-extrabold text-sm text-[#0f2a4a]">sofia</span>
            <span>• Next-Gen 1:1 Live Teaching Platform</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/student/dashboard" className="hover:text-slate-900">
              Student Portal
            </Link>
            <Link href="/teacher/dashboard" className="hover:text-slate-900">
              Teacher Studio
            </Link>
            <Link href="/manage" className="hover:text-slate-900">
              Admin Console
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Sign In
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Sofia Education Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
