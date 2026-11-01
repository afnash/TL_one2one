"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLMS } from "@/lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types";

export function RoleGate({ expected, children }: { expected: UserRole; children: React.ReactNode }) {
  const { loading, role, user, switchRole, connectionError } = useLMS();
  const router = useRouter();

  useEffect(() => {
    if (expected === "SUPERADMIN") {
      if (role !== expected) switchRole(expected);
    } else if (!loading && (role !== expected || !user.id)) {
      router.replace("/login");
    }
  }, [loading, role, user.id, expected, router, switchRole]);

  if (loading || role !== expected || (expected !== "SUPERADMIN" && !user.id)) {
    return (
      <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Loading workspace">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <>
      {connectionError && (
        <Alert variant="destructive" className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <AlertDescription className="flex items-center gap-3">
            {connectionError}
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
}
