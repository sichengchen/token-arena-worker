import { describe, expect, it } from "vitest";
import {
  formatLeaderboardWindowLabel,
  getShanghaiDateKey,
  resolveLatestFinalizableLeaderboardWindow,
  resolveLeaderboardWindow,
  SHANGHAI_TIMEZONE,
  startOfShanghaiDay,
} from "./date";

describe("leaderboard date helpers", () => {
  it("normalizes a timestamp to Shanghai midnight", () => {
    expect(startOfShanghaiDay(new Date("2026-03-28T19:45:00.000Z")).toISOString()).toBe(
      "2026-03-28T16:00:00.000Z",
    );
  });

  it("builds day, week, and month windows using Shanghai calendar boundaries", () => {
    const now = new Date("2026-04-01T01:45:00.000Z");

    expect(resolveLeaderboardWindow("day", now)).toEqual({
      start: new Date("2026-03-31T16:00:00.000Z"),
      end: new Date("2026-04-01T16:00:00.000Z"),
    });
    expect(resolveLeaderboardWindow("week", now)).toEqual({
      start: new Date("2026-03-29T16:00:00.000Z"),
      end: new Date("2026-04-05T16:00:00.000Z"),
    });
    expect(resolveLeaderboardWindow("month", now)).toEqual({
      start: new Date("2026-03-31T16:00:00.000Z"),
      end: new Date("2026-04-30T16:00:00.000Z"),
    });
  });

  it("returns an ISO date key in Shanghai time", () => {
    expect(getShanghaiDateKey(new Date("2026-03-28T23:59:59.999Z"))).toBe("2026-03-29");
  });

  it("resolves the latest finalizable weekly and monthly windows at 4am Shanghai time", () => {
    expect(
      resolveLatestFinalizableLeaderboardWindow("week", new Date("2026-04-05T19:59:59.999Z")),
    ).toBeNull();
    expect(
      resolveLatestFinalizableLeaderboardWindow("week", new Date("2026-04-05T20:00:00.000Z")),
    ).toEqual({
      start: new Date("2026-03-29T16:00:00.000Z"),
      end: new Date("2026-04-05T16:00:00.000Z"),
      finalizeAt: new Date("2026-04-05T20:00:00.000Z"),
    });

    expect(
      resolveLatestFinalizableLeaderboardWindow("month", new Date("2026-04-30T19:59:59.999Z")),
    ).toBeNull();
    expect(
      resolveLatestFinalizableLeaderboardWindow("month", new Date("2026-04-30T20:00:00.000Z")),
    ).toEqual({
      start: new Date("2026-03-31T16:00:00.000Z"),
      end: new Date("2026-04-30T16:00:00.000Z"),
      finalizeAt: new Date("2026-04-30T20:00:00.000Z"),
    });
  });

  it("formats window labels for display beside the metric filter", () => {
    expect(
      formatLeaderboardWindowLabel({
        period: "day",
        windowStart: "2026-03-31T16:00:00.000Z",
        windowEnd: "2026-04-01T16:00:00.000Z",
        locale: "zh-CN",
        timezone: SHANGHAI_TIMEZONE,
      }),
    ).toBe("2026.04.01");

    expect(
      formatLeaderboardWindowLabel({
        period: "week",
        windowStart: "2026-03-29T16:00:00.000Z",
        windowEnd: "2026-04-05T16:00:00.000Z",
        locale: "zh-CN",
        timezone: SHANGHAI_TIMEZONE,
      }),
    ).toBe("2026.03.30 - 2026.04.05");
  });
});
