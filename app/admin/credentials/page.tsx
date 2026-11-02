"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Copy, KeyRound, Pencil, RefreshCw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { initials, PageHeader } from "@/components/dashboard/parts";
import { useLMS } from "@/lib/store";
import { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "MANAGER" | "TEACHER" | "STUDENT";
const ROLE_LABEL: Record<string, string> = { SUPERADMIN: "Admin", MANAGER: "Manager", TEACHER: "Teacher", STUDENT: "Student" };

export default function AdminCredentialsPage() {
  const { directory, role, updateCredentials } = useLMS();

  const [roleFilter, setRoleFilter] = useState<Filter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; role: UserRole; name: string; email: string } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const allAccounts = [
    ...(directory.managers || []).map((m) => ({ id: m.id, name: m.name, email: m.email, hasPassword: Boolean(m.hasPassword), role: "MANAGER" as UserRole, status: m.status || "active" })),
    ...(directory.teachers || []).map((t) => ({ id: t.id, name: t.name, email: t.email, hasPassword: Boolean(t.hasPassword), role: "TEACHER" as UserRole, status: t.status || "active" })),
    ...(directory.students || []).map((s) => ({ id: s.id, name: s.name, email: s.email, hasPassword: Boolean(s.hasPassword), role: "STUDENT" as UserRole, status: s.status || "active" })),
  ];

  const filtered = allAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    return (
      (roleFilter === "ALL" || acc.role === roleFilter) &&
      (acc.name.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q))
    );
  });

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    const bytes = crypto.getRandomValues(new Uint32Array(14));
    setNewPassword(Array.from(bytes, (v) => chars.charAt(v % chars.length)).join(""));
  };

  const openEdit = (acc: (typeof allAccounts)[number]) => {
    setSelectedUser(acc);
    setNewEmail(acc.email);
    setNewPassword("");
    setFormError("");
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newEmail.trim()) return;
    if (newPassword && newPassword.length < 8) return setFormError("Passwords must be at least 8 characters.");
    setSaving(true);
    setFormError("");
    try {
      await updateCredentials(selectedUser.role, selectedUser.id, newEmail.trim(), newPassword);
      setEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Credentials could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (role !== "SUPERADMIN") {
    return (
      <AppShell headerTitle="Credentials">
        <div className="mx-auto max-w-md py-16 text-center">
          <h2 className="text-lg font-semibold">Restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground">Only administrators can view and change sign-in details.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerTitle="Credentials">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
        <PageHeader
          title="Credentials"
          description={`${allAccounts.filter((a) => a.hasPassword && a.status === "active").length} of ${allAccounts.length} accounts can sign in. Set or reset emails and passwords here.`}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup
            type="single"
            variant="outline"
            value={roleFilter}
            onValueChange={(v) => setRoleFilter((v || "ALL") as Filter)}
            className="flex-wrap justify-start"
          >
            <ToggleGroupItem value="ALL">All</ToggleGroupItem>
            <ToggleGroupItem value="MANAGER">Managers</ToggleGroupItem>
            <ToggleGroupItem value="TEACHER">Teachers</ToggleGroupItem>
            <ToggleGroupItem value="STUDENT">Students</ToggleGroupItem>
          </ToggleGroup>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search accounts"
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="w-20 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">{initials(acc.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{acc.name}</p>
                        <button
                          type="button"
                          onClick={() => copy(acc.email, acc.id)}
                          className="group flex max-w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          aria-label={`Copy ${acc.email}`}
                        >
                          <span className="truncate">{acc.email}</span>
                          {copiedId === acc.id ? <Check className="size-3 shrink-0 text-emerald-600" /> : <Copy className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{ROLE_LABEL[acc.role]}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-sm">
                      <span className={cn("size-2 rounded-full", acc.hasPassword ? "bg-emerald-500" : "bg-amber-400")} />
                      {acc.hasPassword ? "Set" : "Not set"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label={`Edit credentials for ${acc.name}`} onClick={() => openEdit(acc)}>
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No matching accounts.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          Accounts with no password cannot sign in. The administrator login is set in the server environment, not here.
        </p>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign-in details</DialogTitle>
              <DialogDescription>
                {selectedUser?.name} ({selectedUser ? ROLE_LABEL[selectedUser.role] : ""}). Leave the password blank to keep it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={save} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cred-email">Email</FieldLabel>
                  <Input id="cred-email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="cred-pass">New password</FieldLabel>
                    <Button type="button" variant="link" size="xs" onClick={generatePassword}>
                      <RefreshCw data-icon="inline-start" />
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="cred-pass"
                    type="text"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="font-mono"
                    placeholder="Unchanged"
                  />
                </Field>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner data-icon="inline-start" /> : <KeyRound data-icon="inline-start" />}
                  {saving ? "Saving" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
