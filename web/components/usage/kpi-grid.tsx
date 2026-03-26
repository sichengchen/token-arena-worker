import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatTokenCount } from "@/lib/usage/format";
import type { UsageOverviewMetrics } from "@/lib/usage/types";
import { cn } from "@/lib/utils";

type KpiGridProps = {
  overview: UsageOverviewMetrics;
};

type KpiConfig = {
  key: keyof UsageOverviewMetrics;
  labelKey: string;
  kind: "tokens" | "duration" | "count";
};

const kpis: KpiConfig[] = [
  { key: "totalTokens", labelKey: "totalTokens", kind: "tokens" },
  { key: "inputTokens", labelKey: "inputTokens", kind: "tokens" },
  { key: "outputTokens", labelKey: "outputTokens", kind: "tokens" },
  { key: "reasoningTokens", labelKey: "reasoningTokens", kind: "tokens" },
  { key: "cachedTokens", labelKey: "cachedTokens", kind: "tokens" },
  { key: "activeSeconds", labelKey: "activeTime", kind: "duration" },
  { key: "totalSeconds", labelKey: "totalTime", kind: "duration" },
  { key: "sessions", labelKey: "sessions", kind: "count" },
  { key: "messages", labelKey: "messages", kind: "count" },
  { key: "userMessages", labelKey: "userMessages", kind: "count" },
];

type DeltaTone = "positive" | "negative" | "neutral";

function formatMetricValue(
  value: number,
  kind: KpiConfig["kind"],
  options?: { compact?: boolean },
) {
  if (kind === "duration") {
    return formatDuration(value, options);
  }

  return formatTokenCount(value);
}

function formatDelta(value: number, kind: KpiConfig["kind"]) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMetricValue(value, kind, { compact: true })}`;
}

function getDeltaTone(value: number): DeltaTone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function getDeltaToneClasses(tone: DeltaTone) {
  switch (tone) {
    case "positive":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "negative":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export async function KpiGrid({ overview }: KpiGridProps) {
  const t = await getTranslations("usage.kpis");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const metric = overview[kpi.key];
        const currentValue = formatMetricValue(metric.current, kpi.kind);
        const previousValue = formatMetricValue(metric.previous, kpi.kind);
        const deltaValue = formatDelta(metric.delta, kpi.kind);
        const deltaDescription = t("deltaVsPrevious", {
          delta: deltaValue,
          previous: previousValue,
        });
        const deltaTone = getDeltaTone(metric.delta);

        return (
          <Card key={kpi.key} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{t(kpi.labelKey)}</CardTitle>
                <span className="sr-only">{deltaDescription}</span>
                <span
                  data-delta-tone={deltaTone}
                  title={deltaDescription}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[0.65rem] leading-none font-medium",
                    getDeltaToneClasses(deltaTone),
                  )}
                >
                  {deltaValue}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {currentValue}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
