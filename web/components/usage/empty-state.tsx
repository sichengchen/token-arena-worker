import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmptyStateProps = {
  hasKeys: boolean;
};

export function EmptyState({ hasKeys }: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No usage data yet</CardTitle>
        <CardDescription>
          Create a CLI key, configure the CLI once, then run a sync to populate
          your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Create or copy a usage API key.</li>
          <li>
            Run{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              tokens-burned init
            </code>{" "}
            in the CLI.
          </li>
          <li>Paste the key and sync your local usage records.</li>
        </ol>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={hasKeys ? "/usage/setup" : "/settings/keys"}>
              {hasKeys ? "Open setup guide" : "Create your first key"}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/keys">Manage keys</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
