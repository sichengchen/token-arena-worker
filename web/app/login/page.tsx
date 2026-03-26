import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalSession } from "@/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{
    invalid?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getOptionalSession();

  if (session) {
    redirect("/usage");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const showInvalidSessionMessage = resolvedSearchParams?.invalid === "1";

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with your email and password."
    >
      <LoginForm showInvalidSessionMessage={showInvalidSessionMessage} />
    </AuthShell>
  );
}
