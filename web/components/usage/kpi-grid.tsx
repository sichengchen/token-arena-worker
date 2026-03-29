import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDuration,
  formatTokenCount,
  formatUsdAmount,
} from "@/lib/usage/format";
import type {
  ModelPricingRow,
  UsageOverviewMetrics,
  UsagePricingSummary,
} from "@/lib/usage/types";
import { cn } from "@/lib/utils";
import { PricingMatchDialog } from "./pricing-match-dialog";

type KpiGridProps = {
  overview: UsageOverviewMetrics;
  pricingSummary?: UsagePricingSummary;
  modelPricingRows?: ModelPricingRow[];
};

type KpiMetricKind = "tokens" | "duration" | "count" | "currency";

type SingleKpiConfig = {
  type: "single";
  key: keyof UsageOverviewMetrics | "estimatedCostUsd";
  labelKey: string;
  kind: KpiMetricKind;
};

type CombinedKpiConfig = {
  type: "combined";
  labelKey: string;
  primary: {
    key: keyof UsageOverviewMetrics;
    labelKey: string;
    kind: KpiMetricKind;
  };
  secondary: {
    key: keyof UsageOverviewMetrics;
    labelKey: string;
    kind: KpiMetricKind;
  };
};

type KpiConfig = SingleKpiConfig | CombinedKpiConfig;

const kpis: KpiConfig[] = [
  {
    type: "single",
    key: "estimatedCostUsd",
    labelKey: "estimatedCost",
    kind: "currency",
  },
  {
    type: "single",
    key: "totalTokens",
    labelKey: "totalTokens",
    kind: "tokens",
  },
  {
    type: "single",
    key: "inputTokens",
    labelKey: "inputTokens",
    kind: "tokens",
  },
  {
    type: "combined",
    labelKey: "outputTokens",
    primary: {
      key: "outputTokens",
      labelKey: "outputTokens",
      kind: "tokens",
    },
    secondary: {
      key: "reasoningTokens",
      labelKey: "reasoningTokens",
      kind: "tokens",
    },
  },
  {
    type: "single",
    key: "cachedTokens",
    labelKey: "cachedTokens",
    kind: "tokens",
  },
  {
    type: "single",
    key: "activeSeconds",
    labelKey: "activeTime",
    kind: "duration",
  },
  {
    type: "single",
    key: "totalSeconds",
    labelKey: "totalTime",
    kind: "duration",
  },
  { type: "single", key: "sessions", labelKey: "sessions", kind: "count" },
  { type: "single", key: "messages", labelKey: "messages", kind: "count" },
  {
    type: "single",
    key: "userMessages",
    labelKey: "userMessages",
    kind: "count",
  },
];

type DeltaTone = "positive" | "negative" | "neutral";

function formatMetricValue(
  value: number,
  kind: KpiMetricKind,
  options?: { compact?: boolean },
) {
  if (kind === "currency") {
    return formatUsdAmount(value, "en", options);
  }

  if (kind === "duration") {
    return formatDuration(value, options);
  }

  return formatTokenCount(value);
}

function formatDelta(value: number, kind: KpiMetricKind) {
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

type MetricSnapshot = {
  current: number;
  previous: number;
  delta: number;
};

function getMetricSnapshot(
  key: SingleKpiConfig["key"] | keyof UsageOverviewMetrics,
  overview: UsageOverviewMetrics,
  pricingSummary?: UsagePricingSummary,
): MetricSnapshot {
  if (key === "estimatedCostUsd") {
    return {
      current: pricingSummary?.currentUsd ?? 0,
      previous: pricingSummary?.previousUsd ?? 0,
      delta: pricingSummary?.deltaUsd ?? 0,
    };
  }

  return overview[key];
}

function sumMetricSnapshots(
  left: MetricSnapshot,
  right: MetricSnapshot,
): MetricSnapshot {
  return {
    current: left.current + right.current,
    previous: left.previous + right.previous,
    delta: left.delta + right.delta,
  };
}

function DeltaBadge({
  metric,
  kind,
  title,
  compact = false,
}: {
  metric: MetricSnapshot;
  kind: KpiMetricKind;
  title: string;
  compact?: boolean;
}) {
  const deltaTone = getDeltaTone(metric.delta);

  return (
    <>
      <span className="sr-only">{title}</span>
      <span
        data-delta-tone={deltaTone}
        title={title}
        className={cn(
          "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 leading-none font-medium",
          compact ? "text-[0.6rem]" : "text-[0.65rem]",
          getDeltaToneClasses(deltaTone),
        )}
      >
        {formatDelta(metric.delta, kind)}
      </span>
    </>
  );
}

export async function KpiGrid({
  overview,
  pricingSummary,
  modelPricingRows = [],
}: KpiGridProps) {
  const t = await getTranslations("usage.kpis");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        if (kpi.type === "combined") {
          const primaryMetric = getMetricSnapshot(
            kpi.primary.key,
            overview,
            pricingSummary,
          );
          const secondaryMetric = getMetricSnapshot(
            kpi.secondary.key,
            overview,
            pricingSummary,
          );
          const combinedMetric = sumMetricSnapshots(
            primaryMetric,
            secondaryMetric,
          );
          const primaryValue = formatMetricValue(
            combinedMetric.current,
            kpi.primary.kind,
          );
          const secondaryValue = formatMetricValue(
            secondaryMetric.current,
            kpi.secondary.kind,
          );
          const primaryDeltaDescription = t("deltaVsPrevious", {
            delta: formatDelta(combinedMetric.delta, kpi.primary.kind),
            previous: formatMetricValue(
              combinedMetric.previous,
              kpi.primary.kind,
            ),
          });

          return (
            <Card key={kpi.labelKey} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{t(kpi.labelKey)}</CardTitle>
                  <DeltaBadge
                    metric={combinedMetric}
                    kind={kpi.primary.kind}
                    title={primaryDeltaDescription}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <div className="text-2xl font-semibold tracking-tight">
                    {primaryValue}
                  </div>
                  <div className="pb-1 text-xs text-muted-foreground">
                    {t("reasoningIncluded", { value: secondaryValue })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        const metric = getMetricSnapshot(kpi.key, overview, pricingSummary);
        const currentValue = formatMetricValue(metric.current, kpi.kind);
        const previousValue = formatMetricValue(metric.previous, kpi.kind);
        const deltaDescription = t("deltaVsPrevious", {
          delta: formatDelta(metric.delta, kpi.kind),
          previous: previousValue,
        });
        const isEstimatedCostCard = kpi.key === "estimatedCostUsd";

        return (
          <Card key={kpi.key} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <CardTitle>{t(kpi.labelKey)}</CardTitle>
                  {isEstimatedCostCard ? (
                    <PricingMatchDialog rows={modelPricingRows} />
                  ) : null}
                </div>
                <DeltaBadge
                  metric={metric}
                  kind={kpi.kind}
                  title={deltaDescription}
                />
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
