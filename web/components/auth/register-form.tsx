"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

function getAuthErrorMessage(error: unknown, fallbackMessage: string) {
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

  return fallbackMessage;
}

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    let hasError = false;

    if (trimmedName.length < 2) {
      setNameError(t("register.errors.nameTooShort"));
      hasError = true;
    } else if (trimmedName.length > 50) {
      setNameError(t("register.errors.nameTooLong"));
      hasError = true;
    }

    if (!trimmedEmail) {
      setEmailError(t("register.errors.emailRequired"));
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t("register.errors.emailInvalid"));
      hasError = true;
    }

    if (!password) {
      setPasswordError(t("register.errors.passwordRequired"));
      hasError = true;
    } else if (password.length > 128) {
      setPasswordError(t("register.errors.passwordTooLong"));
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError(t("register.errors.passwordTooShort"));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (result.error) {
        setFormError(
          getAuthErrorMessage(result.error, t("register.errors.default")),
        );
        return;
      }

      router.push("/usage");
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error, t("register.errors.default")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="register-name">{t("fields.name")}</Label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(nameError)}
        />
        {nameError ? (
          <p className="text-sm text-destructive">{nameError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{t("fields.email")}</Label>
        <Input
          id="register-email"
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
        <Label htmlFor="register-password">{t("fields.password")}</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(passwordError)}
        />
        {passwordError ? (
          <p className="text-sm text-destructive">{passwordError}</p>
        ) : null}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("register.submitting") : t("register.submit")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("register.haveAccount")}{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4"
        >
          {t("register.signInLink")}
        </Link>
      </p>
    </form>
  );
}
