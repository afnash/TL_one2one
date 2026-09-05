"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";

export default function ManageLogin() {
  const router = useRouter();
  const { switchRole } = useLMS();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <form
        className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-md space-y-5 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(e.currentTarget);
          try {
            const r = await fetch("/api/manage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(form)),
            });
            const result = await r.json();
            if (!r.ok) throw new Error(result.error);
            switchRole("SUPERADMIN");
            router.push("/admin/dashboard");
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Login failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Link href="/" className="inline-block mb-1">
          <Image
            src="/icon.jpg"
            alt="OneToOne Logo"
            width={130}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Administrator Console</h1>
        <label className="block text-xs font-bold text-slate-700">
          Username
          <input
            name="username"
            required
            autoComplete="username"
            className="mt-1 block border border-slate-200 rounded-xl p-3 w-full text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 block border border-slate-200 rounded-xl p-3 w-full text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </label>
        {error && <p role="alert" className="text-rose-600 text-xs font-semibold">{error}</p>}
        <button
          disabled={busy}
          className="rounded-xl p-3 bg-blue-600 hover:bg-blue-700 text-white w-full text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in as Administrator"}
        </button>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600">
            ← Back to Home
          </Link>
          <Link href="/login" className="hover:text-blue-600 font-medium">
            Student / Teacher Access
          </Link>
        </div>
      </form>
    </main>
  );
}
