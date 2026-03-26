import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getOptionalSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect("/usage");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Use your email and password to get started."
    >
      <RegisterForm />
    </AuthShell>
  );
}
