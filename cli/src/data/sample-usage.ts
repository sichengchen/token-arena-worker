import type { TokenUsageEvent } from "../domain/types";

export const sampleUsageEvents: TokenUsageEvent[] = [
  {
    agent: "codex",
    date: "2026-03-23",
    inputTokens: 18200,
    outputTokens: 6400,
    cacheReadTokens: 5200,
    model: "gpt-5.4",
    source: "sample/codex.json",
  },
  {
    agent: "claude-code",
    date: "2026-03-23",
    inputTokens: 21900,
    outputTokens: 7300,
    cacheReadTokens: 1800,
    model: "claude-sonnet",
    source: "sample/claude-code.json",
  },
  {
    agent: "codex",
    date: "2026-03-24",
    inputTokens: 26400,
    outputTokens: 8100,
    cacheReadTokens: 7200,
    cacheWriteTokens: 900,
    model: "gpt-5.4",
    source: "sample/codex.json",
  },
  {
    agent: "cursor",
    date: "2026-03-24",
    inputTokens: 9500,
    outputTokens: 3100,
    model: "claude-sonnet",
    source: "sample/cursor.json",
  },
  {
    agent: "claude-code",
    date: "2026-03-24",
    inputTokens: 17200,
    outputTokens: 5900,
    cacheReadTokens: 2400,
    model: "claude-sonnet",
    source: "sample/claude-code.json",
  },
];
