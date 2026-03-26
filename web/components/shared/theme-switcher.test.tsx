// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeSwitcher } from "./theme-switcher";

const mocks = vi.hoisted(() => ({
  persistClientTheme: vi.fn(),
  persistServerPreference: vi.fn(),
}));

vi.mock("@/lib/preferences-client", () => ({
  persistClientTheme: mocks.persistClientTheme,
  persistServerPreference: mocks.persistServerPreference,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      theme: "Theme",
      "themes.light": "Light",
      "themes.dark": "Dark",
      "themes.system": "System",
    })[key] ?? key,
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
          aria-label="Theme"
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

describe("ThemeSwitcher", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.clearAllMocks();
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

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
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("dark");
    container.remove();
  });

  it("applies a dark theme selection immediately", () => {
    act(() => {
      root.render(
        <ThemeProvider initialThemeMode="system">
          <ThemeSwitcher />
        </ThemeProvider>,
      );
    });

    const select = container.querySelector("select");

    expect(select).not.toBeNull();
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      if (select) {
        select.value = "dark";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(mocks.persistClientTheme).toHaveBeenCalledWith("dark");
  });
});
