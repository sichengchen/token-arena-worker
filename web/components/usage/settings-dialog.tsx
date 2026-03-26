"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProjectMode } from "@/lib/usage/types";
import { KeyManager, type UsageKeyRecord } from "./key-manager";
import { SettingsPreferences } from "./settings-preferences";

type SettingsDialogProps = {
  initialTimezone: string;
  initialProjectMode: ProjectMode;
  initialKeys: UsageKeyRecord[];
};

export function SettingsDialog({
  initialTimezone,
  initialProjectMode,
  initialKeys,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage dashboard preferences and the CLI API keys used by your
            devices and workflows.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <SettingsPreferences
              initialTimezone={initialTimezone}
              initialProjectMode={initialProjectMode}
            />
            <KeyManager initialKeys={initialKeys} variant="dialog" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
