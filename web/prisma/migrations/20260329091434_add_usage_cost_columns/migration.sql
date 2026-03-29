-- AlterTable
ALTER TABLE "UsageBucket" ADD COLUMN     "estimatedCacheUsd" DOUBLE PRECISION,
ADD COLUMN     "estimatedCostUsd" DOUBLE PRECISION,
ADD COLUMN     "estimatedInputUsd" DOUBLE PRECISION,
ADD COLUMN     "estimatedOutputUsd" DOUBLE PRECISION,
ADD COLUMN     "estimatedReasoningUsd" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UsageSession" ADD COLUMN     "cachedTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedCostUsd" DOUBLE PRECISION,
ADD COLUMN     "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reasoningTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTokens" INTEGER NOT NULL DEFAULT 0;
