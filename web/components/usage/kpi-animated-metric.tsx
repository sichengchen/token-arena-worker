"use client";

import { useCallback } from "react";

import CountUp from "@/components/ui/count-up";
import { formatKpiDelta, formatKpiMetricValue, type KpiMetricKind } from "@/lib/usage/kpi-format";

export type { KpiMetricKind };

export function AnimatedKpiValue({
  kind,
  to,
  from = 0,
  className,
}: {
  kind: KpiMetricKind;
  to: number;
  from?: number;
  className?: string;
}) {
  const format = useCallback((n: number) => formatKpiMetricValue(n, kind), [kind]);

  return <CountUp to={to} from={from} format={format} className={className} duration={0.1} />;
}

export function AnimatedKpiDelta({
  kind,
  delta,
  className,
}: {
  kind: KpiMetricKind;
  delta: number;
  className?: string;
}) {
  const format = useCallback((n: number) => formatKpiDelta(n, kind), [kind]);

  return <CountUp to={delta} from={0} format={format} className={className} duration={0.1} />;
}
