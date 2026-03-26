// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "./language-switcher";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  useLocale: vi.fn(() => "en"),
  usePathname: vi.fn(() => "/usage"),
  persistClientLocale: vi.fn(),
  persistServerPreference: vi.fn(),
  searchParams: new URLSearchParams("preset=7d"),
}));

vi.mock("next-intl", () => ({
  useLocale: mocks.useLocale,
  useTranslations: () => (key: string) =>
    ({
      language: "Language",
      "languages.en": "English",
      "languages.zh": "中文",
    })[key] ?? key,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: mocks.usePathname,
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/lib/preferences-client", () => ({
  persistClientLocale: mocks.persistClientLocale,
  persistServerPreference: mocks.persistServerPreference,
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  function SelectItem() {
    return null;
  }

  function collectOptions(children: React.ReactNode) {
    const options: Array<{ value: string; label: React.ReactNode }> = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }

      const element = child as React.ReactElement<{
        children?: React.ReactNode;
        value?: string;
      }>;

      if (element.type === SelectItem) {
        options.push({
          value: element.props.value as string,
          label: element.props.children,
        });
        return;
      }

      options.push(...collectOptions(element.props.children));
    });

    return options;
  }

  return {
    Select({
      children,
      onValueChange,
      value,
    }: {
      children: React.ReactNode;
      onValueChange?: (value: string) => void;
      value: string;
    }) {
      return (
        <select
          aria-label="Language"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
        >
          {collectOptions(children).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    },
    SelectTrigger() {
      return null;
    },
    SelectValue() {
      return null;
    },
    SelectContent({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    },
    SelectItem,
  };
});

describe("LanguageSwitcher", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.persistServerPreference.mockResolvedValue(undefined);
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    delete (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT;
    container.remove();
  });

  it("switches to the same pathname in another locale", () => {
    act(() => {
      root.render(<LanguageSwitcher authenticated />);
    });

    const select = container.querySelector("select");

    expect(select).not.toBeNull();

    act(() => {
      select?.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
      if (select) {
        select.value = "zh";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(mocks.persistClientLocale).toHaveBeenCalledWith("zh");
    expect(mocks.persistServerPreference).toHaveBeenCalledWith({
      locale: "zh",
    });
    expect(mocks.replace).toHaveBeenCalledWith(
      { pathname: "/usage", query: { preset: "7d" } },
      { locale: "zh" },
    );
  });
});
