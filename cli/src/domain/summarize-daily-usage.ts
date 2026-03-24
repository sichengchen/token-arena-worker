import type {
  AgentDailyUsageSummary,
  DailyUsageSummary,
  TokenUsageEvent,
} from "./types";

export function getEventTotalTokens(event: TokenUsageEvent): number {
  return (
    event.inputTokens +
    event.outputTokens +
    (event.cacheReadTokens ?? 0) +
    (event.cacheWriteTokens ?? 0)
  );
}

export function summarizeDailyUsage(
  events: TokenUsageEvent[],
): DailyUsageSummary[] {
  const dailyMap = new Map<string, Map<string, AgentDailyUsageSummary>>();

  for (const event of events) {
    const dateBucket = dailyMap.get(event.date) ?? new Map();
    const currentSummary = dateBucket.get(event.agent) ?? {
      agent: event.agent,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 0,
      events: 0,
    };

    currentSummary.inputTokens += event.inputTokens;
    currentSummary.outputTokens += event.outputTokens;
    currentSummary.cacheReadTokens += event.cacheReadTokens ?? 0;
    currentSummary.cacheWriteTokens += event.cacheWriteTokens ?? 0;
    currentSummary.totalTokens += getEventTotalTokens(event);
    currentSummary.events += 1;

    dateBucket.set(event.agent, currentSummary);
    dailyMap.set(event.date, dateBucket);
  }

  return [...dailyMap.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, agentMap]) => {
      const agents = [...agentMap.values()].sort((left, right) =>
        left.agent.localeCompare(right.agent),
      );

      return {
        date,
        totalInputTokens: agents.reduce(
          (sum, agent) => sum + agent.inputTokens,
          0,
        ),
        totalOutputTokens: agents.reduce(
          (sum, agent) => sum + agent.outputTokens,
          0,
        ),
        totalCacheReadTokens: agents.reduce(
          (sum, agent) => sum + agent.cacheReadTokens,
          0,
        ),
        totalCacheWriteTokens: agents.reduce(
          (sum, agent) => sum + agent.cacheWriteTokens,
          0,
        ),
        totalTokens: agents.reduce((sum, agent) => sum + agent.totalTokens, 0),
        agents,
      };
    });
}
