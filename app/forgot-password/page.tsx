import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { AuthShell } from "@/components/brand/AuthShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// There is no self-service reset flow: passwords are reset by a manager or administrator.
export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>Online password reset is not available yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info />
            <AlertTitle>Ask your manager or administrator</AlertTitle>
            <AlertDescription>
              They can set a new password for your account. You can change it again in Settings after you
              sign in.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <ArrowLeft data-icon="inline-start" />
              Back to sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
