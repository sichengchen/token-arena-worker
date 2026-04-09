import { describe, expect, it } from "vitest";
import {
  buildSystemdServiceContent,
  getLinuxSystemdServiceFile,
} from "./linux-systemd";

describe("buildSystemdServiceContent", () => {
  it("writes a restart-on-failure unit for daemon service mode", () => {
    const content = buildSystemdServiceContent({
      environment: {
        PATH: "/usr/local/bin:/usr/bin",
        TOKEN_ARENA_DEV: "1",
      },
      execPath: "/usr/local/bin/node",
      args: ["/tmp/tokenarena/dist/index.js", "daemon", "--service"],
    });

    expect(content).toContain(
      'ExecStart="/usr/local/bin/node" "/tmp/tokenarena/dist/index.js" "daemon" "--service"',
    );
    expect(content).toContain("Restart=on-failure");
    expect(content).toContain('Environment="TOKEN_ARENA_DEV=1"');
  });
});

describe("getLinuxSystemdServiceFile", () => {
  it("uses the user systemd directory", () => {
    expect(getLinuxSystemdServiceFile("/Users/tester")).toBe(
      "/Users/tester/.config/systemd/user/tokenarena.service",
    );
  });
});
