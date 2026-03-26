"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validators/auth";

type LoginFormProps = {
  showInvalidSessionMessage?: boolean;
};

function getAuthErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const withMessage = error as {
      message?: unknown;
      error?: { message?: unknown };
    };

    if (typeof withMessage.message === "string") {
      return withMessage.message;
    }

    if (typeof withMessage.error?.message === "string") {
      return withMessage.error.message;
    }
  }

  return "Unable to sign in. Please try again.";
}

export function LoginForm({
  showInvalidSessionMessage = false,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);
    setEmailError(null);
    setPasswordError(null);

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0] ?? null);
      setPasswordError(fieldErrors.password?.[0] ?? null);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (result.error) {
        setFormError(getAuthErrorMessage(result.error));
        return;
      }

      router.push("/usage");
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {showInvalidSessionMessage ? (
        <Alert variant="destructive">
          <AlertDescription>
            Your session is invalid or expired. Please sign in again.
          </AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(emailError)}
        />
        {emailError ? (
          <p className="text-sm text-destructive">{emailError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(passwordError)}
        />
        {passwordError ? (
          <p className="text-sm text-destructive">{passwordError}</p>
        ) : null}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-foreground underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
