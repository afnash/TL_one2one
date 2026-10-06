"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLMS } from "@/lib/store";
import {
  KeyRound,
  ShieldCheck,
  Search,
  Users,
  Building2,
  GraduationCap,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  RefreshCw,
  X,
  Lock,
  Sparkles,
  Shield,
  UserCheck
} from "lucide-react";
import { UserRole } from "@/types";

export default function AdminCredentialsPage() {
  const { directory, role, updateCredentials } = useLMS();

  const [roleFilter, setRoleFilter] = useState<"ALL" | "MANAGER" | "TEACHER" | "STUDENT" | "SUPERADMIN">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    role: UserRole;
    name: string;
    email: string;
    password?: string;
  } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compile full user accounts list
  const allAccounts = [
    {
      id: "admin-1",
      name: "Super Administrator",
      email: "admin@onetoone.com",
      password: "admin",
      role: "SUPERADMIN" as UserRole,
      status: "active",
      avatar: "/icon.jpg",
    },
    ...(directory.managers || []).map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      password: m.password || "password123",
      role: "MANAGER" as UserRole,
      status: m.status || "active",
      avatar: m.avatar || "/icon.jpg",
      location: m.location,
    })),
    ...(directory.teachers || []).map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      password: t.password || "password123",
      role: "TEACHER" as UserRole,
      status: t.status || "active",
      avatar: t.avatar || "/icon.jpg",
      managerName: t.managerName,
    })),
    ...(directory.students || []).map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      password: s.password || "password123",
      role: "STUDENT" as UserRole,
      status: s.status || "active",
      avatar: s.avatar || "/icon.jpg",
      teacherName: s.teacherName,
    })),
  ];

  const filteredAccounts = allAccounts.filter((acc) => {
    const matchesRole = roleFilter === "ALL" || acc.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      acc.name.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.role.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const openEditModal = (acc: typeof allAccounts[0]) => {
    setSelectedUser(acc);
    setNewEmail(acc.email);
    setNewPassword(acc.password);
    setSaveSuccess(false);
    setEditModalOpen(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newEmail.trim()) return;

    if (selectedUser.role !== "SUPERADMIN") {
      updateCredentials(selectedUser.role, selectedUser.id, newEmail.trim(), newPassword.trim());
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setEditModalOpen(false);
      setSaveSuccess(false);
      setSelectedUser(null);
    }, 1000);
  };

  if (role !== "SUPERADMIN") {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
          <p className="text-sm text-slate-500">
            Only Super Administrators are authorized to view and modify system credentials.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Security Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User Credentials Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set, edit, and oversee login emails and passwords for managers, teachers, and students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>{allAccounts.length} Total Registered Logins</span>
            </span>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Super Admins</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">1</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Root console</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Managers</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{directory.managers?.length || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Branch leadership</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Teachers</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{directory.teachers?.length || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Educators</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Students</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{directory.students?.length || 0}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Active learners</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { key: "ALL", label: "All Accounts" },
                { key: "SUPERADMIN", label: "Admin" },
                { key: "MANAGER", label: "Managers" },
                { key: "TEACHER", label: "Teachers" },
                { key: "STUDENT", label: "Students" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or login email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>

        {/* Credentials Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">User Account</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Login Email</th>
                  <th className="px-5 py-3.5">Login Password</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAccounts.map((acc) => {
                  const isRevealed = !!revealedIds[acc.id];
                  const isCopied = copiedId === acc.id;

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{acc.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{acc.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {acc.role === "SUPERADMIN" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Shield className="w-3 h-3 text-amber-600" />
                            Super Admin
                          </span>
                        )}
                        {acc.role === "MANAGER" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Building2 className="w-3 h-3 text-purple-600" />
                            Manager
                          </span>
                        )}
                        {acc.role === "TEACHER" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <GraduationCap className="w-3 h-3 text-blue-600" />
                            Teacher
                          </span>
                        )}
                        {acc.role === "STUDENT" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Users className="w-3 h-3 text-emerald-600" />
                            Student
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{acc.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acc.email, `email-${acc.id}`)}
                            title="Copy email"
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            {copiedId === `email-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-mono bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-800 text-xs font-semibold">
                            {isRevealed ? acc.password : "••••••••••••"}
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            title={isRevealed ? "Hide password" : "Show password"}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acc.password, acc.id)}
                            title="Copy password"
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            acc.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : acc.status === "away"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {acc.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(acc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Credentials</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Credentials Modal */}
        {editModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Edit User Credentials</h3>
                    <p className="text-[11px] text-slate-500">{selectedUser.name} ({selectedUser.role})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Login Password
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate Strong
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="Set password"
                  />
                </div>

                {saveSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Credentials updated successfully!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
