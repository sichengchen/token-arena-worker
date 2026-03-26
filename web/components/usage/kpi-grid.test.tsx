import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getTranslations:
    async () => (key: string, values?: Record<string, string>) => {
      if (key === "deltaVsPrevious") {
        return `${values?.delta ?? ""} vs previous ${values?.previous ?? ""}`;
      }

      return (
        {
          totalTokens: "Total Tokens",
          inputTokens: "Input Tokens",
          outputTokens: "Output Tokens",
          reasoningTokens: "Reasoning Tokens",
          cachedTokens: "Cached Tokens",
          activeTime: "Active Time",
          totalTime: "Total Time",
          sessions: "Sessions",
          messages: "Messages",
          userMessages: "User Messages",
        }[key] ?? key
      );
    },
}));

import { KpiGrid } from "./kpi-grid";

describe("KpiGrid", () => {
  it("renders delta badges in the title row above the current values", async () => {
    const markup = renderToStaticMarkup(
      await KpiGrid({
        overview: {
          totalTokens: {
            current: 330800000,
            previous: 132900000,
            delta: 197900000,
          },
          inputTokens: {
            current: 18700000,
            previous: 4300000,
            delta: 14500000,
          },
          outputTokens: { current: 1800000, previous: 2350600, delta: -550600 },
          reasoningTokens: { current: 825500, previous: 825500, delta: 0 },
          cachedTokens: {
            current: 310300000,
            previous: 127400000,
            delta: 182900000,
          },
          activeSeconds: { current: 41400, previous: 21000, delta: 20400 },
          totalSeconds: { current: 62160, previous: 37860, delta: 24300 },
          sessions: { current: 53, previous: 48, delta: 5 },
          messages: { current: 4600, previous: 3617, delta: 983 },
          userMessages: { current: 407, previous: 784, delta: -377 },
        },
      }),
    );

    const titleIndex = markup.indexOf("Total Tokens");
    const deltaIndex = markup.indexOf("+197.9M");
    const currentIndex = markup.indexOf("330.8M");

    expect(titleIndex).toBeGreaterThan(-1);
    expect(deltaIndex).toBeGreaterThan(titleIndex);
    expect(currentIndex).toBeGreaterThan(deltaIndex);
    expect(markup).toContain("330.8M");
    expect(markup).toContain(">+197.9M</span>");
    expect(markup).toContain(">+6h45m</span>");
    expect(markup).toContain('title="+197.9M vs previous 132.9M"');
    expect(markup).toContain('title="-377 vs previous 784"');
    expect(markup).toContain('title="0 vs previous 825.5K"');
    expect(markup).toContain("flex items-center justify-between gap-2");
    expect(markup).toContain('data-delta-tone="positive"');
    expect(markup).toContain('data-delta-tone="negative"');
    expect(markup).toContain('data-delta-tone="neutral"');
    expect(markup).not.toContain("<sup");
  });
});
