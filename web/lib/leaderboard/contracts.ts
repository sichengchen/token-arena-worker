import { z } from "zod";
import { followTagFilterSchema } from "@/lib/social/contracts";
import { leaderboardMetrics, leaderboardPeriods } from "./types";

export const leaderboardPeriodSchema = z.enum(leaderboardPeriods);
export const leaderboardMetricSchema = z.enum(leaderboardMetrics);
export const leaderboardTagFilterSchema = followTagFilterSchema;

export const leaderboardQuerySchema = z.object({
  period: leaderboardPeriodSchema.optional(),
  metric: leaderboardMetricSchema.optional(),
  tag: leaderboardTagFilterSchema.optional(),
});
