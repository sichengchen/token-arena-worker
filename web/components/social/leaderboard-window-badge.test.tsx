import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeaderboardWindowBadge } from "./leaderboard-window-badge";

describe("LeaderboardWindowBadge", () => {
  it("renders the Shanghai date range for weekly leaderboards", () => {
    const markup = renderToStaticMarkup(
      <LeaderboardWindowBadge
        locale="zh-CN"
        period="week"
        windowStart="2026-03-29T16:00:00.000Z"
        windowEnd="2026-04-05T16:00:00.000Z"
      />,
    );

    expect(markup).toContain("2026.03.30 - 2026.04.05");
  });

  it("hides itself for all-time leaderboards", () => {
    const markup = renderToStaticMarkup(
      <LeaderboardWindowBadge
        locale="zh-CN"
        period="all_time"
        windowStart={null}
        windowEnd={null}
      />,
    );

    expect(markup).toBe("");
  });
});
