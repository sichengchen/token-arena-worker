import { describe, expect, it } from "vitest";
import { getDaemonExitCode } from "./daemon";

describe("getDaemonExitCode", () => {
  it("returns a clean exit code for managed service mode", () => {
    expect(getDaemonExitCode({ service: true })).toBe(0);
  });

  it("returns a failure exit code for interactive/manual mode", () => {
    expect(getDaemonExitCode()).toBe(1);
  });
});
