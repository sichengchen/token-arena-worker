import { achievementDefinitionMap } from "@/lib/achievements/catalog";
import type { AchievementCode } from "@/lib/achievements/types";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { resolveLatestFinalizableLeaderboardWindow } from "./date";
import type { LeaderboardPeriod } from "./types";

export type RankedLeaderboardEntry = {
  userId: string;
  rank: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cachedTokens: number;
  totalTokens: number;
  activeSeconds: number;
  sessions: number;
};

type LeaderboardBadgeAward = {
  userId: string;
  code: AchievementCode;
  awardedAt: Date;
  dedupeKey: string;
  pointsAwarded: number;
  progressValue: number;
  thresholdValue: number;
  sourceRef: string;
  context: Prisma.InputJsonValue;
};

function badgeCodeForPeriod(period: LeaderboardPeriod): AchievementCode | null {
  switch (period) {
    case "day":
      return "leaderboard_day_top50";
    case "week":
      return "leaderboard_week_top50";
    case "month":
      return "leaderboard_month_top50";
    default:
      return null;
  }
}

function badgePoints(code: AchievementCode) {
  return achievementDefinitionMap.get(code)?.points ?? 0;
}

export function buildLeaderboardBadgeAwards(input: {
  period: LeaderboardPeriod;
  windowStart: Date | null;
  windowEnd: Date | null;
  finalizedAt: Date;
  entries: RankedLeaderboardEntry[];
}): LeaderboardBadgeAward[] {
  const code = badgeCodeForPeriod(input.period);

  if (!code || !input.windowStart || !input.windowEnd) {
    return [];
  }

  const windowStart = input.windowStart;
  const windowEnd = input.windowEnd;

  return input.entries
    .filter((entry) => entry.rank <= 50)
    .map((entry) => ({
      userId: entry.userId,
      code,
      awardedAt: input.finalizedAt,
      dedupeKey: `leaderboard:${input.period}:${windowStart.toISOString()}:${entry.userId}:${code}`,
      pointsAwarded: badgePoints(code),
      progressValue: entry.rank,
      thresholdValue: 50,
      sourceRef: `${input.period}:${windowStart.toISOString()}`,
      context: {
        rank: entry.rank,
        totalTokens: entry.totalTokens,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    }));
}

export async function finalizePendingLeaderboardPeriods(now = new Date()) {
  const periods: LeaderboardPeriod[] = ["day", "week", "month"];

  for (const period of periods) {
    const window = resolveLatestFinalizableLeaderboardWindow(period, now);

    if (!window?.start || !window.end) {
      continue;
    }

    const windowStart = window.start;
    const windowEnd = window.end;

    const existing = await prisma.leaderboardPeriodResult.findUnique({
      where: {
        period_windowStart_windowEnd: {
          period,
          windowStart,
          windowEnd,
        },
      },
      select: {
        id: true,
        badgesIssuedAt: true,
      },
    });

    if (existing?.badgesIssuedAt) {
      continue;
    }

    const rows = await prisma.leaderboardUserDay.groupBy({
      by: ["userId"],
      where: {
        statDate: {
          gte: windowStart,
          lt: windowEnd,
        },
        user: {
          usagePreference: {
            is: {
              publicProfileEnabled: true,
            },
          },
        },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        reasoningTokens: true,
        cachedTokens: true,
        totalTokens: true,
        activeSeconds: true,
        sessions: true,
      },
      orderBy: [
        {
          _sum: {
            totalTokens: "desc",
          },
        },
        {
          userId: "asc",
        },
      ],
      take: 100,
    });

    const entries = rows
      .map(
        (row, index): RankedLeaderboardEntry => ({
          userId: row.userId,
          rank: index + 1,
          inputTokens: row._sum.inputTokens ?? 0,
          outputTokens: row._sum.outputTokens ?? 0,
          reasoningTokens: row._sum.reasoningTokens ?? 0,
          cachedTokens: row._sum.cachedTokens ?? 0,
          totalTokens: row._sum.totalTokens ?? 0,
          activeSeconds: row._sum.activeSeconds ?? 0,
          sessions: row._sum.sessions ?? 0,
        }),
      )
      .filter((entry) => entry.totalTokens > 0);
    const awards = buildLeaderboardBadgeAwards({
      period,
      windowStart,
      windowEnd,
      finalizedAt: now,
      entries,
    });

    await prisma.$transaction(async (tx) => {
      const result = await tx.leaderboardPeriodResult.upsert({
        where: {
          period_windowStart_windowEnd: {
            period,
            windowStart,
            windowEnd,
          },
        },
        update: {
          finalizedAt: now,
          timezone: "Asia/Shanghai",
        },
        create: {
          period,
          timezone: "Asia/Shanghai",
          windowStart,
          windowEnd,
          finalizedAt: now,
        },
      });

      await tx.leaderboardPeriodEntry.deleteMany({
        where: {
          resultId: result.id,
        },
      });

      if (entries.length > 0) {
        await tx.leaderboardPeriodEntry.createMany({
          data: entries.map((entry) => ({
            resultId: result.id,
            userId: entry.userId,
            rank: entry.rank,
            inputTokens: BigInt(entry.inputTokens),
            outputTokens: BigInt(entry.outputTokens),
            reasoningTokens: BigInt(entry.reasoningTokens),
            cachedTokens: BigInt(entry.cachedTokens),
            totalTokens: BigInt(entry.totalTokens),
            activeSeconds: entry.activeSeconds,
            sessions: entry.sessions,
          })),
        });
      }

      if (awards.length > 0) {
        const existingAwards = await tx.achievementAward.findMany({
          where: {
            dedupeKey: {
              in: awards.map((award) => award.dedupeKey),
            },
          },
          select: {
            dedupeKey: true,
          },
        });
        const existingKeys = new Set(
          existingAwards.map((award) => award.dedupeKey),
        );
        const nextAwards = awards.filter(
          (award) => !existingKeys.has(award.dedupeKey),
        );

        if (nextAwards.length > 0) {
          await tx.achievementAward.createMany({
            data: nextAwards.map((award) => ({
              userId: award.userId,
              code: award.code,
              awardedAt: award.awardedAt,
              source: "leaderboard",
              sourceRef: award.sourceRef,
              dedupeKey: award.dedupeKey,
              pointsAwarded: award.pointsAwarded,
              progressValue: award.progressValue,
              thresholdValue: award.thresholdValue,
              context: award.context,
            })),
          });

          for (const award of nextAwards) {
            await tx.userAchievement.upsert({
              where: {
                userId_code: {
                  userId: award.userId,
                  code: award.code,
                },
              },
              update: {
                awardCount: {
                  increment: 1,
                },
                lastAwardedAt: award.awardedAt,
              },
              create: {
                userId: award.userId,
                code: award.code,
                awardCount: 1,
                firstAwardedAt: award.awardedAt,
                lastAwardedAt: award.awardedAt,
              },
            });
          }
        }
      }

      await tx.leaderboardPeriodResult.update({
        where: {
          id: result.id,
        },
        data: {
          badgesIssuedAt: now,
        },
      });
    });
  }
}
