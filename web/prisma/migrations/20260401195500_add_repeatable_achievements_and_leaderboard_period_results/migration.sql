-- CreateEnum
CREATE TYPE "AchievementAwardSource" AS ENUM ('ingest', 'social', 'leaderboard', 'backfill', 'manual');

-- CreateTable
CREATE TABLE "user_achievement" (
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "awardCount" INTEGER NOT NULL DEFAULT 0,
    "firstAwardedAt" TIMESTAMP(3),
    "lastAwardedAt" TIMESTAMP(3),
    "state" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("userId", "code")
);

-- CreateTable
CREATE TABLE "achievement_award" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "AchievementAwardSource" NOT NULL,
    "sourceRef" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "progressValue" DOUBLE PRECISION,
    "thresholdValue" DOUBLE PRECISION,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_period_result" (
    "id" TEXT NOT NULL,
    "period" "LeaderboardSnapshotPeriod" NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgesIssuedAt" TIMESTAMP(3),

    CONSTRAINT "leaderboard_period_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_period_entry" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "inputTokens" BIGINT NOT NULL DEFAULT 0,
    "outputTokens" BIGINT NOT NULL DEFAULT 0,
    "reasoningTokens" BIGINT NOT NULL DEFAULT 0,
    "cachedTokens" BIGINT NOT NULL DEFAULT 0,
    "totalTokens" BIGINT NOT NULL DEFAULT 0,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_period_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_achievement_userId_lastAwardedAt_idx" ON "user_achievement"("userId", "lastAwardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_award_dedupeKey_key" ON "achievement_award"("dedupeKey");

-- CreateIndex
CREATE INDEX "achievement_award_userId_awardedAt_idx" ON "achievement_award"("userId", "awardedAt" DESC);

-- CreateIndex
CREATE INDEX "achievement_award_userId_code_awardedAt_idx" ON "achievement_award"("userId", "code", "awardedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_period_result_period_windowStart_windowEnd_key" ON "leaderboard_period_result"("period", "windowStart", "windowEnd");

-- CreateIndex
CREATE INDEX "leaderboard_period_result_period_windowEnd_idx" ON "leaderboard_period_result"("period", "windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_period_entry_resultId_userId_key" ON "leaderboard_period_entry"("resultId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_period_entry_resultId_rank_key" ON "leaderboard_period_entry"("resultId", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_period_entry_resultId_rank_idx" ON "leaderboard_period_entry"("resultId", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_period_entry_userId_createdAt_idx" ON "leaderboard_period_entry"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_award" ADD CONSTRAINT "achievement_award_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_period_entry" ADD CONSTRAINT "leaderboard_period_entry_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "leaderboard_period_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_period_entry" ADD CONSTRAINT "leaderboard_period_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Refresh leaderboard aggregates to Shanghai calendar boundaries and invalidate current snapshots.
TRUNCATE TABLE "leaderboard_snapshot_entry", "leaderboard_snapshot", "leaderboard_user_day";

WITH bucket_rows AS (
    SELECT
        "userId",
        timezone(
            'UTC',
            date_trunc('day', timezone('Asia/Shanghai', "bucketStart")) AT TIME ZONE 'Asia/Shanghai'
        ) AS "statDate",
        SUM("inputTokens")::INTEGER AS "inputTokens",
        SUM("outputTokens")::INTEGER AS "outputTokens",
        SUM("reasoningTokens")::INTEGER AS "reasoningTokens",
        SUM("cachedTokens")::INTEGER AS "cachedTokens",
        SUM("totalTokens")::INTEGER AS "totalTokens"
    FROM "UsageBucket"
    GROUP BY "userId", "statDate"
),
session_rows AS (
    SELECT
        "userId",
        timezone(
            'UTC',
            date_trunc('day', timezone('Asia/Shanghai', "firstMessageAt")) AT TIME ZONE 'Asia/Shanghai'
        ) AS "statDate",
        SUM("activeSeconds")::INTEGER AS "activeSeconds",
        COUNT(*)::INTEGER AS "sessions",
        SUM("messageCount")::INTEGER AS "messages",
        SUM("userMessageCount")::INTEGER AS "userMessages"
    FROM "UsageSession"
    GROUP BY "userId", "statDate"
),
merged AS (
    SELECT
        COALESCE(bucket_rows."userId", session_rows."userId") AS "userId",
        COALESCE(bucket_rows."statDate", session_rows."statDate") AS "statDate",
        COALESCE(bucket_rows."inputTokens", 0) AS "inputTokens",
        COALESCE(bucket_rows."outputTokens", 0) AS "outputTokens",
        COALESCE(bucket_rows."reasoningTokens", 0) AS "reasoningTokens",
        COALESCE(bucket_rows."cachedTokens", 0) AS "cachedTokens",
        COALESCE(bucket_rows."totalTokens", 0) AS "totalTokens",
        COALESCE(session_rows."activeSeconds", 0) AS "activeSeconds",
        COALESCE(session_rows."sessions", 0) AS "sessions",
        COALESCE(session_rows."messages", 0) AS "messages",
        COALESCE(session_rows."userMessages", 0) AS "userMessages"
    FROM bucket_rows
    FULL OUTER JOIN session_rows
        ON bucket_rows."userId" = session_rows."userId"
       AND bucket_rows."statDate" = session_rows."statDate"
)
INSERT INTO "leaderboard_user_day" (
    "id",
    "userId",
    "statDate",
    "inputTokens",
    "outputTokens",
    "reasoningTokens",
    "cachedTokens",
    "totalTokens",
    "activeSeconds",
    "sessions",
    "messages",
    "userMessages",
    "createdAt",
    "updatedAt"
)
SELECT
    md5(merged."userId" || ':' || merged."statDate"::TEXT) AS "id",
    merged."userId",
    merged."statDate",
    merged."inputTokens",
    merged."outputTokens",
    merged."reasoningTokens",
    merged."cachedTokens",
    merged."totalTokens",
    merged."activeSeconds",
    merged."sessions",
    merged."messages",
    merged."userMessages",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM merged;
