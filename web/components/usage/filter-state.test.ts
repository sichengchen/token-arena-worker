import { describe, expect, it } from "vitest";

import type { UsageFilterOptions, UsageFilters } from "@/lib/usage/types";

import {
  getActiveFilterChips,
  getFilterMeta,
  hasActiveDashboardState,
} from "./filter-state";

const options: UsageFilterOptions = {
  apiKeys: [
    { id: "key_1", name: "Personal Mac", status: "active" },
    { id: "key_2", name: "CI", status: "active" },
  ],
  devices: [
    { value: "device_1", label: "MacBook Pro" },
    { value: "device_2", label: "Studio" },
  ],
  sources: [
    { value: "claude-code", label: "Claude Code" },
    { value: "codex", label: "Codex" },
  ],
  models: [
    { value: "gpt-5.4", label: "GPT-5.4" },
    { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  ],
  projects: [
    { value: "project_1", label: "Project A" },
    { value: "project_2", label: "Project B" },
  ],
};

describe("usage filter state helpers", () => {
  it("treats the default 7d state as not resettable", () => {
    expect(hasActiveDashboardState("7d", {})).toBe(false);
  });

  it("treats non-default presets as resettable", () => {
    expect(hasActiveDashboardState("30d", {})).toBe(true);
  });

  it("treats selected filters as resettable", () => {
    expect(hasActiveDashboardState("7d", { source: "claude-code" })).toBe(true);
  });

  it("returns only active chips with human labels", () => {
    const filters: UsageFilters = {
      apiKeyId: "key_1",
      source: "claude-code",
      model: "gpt-5.4",
    };

    expect(getActiveFilterChips(filters, options)).toEqual({
      visible: [
        { key: "apiKeyId", label: "Personal Mac", value: "key_1" },
        { key: "source", label: "Claude Code", value: "claude-code" },
        { key: "model", label: "GPT-5.4", value: "gpt-5.4" },
      ],
      hiddenCount: 0,
      totalCount: 3,
    });
  });

  it("collapses chips beyond the visible limit", () => {
    const filters: UsageFilters = {
      apiKeyId: "key_1",
      deviceId: "device_1",
      source: "claude-code",
      model: "gpt-5.4",
      projectKey: "project_1",
    };

    expect(getActiveFilterChips(filters, options, 3)).toEqual({
      visible: [
        { key: "apiKeyId", label: "Personal Mac", value: "key_1" },
        { key: "deviceId", label: "MacBook Pro", value: "device_1" },
        { key: "source", label: "Claude Code", value: "claude-code" },
      ],
      hiddenCount: 2,
      totalCount: 5,
    });
  });

  it("returns semantic metadata for each filter type", () => {
    expect(getFilterMeta("apiKeyId")).toEqual({
      icon: "key",
      shortLabel: "Keys",
    });
    expect(getFilterMeta("deviceId")).toEqual({
      icon: "device",
      shortLabel: "Devices",
    });
    expect(getFilterMeta("source")).toEqual({
      icon: "tool",
      shortLabel: "Tools",
    });
    expect(getFilterMeta("model")).toEqual({
      icon: "model",
      shortLabel: "Models",
    });
    expect(getFilterMeta("projectKey")).toEqual({
      icon: "project",
      shortLabel: "Projects",
    });
  });
});
