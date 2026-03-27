"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercentage, formatTokenCount } from "@/lib/usage/format";
import type { BreakdownRow, UsageBreakdowns } from "@/lib/usage/types";
import { CollapsibleSection } from "./collapsible-section";

type BreakdownGridProps = {
  breakdowns: UsageBreakdowns;
  defaultOpen?: boolean;
};

type BreakdownMetric = "messages" | "sessions" | "totalTokens";
type BreakdownKey = keyof UsageBreakdowns;
type BreakdownChartDatum = {
  key: string;
  name: string;
  shortName: string;
  value: number;
  valueLabel: string;
  share: number;
  totalTokens: number;
  sessions: number;
  messages: number;
};

const cards = [
  {
    key: "devices",
    labelKey: "devices",
    emptyLabelKey: "devices",
  },
  {
    key: "tools",
    labelKey: "tools",
    emptyLabelKey: "tools",
  },
  {
    key: "models",
    labelKey: "models",
    emptyLabelKey: "models",
  },
  {
    key: "projects",
    labelKey: "projects",
    emptyLabelKey: "projects",
  },
] as const satisfies Array<{
  key: BreakdownKey;
  labelKey: "devices" | "models" | "projects" | "tools";
  emptyLabelKey: "devices" | "models" | "projects" | "tools";
}>;

const maxVisibleRows = 5;

function aggregateRows(rows: BreakdownRow[], name: string): BreakdownRow {
  return rows.reduce<BreakdownRow>(
    (result, row) => {
      result.totalTokens += row.totalTokens;
      result.inputTokens += row.inputTokens;
      result.outputTokens += row.outputTokens;
      result.reasoningTokens += row.reasoningTokens;
      result.cachedTokens += row.cachedTokens;
      result.activeSeconds += row.activeSeconds;
      result.sessions += row.sessions;
      result.messages += row.messages;
      result.userMessages += row.userMessages;
      result.share += row.share;

      return result;
    },
    {
      key: "__others__",
      name,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      cachedTokens: 0,
      activeSeconds: 0,
      sessions: 0,
      messages: 0,
      userMessages: 0,
      share: 0,
    },
  );
}

function getDisplayRows(rows: BreakdownRow[], otherLabel: string) {
  if (rows.length <= maxVisibleRows) {
    return rows;
  }

  return [
    ...rows.slice(0, maxVisibleRows - 1),
    aggregateRows(rows.slice(maxVisibleRows - 1), otherLabel),
  ];
}

function getMetricValue(row: BreakdownRow, metric: BreakdownMetric) {
  switch (metric) {
    case "messages":
      return row.messages;
    case "sessions":
      return row.sessions;
    case "totalTokens":
      return row.totalTokens;
  }
}

function resolveMetric(rows: BreakdownRow[]): BreakdownMetric {
  if (rows.some((row) => row.totalTokens > 0)) {
    return "totalTokens";
  }

  if (rows.some((row) => row.sessions > 0)) {
    return "sessions";
  }

  return "messages";
}

function sortRowsByMetric(rows: BreakdownRow[], metric: BreakdownMetric) {
  return [...rows].sort((left, right) => {
    const diff = getMetricValue(right, metric) - getMetricValue(left, metric);

    if (diff !== 0) {
      return diff;
    }

    return right.totalTokens - left.totalTokens;
  });
}

function getMetricShare(
  rows: BreakdownRow[],
  row: BreakdownRow,
  metric: BreakdownMetric,
) {
  const total = rows.reduce(
    (sum, item) => sum + getMetricValue(item, metric),
    0,
  );

  if (total === 0) {
    return 0;
  }

  return getMetricValue(row, metric) / total;
}

function getMetricLabelKey(metric: BreakdownMetric) {
  switch (metric) {
    case "messages":
      return "messages";
    case "sessions":
      return "sessions";
    case "totalTokens":
      return "totalTokens";
  }
}

function formatMetricValue(value: number) {
  return formatTokenCount(value);
}

function truncateLabel(value: string, maxLength = 14) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function toChartData(
  rows: BreakdownRow[],
  metric: BreakdownMetric,
): BreakdownChartDatum[] {
  return rows.map((row) => {
    const value = getMetricValue(row, metric);

    return {
      key: row.key,
      name: row.name,
      shortName: truncateLabel(row.name),
      value,
      valueLabel: formatMetricValue(value),
      share: getMetricShare(rows, row, metric),
      totalTokens: row.totalTokens,
      sessions: row.sessions,
      messages: row.messages,
    };
  });
}

type BreakdownTooltipContentProps = {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload?: BreakdownChartDatum;
  }>;
  metric: BreakdownMetric;
  locale: string;
};

function BreakdownTooltipContent({
  active,
  payload,
  metric,
  locale,
}: BreakdownTooltipContentProps) {
  const t = useTranslations("usage.breakdowns.table");
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-lg border bg-background/95 p-3 shadow-md">
      <div className="mb-3 text-sm font-medium text-foreground">
        {point.name}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted-foreground">
            {t(getMetricLabelKey(metric))}
          </span>
          <span className="font-medium text-foreground">
            {formatMetricValue(point.value)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted-foreground">{t("share")}</span>
          <span className="font-medium text-foreground">
            {formatPercentage(point.share, locale)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted-foreground">{t("sessions")}</span>
          <span className="font-medium text-foreground">
            {formatMetricValue(point.sessions)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted-foreground">{t("messages")}</span>
          <span className="font-medium text-foreground">
            {formatMetricValue(point.messages)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BreakdownGrid({
  breakdowns,
  defaultOpen = false,
}: BreakdownGridProps) {
  const locale = useLocale();
  const t = useTranslations("usage.breakdowns");

  return (
    <CollapsibleSection
      title={t("title")}
      description={t("description")}
      defaultOpen={defaultOpen}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => {
          const metric = resolveMetric(breakdowns[card.key]);
          const rows = getDisplayRows(
            sortRowsByMetric(breakdowns[card.key], metric),
            t("others"),
          );
          const chartData = toChartData(rows, metric);
          const chartHeight = Math.max(chartData.length * 40 + 20, 196);

          return (
            <Card key={card.key} size="sm" className="min-h-[280px]">
              <CardHeader className="pb-2">
                <CardTitle>{t(`tabs.${card.labelKey}`)}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {chartData.length === 0 ? (
                  <div className="flex flex-1 items-center rounded-xl border border-dashed px-4 text-sm text-muted-foreground">
                    {t(`empty.${card.emptyLabelKey}`)}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col">
                    <div
                      className="w-full flex-1"
                      style={{ height: `${chartHeight}px` }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatMetricValue}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="shortName"
                            width={104}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                            content={(props) => (
                              <BreakdownTooltipContent
                                {...props}
                                metric={metric}
                                locale={locale}
                              />
                            )}
                          />
                          <Bar
                            dataKey="value"
                            radius={[0, 6, 6, 0]}
                            background={{ fill: "var(--muted)" }}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={entry.key}
                                fill="var(--chart-1)"
                                fillOpacity={Math.max(1 - index * 0.14, 0.35)}
                              />
                            ))}
                            <LabelList
                              dataKey="valueLabel"
                              position="right"
                              offset={10}
                              fill="var(--foreground)"
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
