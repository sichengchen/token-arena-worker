"use client";

import { useTranslations } from "next-intl";
import { GitHubRepoLink } from "@/components/shared/github-repo-link";

export function AppFooter() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          {t("footerCopyright", { year })}
        </p>
        <div className="flex shrink-0 items-center">
          <GitHubRepoLink />
        </div>
      </div>
    </footer>
  );
}
