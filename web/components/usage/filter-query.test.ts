import { describe, expect, it } from "vitest";

import { buildUsageHref } from "./filter-query";

describe("buildUsageHref", () => {
  it("adds a selected filter while preserving existing params", () => {
    expect(
      buildUsageHref("preset=30d&model=gpt-5.4", {
        source: "claude-code",
      }),
    ).toBe("/usage?preset=30d&model=gpt-5.4&source=claude-code");
  });

  it("removes a filter when the selection resets to all", () => {
    expect(
      buildUsageHref("preset=30d&source=claude-code", {
        source: null,
      }),
    ).toBe("/usage?preset=30d");
  });

  it("returns the bare usage path when all params are cleared", () => {
    expect(
      buildUsageHref("source=claude-code", {
        source: null,
      }),
    ).toBe("/usage");
  });
});
