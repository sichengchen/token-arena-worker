"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type KeyDialogProps = {
  mode: "create" | "rename";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  pending?: boolean;
  onSubmit: (name: string) => Promise<void> | void;
};

export function KeyDialog({
  mode,
  open,
  onOpenChange,
  initialName,
  pending = false,
  onSubmit,
}: KeyDialogProps) {
  const [name, setName] = useState(initialName ?? "");

  useEffect(() => {
    if (open) {
      setName(initialName ?? "");
    }
  }, [initialName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create CLI key" : "Rename CLI key"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Give this key a name so you can remember which device or workflow uses it."
              : "Update the label shown in the dashboard and settings pages."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit(name);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My MacBook / Work"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={pending || name.trim().length === 0}
            >
              {pending
                ? "Saving..."
                : mode === "create"
                  ? "Create key"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
