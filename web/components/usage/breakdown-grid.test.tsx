import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Bar, BarChart, LabelList, ResponsiveContainer } from "recharts";
import { describe, expect, it, vi } from "vitest";

import type { UsageBreakdowns } from "@/lib/usage/types";
import { BreakdownGrid } from "./breakdown-grid";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    (namespace: string) =>
    (key: string): string => {
      if (namespace === "usage.breakdowns") {
        return (
          {
            title: "Breakdowns",
            description:
              "Break down usage by device, tool, model, and project.",
            "tabs.devices": "Devices",
            "tabs.tools": "Tools",
            "tabs.models": "Models",
            "tabs.projects": "Projects",
            "rankedBy.totalTokens": "Ranked by total tokens",
            "rankedBy.sessions": "Ranked by sessions",
            "rankedBy.messages": "Ranked by messages",
            "empty.devices": "No device data in this range.",
            "empty.tools": "No tool data in this range.",
            "empty.models": "No model data in this range.",
            "empty.projects": "No project data in this range.",
            others: "Others",
          }[key] ?? key
        );
      }

      if (namespace === "usage.breakdowns.table") {
        return (
          {
            totalTokens: "Total Tokens",
            sessions: "Sessions",
            messages: "Messages",
            share: "Share",
          }[key] ?? key
        );
      }

      return key;
    },
}));

function collectElements(node: ReactNode): Array<{
  type: unknown;
  props: Record<string, unknown>;
}> {
  const elements: Array<{ type: unknown; props: Record<string, unknown> }> = [];

  function visit(value: ReactNode) {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }

      return;
    }

    if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      "props" in value &&
      value.props &&
      typeof value.props === "object"
    ) {
      const element = value as {
        type: unknown;
        props: Record<string, unknown> & { children?: ReactNode };
      };

      elements.push({
        type: element.type,
        props: element.props,
      });
      visit(element.props.children);
    }
  }

  visit(node);

  return elements;
}

describe("BreakdownGrid", () => {
  const breakdowns: UsageBreakdowns = {
    devices: [],
    tools: [
      {
        key: "claude-code",
        name: "Claude Code",
        totalTokens: 50,
        inputTokens: 20,
        outputTokens: 20,
        reasoningTokens: 5,
        cachedTokens: 5,
        activeSeconds: 0,
        sessions: 3,
        messages: 15,
        userMessages: 8,
        share: 50 / 155,
      },
      {
        key: "cursor",
        name: "Cursor",
        totalTokens: 40,
        inputTokens: 18,
        outputTokens: 17,
        reasoningTokens: 3,
        cachedTokens: 2,
        activeSeconds: 0,
        sessions: 2,
        messages: 11,
        userMessages: 6,
        share: 40 / 155,
      },
      {
        key: "openai",
        name: "OpenAI",
        totalTokens: 30,
        inputTokens: 15,
        outputTokens: 10,
        reasoningTokens: 3,
        cachedTokens: 2,
        activeSeconds: 0,
        sessions: 2,
        messages: 8,
        userMessages: 4,
        share: 30 / 155,
      },
      {
        key: "warp",
        name: "Warp",
        totalTokens: 20,
        inputTokens: 9,
        outputTokens: 8,
        reasoningTokens: 2,
        cachedTokens: 1,
        activeSeconds: 0,
        sessions: 1,
        messages: 6,
        userMessages: 3,
        share: 20 / 155,
      },
      {
        key: "zed",
        name: "Zed",
        totalTokens: 10,
        inputTokens: 5,
        outputTokens: 4,
        reasoningTokens: 1,
        cachedTokens: 0,
        activeSeconds: 0,
        sessions: 1,
        messages: 3,
        userMessages: 2,
        share: 10 / 155,
      },
      {
        key: "copilot",
        name: "Copilot",
        totalTokens: 5,
        inputTokens: 2,
        outputTokens: 2,
        reasoningTokens: 1,
        cachedTokens: 0,
        activeSeconds: 0,
        sessions: 1,
        messages: 2,
        userMessages: 1,
        share: 5 / 155,
      },
    ],
    models: [
      {
        key: "gpt-5",
        name: "gpt-5",
        totalTokens: 80,
        inputTokens: 40,
        outputTokens: 30,
        reasoningTokens: 5,
        cachedTokens: 5,
        activeSeconds: 0,
        sessions: 0,
        messages: 0,
        userMessages: 0,
        share: 0.8,
      },
      {
        key: "gpt-4.1",
        name: "gpt-4.1",
        totalTokens: 20,
        inputTokens: 10,
        outputTokens: 8,
        reasoningTokens: 1,
        cachedTokens: 1,
        activeSeconds: 0,
        sessions: 0,
        messages: 0,
        userMessages: 0,
        share: 0.2,
      },
    ],
    projects: [
      {
        key: "proj_1",
        name: "tokens-burned",
        totalTokens: 120,
        inputTokens: 55,
        outputTokens: 50,
        reasoningTokens: 10,
        cachedTokens: 5,
        activeSeconds: 0,
        sessions: 4,
        messages: 18,
        userMessages: 10,
        share: 1,
      },
    ],
  };

  it("is collapsed by default", () => {
    const markup = renderToStaticMarkup(
      <BreakdownGrid breakdowns={breakdowns} />,
    );

    expect(markup).toContain("Breakdowns");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain("Devices");
    expect(markup).not.toContain("md:grid-cols-2");
  });

  it("renders a 2x2 recharts layout instead of a tabbed table", () => {
    const tree = BreakdownGrid({ breakdowns, defaultOpen: true });
    const elements = collectElements(tree);
    const charts = elements.filter((element) => element.type === BarChart);
    const markup = renderToStaticMarkup(
      <BreakdownGrid breakdowns={breakdowns} defaultOpen />,
    );

    expect(markup).toContain("Breakdowns");
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("md:grid-cols-2");
    expect(markup).toContain("Devices");
    expect(markup).toContain("Tools");
    expect(markup).toContain("Models");
    expect(markup).toContain("Projects");
    expect(markup).toContain("No device data in this range.");
    expect(
      elements.filter((element) => element.type === ResponsiveContainer),
    ).toHaveLength(3);
    expect(charts).toHaveLength(3);
    expect(elements.filter((element) => element.type === Bar)).toHaveLength(3);
    expect(
      elements.filter((element) => element.type === LabelList),
    ).toHaveLength(3);
    expect(
      (charts[0]?.props.data as Array<{ name: string }>).at(-1)?.name,
    ).toBe("Others");
    expect((charts[0]?.props.data as Array<{ value: number }>)[0]?.value).toBe(
      50,
    );
    expect((charts[1]?.props.data as Array<{ value: number }>)[0]?.value).toBe(
      80,
    );
    expect(markup).not.toContain("<table");
  });
});
