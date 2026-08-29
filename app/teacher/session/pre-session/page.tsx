"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PreSessionCheckPage() {
  const router = useRouter();
  const { students, startLiveSession } = useLMS();

  const [selectedStudentId, setSelectedStudentId] = useState("s1");
  const [isMicWorking, setIsMicWorking] = useState(true);
  const [isCameraWorking, setIsCameraWorking] = useState(true);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleTestSpeaker = () => {
    setIsTestingSpeaker(true);
    setTimeout(() => setIsTestingSpeaker(false), 2000);
  };

  const handleJoin = () => {
    const sessId = `sess-${Date.now()}`;
    startLiveSession(sessId);
    router.push(`/teacher/session/${sessId}`);
  };

  return (
    <AppShell
      headerTitle="1-to-1 Pre-Session Readiness Check"
      headerSubtitle="Verify audio, video, and learner details before entering the live teaching room"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Device Check Preview */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Hardware & Audio Check
            </h3>

            {/* Video Preview Box */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              {isCameraWorking ? (
                <div className="w-full h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                    alt="Teacher Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[11px] text-white">
                    HD Camera Ready (1080p)
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <VideoOff className="w-8 h-8" />
                  <span>Camera Disabled</span>
                </div>
              )}
            </div>

            {/* Device Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  Microphone Input
                </span>
                <button
                  onClick={() => setIsMicWorking(!isMicWorking)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                    isMicWorking ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  )}
                >
                  {isMicWorking ? "Connected" : "Muted"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  Webcam Stream
                </span>
                <button
                  onClick={() => setIsCameraWorking(!isCameraWorking)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                    isCameraWorking ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-700"
                  )}
                >
                  {isCameraWorking ? "Active" : "Off"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  Speaker Audio Output
                </span>
                <button
                  onClick={handleTestSpeaker}
                  className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                >
                  {isTestingSpeaker ? "Testing Chime..." : "Test Sound"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Selected Learner & Scheduled Session */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Learner & Lesson Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select 1-to-1 Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade} — {st.subjects.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Summary Card */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-500">{student.grade} • Progress: {student.overallProgress}%</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-indigo-200/40 text-[11px] text-slate-600">
                  Previous Topic: <strong>Calculus & Derivatives (27 Aug)</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Scheduled Time:</span>
                  <strong className="text-slate-900">Today, 04:00 PM (60 mins)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Whiteboard Sync:</span>
                  <strong className="text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> High-Performance Canvas
                  </strong>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/teacher/dashboard")}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleJoin}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Enter Live Classroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
