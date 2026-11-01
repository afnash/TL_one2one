"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { initials } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLMS } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";

interface ProfileCardProps {
  name: string;
  roleLabel: string;
  phone?: string;
  bio?: string;
  showBio?: boolean;
  onSave: (values: { name: string; phone: string; bio: string }) => void | Promise<void>;
}

// One profile form for every role. Email and password live in AccountSecurityForm.
export function ProfileCard({ name: initialName, roleLabel, phone: initialPhone = "", bio: initialBio = "", showBio, onSave }: ProfileCardProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [bio, setBio] = useState(initialBio);
  const { waitForSaves } = useLMS();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), bio: bio.trim() });
      await waitForSaves();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-secondary text-sm text-secondary-foreground">{initials(initialName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{initialName}</CardTitle>
              <CardDescription>{roleLabel}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
            {showBio && (
              <Field>
                <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                <Textarea id="profile-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          {error && <span role="alert" className="text-sm text-destructive">{error}</span>}
          {saved && (
            <span role="status" className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" /> Saved
            </span>
          )}
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
