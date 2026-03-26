import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  headerActions,
  children,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-3">
        {headerActions ? (
          <div className="flex justify-end gap-2">{headerActions}</div>
        ) : null}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
