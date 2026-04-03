import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { KimiCodeParser } from "./kimi-code";

const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("KimiCodeParser", () => {
  it("parses kimi wire logs and resolves the project name from kimi.json", async () => {
    const rootDir = makeTempDir("tokenarena-kimi-");
    const sessionsDir = join(rootDir, "sessions");
    const wireDir = join(sessionsDir, "workspace-hash", "session-1");
    mkdirSync(wireDir, { recursive: true });

    writeFileSync(
      join(rootDir, "kimi.json"),
      JSON.stringify({
        workspaces: {
          "workspace-hash": "/Users/dev/tokenarena",
        },
      }),
      "utf-8",
    );

    writeFileSync(
      join(wireDir, "wire.jsonl"),
      [
        JSON.stringify({
          type: "UserMessage",
          payload: {
            timestamp: "2026-03-26T10:00:00.000Z",
          },
        }),
        JSON.stringify({
          type: "StatusUpdate",
          payload: {
            timestamp: "2026-03-26T10:00:03.000Z",
            model: "kimi-k2.5",
            message_id: "msg-1",
            token_usage: {
              input_other: 90,
              output: 40,
              input_cache_read: 10,
            },
          },
        }),
      ].join("\n"),
      "utf-8",
    );

    const parser = new KimiCodeParser({
      sessionsDir,
      configPath: join(rootDir, "kimi.json"),
    });
    const result = await parser.parse();

    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0]).toMatchObject({
      source: "kimi-code",
      model: "kimi-k2.5",
      project: "tokenarena",
      inputTokens: 90,
      outputTokens: 40,
      reasoningTokens: 0,
      cachedTokens: 10,
      totalTokens: 140,
    });

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      source: "kimi-code",
      project: "tokenarena",
      durationSeconds: 3,
      messageCount: 2,
      userMessageCount: 1,
      inputTokens: 90,
      outputTokens: 40,
      reasoningTokens: 0,
      cachedTokens: 10,
      totalTokens: 140,
      primaryModel: "kimi-k2.5",
    });
  });
});
