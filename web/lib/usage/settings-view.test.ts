import { describe, expect, it } from "vitest";

import {
  getPreferenceStatusText,
  hasPreferenceChanges,
  projectModeOptions,
  summarizeUsageKeys,
} from "./settings-view";

describe("hasPreferenceChanges", () => {
  it("returns false when timezone and project mode are unchanged", () => {
    expect(
      hasPreferenceChanges(
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
      ),
    ).toBe(false);
  });

  it("returns true when either preference changes", () => {
    expect(
      hasPreferenceChanges(
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
        {
          timezone: "UTC",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
      ),
    ).toBe(true);
    expect(
      hasPreferenceChanges(
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
        {
          timezone: "Asia/Shanghai",
          projectMode: "hashed",
          locale: "en",
          theme: "system",
        },
      ),
    ).toBe(true);
    expect(
      hasPreferenceChanges(
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "en",
          theme: "system",
        },
        {
          timezone: "Asia/Shanghai",
          projectMode: "raw",
          locale: "zh",
          theme: "dark",
        },
      ),
    ).toBe(true);
  });
});

describe("summarizeUsageKeys", () => {
  it("counts total, active, and disabled keys", () => {
    expect(
      summarizeUsageKeys([{ status: "active" }, { status: "disabled" }, { status: "active" }]),
    ).toEqual({ total: 3, active: 2, disabled: 1 });
  });
});

describe("projectModeOptions", () => {
  it("keeps concise labels for the compact settings view", () => {
    expect(projectModeOptions.map((option) => option.label)).toEqual(["Hashed", "Raw", "Disabled"]);
  });
});

describe("getPreferenceStatusText", () => {
  it("returns lightweight autosave labels", () => {
    expect(getPreferenceStatusText("idle")).toBeNull();
    expect(getPreferenceStatusText("saving")).toBe("Saving...");
    expect(getPreferenceStatusText("saved")).toBe("Saved");
  });
});
