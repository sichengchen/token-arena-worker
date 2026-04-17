import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTranslations: vi.fn(async () => (key: string) => {
    if (key === "activityTitle") return "AI Coding Activity";
    if (key === "less") return "Less";
    if (key === "more") return "More";
    return key;
  }),
  getPublicProfileActivityShareData: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: mocks.getTranslations,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

vi.mock("@/lib/social/queries", () => ({
  getPublicProfileActivityShareData: mocks.getPublicProfileActivityShareData,
}));

import { GET } from "./route";

describe("activity svg route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicProfileActivityShareData.mockResolvedValue({
      username: "poco",
      timezone: "UTC",
      heatmap: [
        {
          date: "2026-03-01",
          activeSeconds: 3600,
          sessions: 2,
          totalTokens: 12000,
          level: 2,
        },
      ],
      summary: {
        activeDays: 1,
        activeSeconds: 3600,
      },
    });
  });

  it("returns a compact svg image for public users", async () => {
    const response = await GET(new Request("https://token.poco-ai.com/zh/u/poco/activity.svg"), {
      params: Promise.resolve({ locale: "zh", username: "poco" }),
    });

    expect(response.headers.get("Content-Type")).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
    expect(mocks.getPublicProfileActivityShareData).toHaveBeenCalledWith({
      username: "poco",
    });
  });

  it("supports the optional theme query", async () => {
    const response = await GET(
      new Request("https://token.poco-ai.com/zh/u/poco/activity.svg?theme=light"),
      {
        params: Promise.resolve({ locale: "zh", username: "poco" }),
      },
    );

    const svg = await response.text();
    expect(svg).toContain("#ffffff");
  });

  it("throws notFound when the profile is missing or private", async () => {
    mocks.getPublicProfileActivityShareData.mockResolvedValueOnce(null);

    await expect(
      GET(new Request("https://token.poco-ai.com/zh/u/missing/activity.svg"), {
        params: Promise.resolve({ locale: "zh", username: "missing" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
