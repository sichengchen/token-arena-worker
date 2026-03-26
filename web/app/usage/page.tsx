import { getSessionOrRedirect } from "@/lib/session";

export default async function UsagePage() {
  const session = await getSessionOrRedirect();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Usage Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {session.user.email}.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Usage dashboard UI will be implemented in a later task.
      </p>
    </main>
  );
}
