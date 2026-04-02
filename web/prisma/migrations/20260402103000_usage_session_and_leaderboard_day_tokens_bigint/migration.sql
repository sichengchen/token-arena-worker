-- Session and per-day token totals can exceed signed 32-bit integer range.
ALTER TABLE "UsageSession"
  ALTER COLUMN "inputTokens" TYPE BIGINT,
  ALTER COLUMN "outputTokens" TYPE BIGINT,
  ALTER COLUMN "reasoningTokens" TYPE BIGINT,
  ALTER COLUMN "cachedTokens" TYPE BIGINT,
  ALTER COLUMN "totalTokens" TYPE BIGINT;

ALTER TABLE "leaderboard_user_day"
  ALTER COLUMN "inputTokens" TYPE BIGINT,
  ALTER COLUMN "outputTokens" TYPE BIGINT,
  ALTER COLUMN "reasoningTokens" TYPE BIGINT,
  ALTER COLUMN "cachedTokens" TYPE BIGINT,
  ALTER COLUMN "totalTokens" TYPE BIGINT;
