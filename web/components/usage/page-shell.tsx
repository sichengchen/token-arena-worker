import type { ReactNode } from "react";

type UsagePageShellProps = {
  title: string;
  lastSyncedLabel: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function UsagePageShell({
  title,
  lastSyncedLabel,
  headerActions,
  children,
}: UsagePageShellProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl bg-background px-4 py-4 ring-1 ring-foreground/10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Last synced {lastSyncedLabel}
              </p>
            </div>
          </div>

          {headerActions ? (
            <div className="flex items-center gap-2 self-start">
              {headerActions}
            </div>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}
