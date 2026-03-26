"use client";

import { Copy, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsageApiKeyStatus } from "@/lib/usage/types";
import { KeyDialog } from "./key-dialog";

type UsageKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  status: UsageApiKeyStatus;
  lastUsedAt: string | null;
  createdAt: string;
};

type KeyManagerProps = {
  initialKeys: UsageKeyRecord[];
};

export function KeyManager({ initialKeys }: KeyManagerProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [error, setError] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<UsageKeyRecord | null>(null);
  const [pendingKeyId, setPendingKeyId] = useState<string | null>(null);
  const [isDialogPending, setIsDialogPending] = useState(false);

  const summary = useMemo(() => {
    const active = keys.filter((key) => key.status === "active").length;
    return { total: keys.length, active };
  }, [keys]);

  const request = async <T,>(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<T> => {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed.");
    }

    return payload as T;
  };

  const copyRawKey = async () => {
    if (!rawKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(rawKey);
    } catch {
      setError(
        "Unable to copy the key automatically. Please copy it manually.",
      );
    }
  };

  const toggleStatus = async (key: UsageKeyRecord) => {
    setPendingKeyId(key.id);
    setError(null);

    try {
      const nextStatus: UsageApiKeyStatus =
        key.status === "active" ? "disabled" : "active";
      const response = await request<{ key: UsageKeyRecord }>(
        `/api/usage/keys/${key.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      setKeys((current) =>
        current.map((item) => (item.id === key.id ? response.key : item)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the key.",
      );
    } finally {
      setPendingKeyId(null);
    }
  };

  const deleteKey = async (key: UsageKeyRecord) => {
    setPendingKeyId(key.id);
    setError(null);

    try {
      await request<{ success: true }>(`/api/usage/keys/${key.id}`, {
        method: "DELETE",
      });

      setKeys((current) => current.filter((item) => item.id !== key.id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete the key.",
      );
    } finally {
      setPendingKeyId(null);
    }
  };

  const createKey = async (name: string) => {
    setIsDialogPending(true);
    setError(null);

    try {
      const response = await request<{ key: UsageKeyRecord; rawKey: string }>(
        "/api/usage/keys",
        {
          method: "POST",
          body: JSON.stringify({ name }),
        },
      );

      setKeys((current) => [response.key, ...current]);
      setRawKey(response.rawKey);
      setIsCreateOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create the key.",
      );
    } finally {
      setIsDialogPending(false);
    }
  };

  const renameKey = async (name: string) => {
    if (!renameTarget) {
      return;
    }

    setIsDialogPending(true);
    setError(null);

    try {
      const response = await request<{ key: UsageKeyRecord }>(
        `/api/usage/keys/${renameTarget.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name }),
        },
      );

      setKeys((current) =>
        current.map((item) =>
          item.id === renameTarget.id ? response.key : item,
        ),
      );
      setRenameTarget(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to rename the key.",
      );
    } finally {
      setIsDialogPending(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>CLI API Keys</CardTitle>
            <CardDescription>
              Create one key per device or workflow, then disable or delete it
              without affecting the rest.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{summary.total} total</Badge>
            <Badge variant="secondary">{summary.active} active</Badge>
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              Create key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {rawKey ? (
            <Alert>
              <AlertDescription className="space-y-3">
                <div className="font-medium">
                  Copy this key now. It will only be shown once.
                </div>
                <code className="block overflow-x-auto rounded bg-muted px-3 py-2 text-xs">
                  {rawKey}
                </code>
                <Button type="button" variant="outline" onClick={copyRawKey}>
                  <Copy />
                  Copy key
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code>{key.prefix}</code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        key.status === "active" ? "secondary" : "outline"
                      }
                    >
                      {key.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {new Date(key.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRenameTarget(key)}
                        disabled={pendingKeyId === key.id}
                      >
                        <Pencil />
                        Rename
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(key)}
                        disabled={pendingKeyId === key.id}
                      >
                        <Power />
                        {key.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteKey(key)}
                        disabled={pendingKeyId === key.id}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <KeyDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        pending={isDialogPending}
        onSubmit={createKey}
      />
      <KeyDialog
        mode="rename"
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
          }
        }}
        initialName={renameTarget?.name}
        pending={isDialogPending}
        onSubmit={renameKey}
      />
    </>
  );
}
