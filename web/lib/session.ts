import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getSessionOrRedirect() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login?invalid=1");
  }

  return session;
}
