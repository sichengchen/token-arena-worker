import { platform } from "node:os";
import { createLinuxSystemdServiceBackend } from "./linux-systemd";
import { createMacosLaunchdServiceBackend } from "./macos-launchd";
import type { ServiceBackend } from "./types";

export function getServiceBackend(
  currentPlatform: NodeJS.Platform = platform(),
): ServiceBackend | null {
  switch (currentPlatform) {
    case "linux":
      return createLinuxSystemdServiceBackend();
    case "darwin":
      return createMacosLaunchdServiceBackend();
    default:
      return null;
  }
}
