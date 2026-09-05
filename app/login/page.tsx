"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { directory, login, loading, connectionError } = useLMS();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const people = (role === "TEACHER" ? directory.teachers : directory.students).filter(
    (p) => p.status === "active"
  );

  return (
    <main className="min-h-screen grid place-items-center bg-[#f8fafc] p-6">
      <form
        className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 w-full max-w-lg space-y-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await login(role, id);
            router.push(role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to continue");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Link href="/" className="inline-block mb-2">
          <Image
            src="/icon.jpg"
            alt="OneToOne Logo"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Learning Workspace</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your role and profile to continue. No password is required.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["STUDENT", "TEACHER"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => {
                setRole(r);
                setId("");
              }}
              className={
                "rounded-xl p-3.5 border font-bold text-xs sm:text-sm transition-all " +
                (r === role
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100")
              }
            >
              {r === "STUDENT" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-slate-700">
          Your Profile
          <select
            required
            className="mt-1.5 border border-slate-200 rounded-xl p-3 w-full text-xs sm:text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            <option value="">{loading ? "Loading profiles..." : "Select your name"}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.email}
              </option>
            ))}
          </select>
        </label>

        {!loading && !people.length && !connectionError && (
          <p className="text-slate-500 text-xs">
            No profiles yet. Ask an administrator to add you in Manage.
          </p>
        )}

        {(error || connectionError) && (
          <p role="alert" className="text-rose-600 text-xs font-semibold">
            {error || connectionError}
          </p>
        )}

        <button
          disabled={busy || loading || !id || !!connectionError}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-3 font-bold text-xs sm:text-sm disabled:opacity-50 shadow-xs transition-colors"
        >
          {busy ? "Opening workspace..." : "Continue to Workspace"}
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600">
            ← Back to Home
          </Link>
          <Link href="/manage" className="hover:text-blue-600 font-medium">
            Administrator Access
          </Link>
        </div>
      </form>
    </main>
  );
}
