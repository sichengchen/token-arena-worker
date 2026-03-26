type LoginPageProps = {
  searchParams?: Promise<{
    invalid?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const showInvalidSessionMessage = resolvedSearchParams?.invalid === "1";

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      {showInvalidSessionMessage ? (
        <p className="mt-2 text-sm text-destructive">
          Your session is invalid or expired. Please sign in again.
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted-foreground">
        Login form will be implemented in a later task.
      </p>
    </main>
  );
}
