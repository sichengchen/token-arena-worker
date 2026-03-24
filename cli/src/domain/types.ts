export interface TokenUsageEvent {
  agent: string;
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  model?: string;
  source?: string;
}

export interface AgentDailyUsageSummary {
  agent: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  events: number;
}

export interface DailyUsageSummary {
  date: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  totalTokens: number;
  agents: AgentDailyUsageSummary[];
}
