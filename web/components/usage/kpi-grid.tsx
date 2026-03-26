import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatTokenCount } from "@/lib/usage/format";
import type { UsageOverviewMetrics } from "@/lib/usage/types";

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

function formatMetricValue(value: number, kind: KpiConfig["kind"]) {
  if (kind === "duration") {
    return formatDuration(value);
  }

  return formatTokenCount(value);
}

function formatDelta(value: number, kind: KpiConfig["kind"]) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMetricValue(value, kind)}`;
}

export async function KpiGrid({ overview }: KpiGridProps) {
  const t = await getTranslations("usage.kpis");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const metric = overview[kpi.key];

        return (
          <Card key={kpi.key} size="sm">
            <CardHeader>
              <CardTitle>{t(kpi.labelKey)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-semibold tracking-tight">
                {formatMetricValue(metric.current, kpi.kind)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("deltaVsPrevious", {
                  delta: formatDelta(metric.delta, kpi.kind),
                  previous: formatMetricValue(metric.previous, kpi.kind),
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
