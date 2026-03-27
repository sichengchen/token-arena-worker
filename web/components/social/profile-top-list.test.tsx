import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Bar, BarChart, LabelList, ResponsiveContainer } from "recharts";
import { describe, expect, it, vi } from "vitest";

import { ProfileTopList } from "./profile-top-list";

vi.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string => {
      if (namespace === "social.profile") {
        return (
          {
            totalTokens: "Total Tokens",
          }[key] ?? key
        );
      }

      if (namespace === "usage.breakdowns.table") {
        return (
          {
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

describe("ProfileTopList", () => {
  it("renders a recharts bar chart ranked by total tokens", () => {
    const tree = ProfileTopList({
      locale: "en",
      emptyLabel: "No tool usage yet.",
      items: [
        { name: "Claude Code", totalTokens: 1200000, share: 0.75 },
        { name: "Codex", totalTokens: 300000, share: 0.1875 },
        { name: "OpenCode", totalTokens: 100000, share: 0.0625 },
      ],
    });
    const elements = collectElements(tree);
    const charts = elements.filter((element) => element.type === BarChart);
    const markup = renderToStaticMarkup(tree);

    expect(
      elements.filter((element) => element.type === ResponsiveContainer),
    ).toHaveLength(1);
    expect(charts).toHaveLength(1);
    expect(elements.filter((element) => element.type === Bar)).toHaveLength(1);
    expect(
      elements.filter((element) => element.type === LabelList),
    ).toHaveLength(1);
    expect((charts[0]?.props.data as Array<{ value: number }>)[0]?.value).toBe(
      1200000,
    );
    expect(markup).not.toContain("Claude Code");
    expect(markup).not.toContain("75.0%");
  });

  it("renders the empty label when no items are available", () => {
    const markup = renderToStaticMarkup(
      <ProfileTopList locale="en" emptyLabel="No tool usage yet." items={[]} />,
    );

    expect(markup).toContain("No tool usage yet.");
    expect(markup).not.toContain("recharts-responsive-container");
  });
});
