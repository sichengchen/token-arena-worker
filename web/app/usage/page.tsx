import { redirect } from "next/navigation";

import { ActivityTrendCard } from "@/components/usage/activity-trend-card";
import { BreakdownTabs } from "@/components/usage/breakdown-tabs";
import { EmptyState } from "@/components/usage/empty-state";
import { FiltersBar } from "@/components/usage/filters-bar";
import { KpiGrid } from "@/components/usage/kpi-grid";
import { UsagePageShell } from "@/components/usage/page-shell";
import { TokenTrendCard } from "@/components/usage/token-trend-card";
import { getSessionOrRedirect } from "@/lib/session";
import { dashboardQuerySchema } from "@/lib/usage/contracts";
import { resolveDashboardRange } from "@/lib/usage/date-range";
import { getUsagePreference } from "@/lib/usage/preferences";
import {
  getActivityTrend,
  getBreakdowns,
  getFilterOptions,
  getLastSyncedAt,
  getOverviewMetrics,
  getTokenTrend,
} from "@/lib/usage/queries";
import type { UsageFilters } from "@/lib/usage/types";

type UsagePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveQueryParams(
  params: Record<string, string | string[] | undefined>,
) {
  const parsed = dashboardQuerySchema.safeParse({
    preset: firstValue(params.preset),
    from: firstValue(params.from),
    to: firstValue(params.to),
    apiKeyId: firstValue(params.apiKeyId),
    deviceId: firstValue(params.deviceId),
    source: firstValue(params.source),
    model: firstValue(params.model),
    projectKey: firstValue(params.projectKey),
  });

  if (!parsed.success) {
    redirect("/usage");
  }

  return parsed.data;
}

export default async function UsagePage({ searchParams }: UsagePageProps) {
  const session = await getSessionOrRedirect();
  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const query = resolveQueryParams(resolvedSearchParams);
  const preference = await getUsagePreference(session.user.id);
  const range = resolveDashboardRange({
    preset: query.preset,
    from: query.from,
    to: query.to,
    timezone: preference.timezone,
  });
  const filters: UsageFilters = {
    apiKeyId: query.apiKeyId,
    deviceId: query.deviceId,
    source: query.source,
    model: query.model,
    projectKey: query.projectKey,
  };

  const [
    overview,
    tokenTrend,
    activityTrend,
    breakdowns,
    filterOptions,
    lastSyncedAt,
  ] = await Promise.all([
    getOverviewMetrics({ userId: session.user.id, range, filters }),
    getTokenTrend({ userId: session.user.id, range, filters }),
    getActivityTrend({ userId: session.user.id, range, filters }),
    getBreakdowns({ userId: session.user.id, range, filters }),
    getFilterOptions(session.user.id),
    getLastSyncedAt(session.user.id),
  ]);

  const hasData =
    overview.totalTokens.current > 0 || overview.sessions.current > 0;

  return (
    <UsagePageShell
      activePath="/usage"
      title="Overview"
      description="Track token burn, session activity, and usage breakdowns by device, tool, model, and hashed project."
      email={session.user.email}
      timezone={preference.timezone}
    >
      <div className="space-y-4">
        <FiltersBar
          preset={range.preset}
          range={{
            from: range.from.toISOString(),
            to: range.to.toISOString(),
            timezone: range.timezone,
          }}
          filters={filters}
          options={filterOptions}
          lastSyncedAt={lastSyncedAt?.toISOString() ?? null}
        />

        {hasData ? (
          <>
            <KpiGrid overview={overview} />
            <div className="grid gap-4 xl:grid-cols-2">
              <TokenTrendCard data={tokenTrend} />
              <ActivityTrendCard data={activityTrend} />
            </div>
            <BreakdownTabs breakdowns={breakdowns} />
          </>
        ) : (
          <EmptyState hasKeys={filterOptions.apiKeys.length > 0} />
        )}
      </div>
    </UsagePageShell>
  );
}
