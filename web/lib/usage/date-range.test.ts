import { describe, expect, it } from "vitest";

import { resolveDashboardRange } from "./date-range";

describe("resolveDashboardRange", () => {
  it("supports date-only custom ranges in the account timezone", () => {
    const result = resolveDashboardRange({
      preset: "custom",
      from: "2026-03-26",
      to: "2026-03-27",
      timezone: "Asia/Shanghai",
    });

    expect(result.from.toISOString()).toBe("2026-03-25T16:00:00.000Z");
    expect(result.to.toISOString()).toBe("2026-03-27T15:59:59.999Z");
    expect(result.granularity).toBe("day");
  });

  it("supports date-only custom ranges in negative UTC offsets", () => {
    const result = resolveDashboardRange({
      preset: "custom",
      from: "2026-03-26",
      to: "2026-03-27",
      timezone: "America/Los_Angeles",
    });

    expect(result.from.toISOString()).toBe("2026-03-26T07:00:00.000Z");
    expect(result.to.toISOString()).toBe("2026-03-28T06:59:59.999Z");
  });

  it("uses hourly buckets for 1D", () => {
    const result = resolveDashboardRange({
      preset: "1d",
      timezone: "UTC",
      now: new Date("2026-03-26T12:00:00.000Z"),
    });

    expect(result.granularity).toBe("hour");
  });
});
