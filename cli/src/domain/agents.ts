export const SUPPORTED_AGENTS = [
  "codex",
  "claude-code",
  "cursor",
  "aider",
] as const;

export type SupportedAgent = (typeof SUPPORTED_AGENTS)[number];
