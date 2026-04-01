// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UsernameAutoAdjustedToast } from "./username-auto-adjusted-toast";

const { toastInfo } = vi.hoisted(() => ({
  toastInfo: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    key === "autoAdjustedToastTitle"
      ? "Username updated automatically"
      : `Current username: @${values?.username ?? ""}`,
}));

vi.mock("sonner", () => ({
  toast: {
    info: toastInfo,
  },
}));

describe("UsernameAutoAdjustedToast", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    window.sessionStorage.clear();
    toastInfo.mockReset();
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

  it("shows a toast once for an auto-adjusted username", () => {
    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.abcdef" />,
      );
    });

    expect(toastInfo).toHaveBeenCalledTimes(1);
    expect(toastInfo).toHaveBeenCalledWith("Username updated automatically", {
      description: "Current username: @alice.abcdef",
    });

    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.abcdef" />,
      );
    });

    expect(toastInfo).toHaveBeenCalledTimes(1);
  });

  it("does not show the same toast again after a remount", () => {
    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.abcdef" />,
      );
    });

    expect(toastInfo).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });

    root = createRoot(container);

    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.abcdef" />,
      );
    });

    expect(toastInfo).toHaveBeenCalledTimes(1);
  });

  it("does not show a toast when the username was only suggested for setup", () => {
    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled={false} username="alice" />,
      );
    });

    expect(toastInfo).not.toHaveBeenCalled();
  });

  it("shows a new toast when the adjusted username changes", () => {
    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.abcdef" />,
      );
    });

    act(() => {
      root.render(
        <UsernameAutoAdjustedToast enabled username="alice.ghijkl" />,
      );
    });

    expect(toastInfo).toHaveBeenCalledTimes(2);
  });
});
