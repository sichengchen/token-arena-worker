"use client";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FollowTagBadge } from "./follow-tag-badge";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string): string => {
      const translations: Record<string, Record<string, string>> = {
        "social.tags": {
          selectLabel: "关注标签",
          none: "未分组",
          "options.coworker": "同事",
          "options.friend": "朋友",
          "options.peer": "同行",
          "options.inspiration": "灵感",
        },
        "social.errors": {
          tagFailed: "标签更新失败",
        },
      };

      return translations[namespace]?.[key] ?? key;
    },
}));

describe("FollowTagBadge", () => {
  it("renders tag label with dropdown icon when tag is set", () => {
    const markup = renderToStaticMarkup(
      <FollowTagBadge locale="zh-CN" username="alice" tag="coworker" />,
    );

    expect(markup).toContain("同事");
    expect(markup).toContain('type="button"');
  });

  it("renders selectLabel when tag is null", () => {
    const markup = renderToStaticMarkup(
      <FollowTagBadge locale="zh-CN" username="alice" tag={null} />,
    );

    expect(markup).toContain("关注标签");
  });

  it("shows button with border and muted background", () => {
    const markup = renderToStaticMarkup(
      <FollowTagBadge locale="zh-CN" username="alice" tag={null} />,
    );

    expect(markup).toContain("border");
    expect(markup).toContain("bg-muted");
  });
});
