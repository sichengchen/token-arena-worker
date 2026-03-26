import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UsagePageShellProps = {
  activePath: "/usage" | "/usage/setup" | "/settings/keys";
  title: string;
  description: string;
  email: string;
  timezone?: string;
  children: ReactNode;
};

const navItems = [
  { href: "/usage", label: "Overview" },
  { href: "/usage/setup", label: "Setup" },
  { href: "/settings/keys", label: "API Keys" },
] as const;

export function UsagePageShell({
  activePath,
  title,
  description,
  email,
  timezone,
  children,
}: UsagePageShellProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl bg-background p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Usage Dashboard</Badge>
                {timezone ? (
                  <Badge variant="secondary">TZ {timezone}</Badge>
                ) : null}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Signed in as {email}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              <LogoutButton />
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={item.href === activePath ? "default" : "outline"}
              >
                <Link
                  href={item.href}
                  className={cn(
                    item.href === activePath
                      ? "pointer-events-none"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
