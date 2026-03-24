import type { DailyUsageSummary } from "../domain/types";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function printDailySummary(summary: DailyUsageSummary): void {
  console.log(`\nToken usage for ${summary.date}`);
  console.log("=".repeat(48));
  console.log(`Total input      ${formatNumber(summary.totalInputTokens)}`);
  console.log(`Total output     ${formatNumber(summary.totalOutputTokens)}`);
  console.log(
    `Cache read       ${formatNumber(summary.totalCacheReadTokens)}`,
  );
  console.log(
    `Cache write      ${formatNumber(summary.totalCacheWriteTokens)}`,
  );
  console.log(`Grand total      ${formatNumber(summary.totalTokens)}`);
  console.log("\nPer agent");

  for (const agent of summary.agents) {
    console.log(
      `- ${agent.agent}: ${formatNumber(agent.totalTokens)} tokens (${agent.events} events)`,
    );
  }
}
