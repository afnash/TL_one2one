"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AuthShell } from "@/components/brand/AuthShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function ManageLogin() {
  const router = useRouter();
  const { refreshSession } = useLMS();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      await refreshSession();
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell variant="admin">
      <Card className="w-full">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <CardHeader>
            <CardTitle className="text-2xl">Administrator console</CardTitle>
            <CardDescription>Restricted access. Sign in with your administrator account.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" name="username" required autoComplete="username" />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                <Input id="admin-password" name="password" type="password" required autoComplete="current-password" />
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" size="lg" disabled={busy}>
                {busy && <Spinner data-icon="inline-start" />}
                {busy ? "Signing in" : "Sign in as administrator"}
              </Button>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft data-icon="inline-start" />
                Home
              </Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/login">Student, teacher or manager sign-in</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthShell>
  );
}
