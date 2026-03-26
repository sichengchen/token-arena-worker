import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsagePageShell } from "./page-shell";

describe("UsagePageShell", () => {
  it("renders a plain overview header instead of a boxed card", () => {
    const markup = renderToStaticMarkup(
      <UsagePageShell
        title="Overview"
        lastSyncedText="Last synced Mar 26, 2026, 18:10"
        headerActions={<button type="button">Settings</button>}
      >
        <div>Body</div>
      </UsagePageShell>,
    );

    expect(markup).toContain(">Overview<");
    expect(markup).toContain("Last synced Mar 26, 2026, 18:10");
    expect(markup).toContain(
      "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
    );
    expect(markup).not.toContain("rounded-2xl bg-background");
    expect(markup).not.toContain("ring-1 ring-foreground/10");
  });
});
