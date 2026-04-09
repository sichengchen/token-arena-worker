import { describe, expect, it } from "vitest";
import { getServiceBackend } from "./index";

describe("getServiceBackend", () => {
  it("routes Linux to systemd", () => {
    expect(getServiceBackend("linux")?.displayName).toBe("systemd 用户服务");
  });

  it("routes macOS to launchd", () => {
    expect(getServiceBackend("darwin")?.displayName).toBe("launchd 用户服务");
  });

  it("returns null on unsupported platforms", () => {
    expect(getServiceBackend("win32")).toBeNull();
  });
});
