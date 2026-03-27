import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { UsageSessionRow } from "@/lib/usage/types";
import { SessionsSection } from "./sessions-section";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, number | string>): string => {
      if (namespace !== "usage.sessions") {
        return key;
      }

      return (
        {
          title: "Sessions",
          description: "Browse usage one session at a time, newest first.",
          count: `${values?.count ?? 0} sessions`,
          empty: "No session data in this range.",
          "table.startedAt": "Started",
          "table.tool": "Tool",
          "table.project": "Project",
          "table.device": "Device",
          "table.duration": "Duration",
          "table.messages": "Messages",
          "table.endedAt": `Ended ${values?.value ?? ""}`.trim(),
          "table.totalDuration": `Total ${values?.value ?? ""}`.trim(),
          "table.userMessages": `${values?.value ?? ""} from you`.trim(),
        }[key] ?? key
      );
    },
}));

describe("SessionsSection", () => {
  const sessions: UsageSessionRow[] = [
    {
      id: "session_1",
      sessionHash: "abc123",
      source: "Claude Code",
      projectKey: "proj_1",
      projectLabel: "tokens-burned",
      deviceId: "device_1",
      deviceLabel: "mac-mini",
      firstMessageAt: "2026-03-27T00:15:00.000Z",
      lastMessageAt: "2026-03-27T01:15:00.000Z",
      durationSeconds: 3600,
      activeSeconds: 2700,
      messageCount: 12,
      userMessageCount: 5,
    },
  ];

  it("is collapsed by default", () => {
    const markup = renderToStaticMarkup(
      <SessionsSection sessions={sessions} timezone="Asia/Shanghai" />,
    );

    expect(markup).toContain("Sessions");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain("Claude Code");
    expect(markup).not.toContain("<table");
  });

  it("renders the session table when expanded", () => {
    const markup = renderToStaticMarkup(
      <SessionsSection
        sessions={sessions}
        timezone="Asia/Shanghai"
        defaultOpen
      />,
    );

    expect(markup).toContain("Sessions");
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("Started");
    expect(markup).toContain("Claude Code");
    expect(markup).toContain("tokens-burned");
    expect(markup).toContain("mac-mini");
    expect(markup).toContain("Total 1h");
    expect(markup).toContain("5 from you");
    expect(markup).toContain("<table");
  });
});
