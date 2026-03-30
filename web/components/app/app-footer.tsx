"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { GitHubRepoLink } from "@/components/shared/github-repo-link";

type AppFooterProps = {
  actions?: ReactNode;
};

export function AppFooter({ actions }: AppFooterProps) {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-center text-sm text-white sm:text-left">
          {t("footerCopyright", { year })}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <GitHubRepoLink />
        </div>
      </div>
    </footer>
  );
}
