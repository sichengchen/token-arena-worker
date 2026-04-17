"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

type ProfileHeatmapMarkdownButtonProps = {
  markdown: string;
};

export function ProfileHeatmapMarkdownButton({ markdown }: ProfileHeatmapMarkdownButtonProps) {
  const t = useTranslations("social.profile");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [markdown]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleCopy()}
      aria-label={t("copyHeatmapMarkdown")}
      title={t("copyHeatmapMarkdown")}
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {copied ? t("copiedHeatmapMarkdown") : t("copyHeatmapMarkdown")}
    </Button>
  );
}
