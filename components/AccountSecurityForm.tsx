"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Own email/password changes go to /api/auth/credentials, which checks the current password.
export function AccountSecurityForm({ email: currentEmail }: { email: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailChanged = email.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
    if (!emailChanged && !newPassword) return setStatus({ ok: false, message: "Change your email or enter a new password." });
    if (newPassword && newPassword.length < 8) return setStatus({ ok: false, message: "Passwords must be at least 8 characters." });
    if (newPassword !== confirmPassword) return setStatus({ ok: false, message: "New passwords do not match." });
    setBusy(true);
    try {
      await apiRequest("/api/auth/credentials", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          ...(emailChanged ? { email: email.trim() } : {}),
          ...(newPassword ? { newPassword } : {}),
        }),
      });
      setStatus({ ok: true, message: newPassword ? "Sign-in details updated. Other devices have been signed out." : "Email updated." });
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error) {
      setStatus({ ok: false, message: error instanceof Error ? error.message : "Unable to update sign-in details." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Sign-in and security</CardTitle>
          <CardDescription>Your current password is needed to change your email or password.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sec-email">Email</FieldLabel>
              <Input id="sec-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sec-new">New password</FieldLabel>
                <Input
                  id="sec-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep yours"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="sec-confirm">Confirm new password</FieldLabel>
                <Input id="sec-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="sec-current">Current password</FieldLabel>
              <Input id="sec-current" type="password" required autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Field>
            {status && (
              <Alert variant={status.ok ? "default" : "destructive"}>
                {status.ok ? <CheckCircle2 /> : <AlertCircle />}
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner data-icon="inline-start" />}
            {busy ? "Saving" : "Update sign-in details"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
