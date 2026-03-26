import { describe, expect, it } from "vitest";

import { dashboardQuerySchema, ingestRequestSchema } from "./contracts";

describe("ingestRequestSchema", () => {
  it("requires schemaVersion and device metadata", () => {
    const result = ingestRequestSchema.safeParse({
      buckets: [],
      sessions: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts date-only custom dashboard queries", () => {
    const result = dashboardQuerySchema.safeParse({
      preset: "custom",
      from: "2026-03-26",
      to: "2026-03-27",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid custom dashboard dates", () => {
    const result = dashboardQuerySchema.safeParse({
      preset: "custom",
      from: "not-a-date",
      to: "2026-03-27",
    });

    expect(result.success).toBe(false);
  });

  it("preserves reasoning tokens as a separate field", () => {
    const result = ingestRequestSchema.safeParse({
      schemaVersion: 2,
      device: {
        deviceId: "device-1234",
        hostname: "macbook-pro",
      },
      buckets: [
        {
          source: "codex",
          model: "gpt-5.4",
          projectKey: "abc123",
          projectLabel: "Project abc123",
          bucketStart: "2026-03-26T10:00:00.000Z",
          inputTokens: 100,
          outputTokens: 60,
          reasoningTokens: 10,
          cachedTokens: 25,
          totalTokens: 185,
        },
      ],
      sessions: [],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buckets[0]?.reasoningTokens).toBe(10);
    }
  });
});
