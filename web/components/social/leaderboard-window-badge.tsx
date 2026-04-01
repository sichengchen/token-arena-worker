import {
  formatLeaderboardWindowLabel,
  SHANGHAI_TIMEZONE,
} from "@/lib/leaderboard/date";
import type { LeaderboardPeriod } from "@/lib/leaderboard/types";

type LeaderboardWindowBadgeProps = {
  locale: string;
  period: LeaderboardPeriod;
  windowStart: string | null;
  windowEnd: string | null;
};

export function LeaderboardWindowBadge({
  locale,
  period,
  windowStart,
  windowEnd,
}: LeaderboardWindowBadgeProps) {
  const label = formatLeaderboardWindowLabel({
    period,
    windowStart,
    windowEnd,
    locale,
    timezone: SHANGHAI_TIMEZONE,
  });

  if (!label) {
    return null;
  }

  return (
    <span className="inline-flex h-8 shrink-0 items-center text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}
