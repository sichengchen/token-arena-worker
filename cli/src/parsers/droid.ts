import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { aggregateToBuckets } from "../domain/aggregator";
import { extractSessions } from "../domain/session-extractor";
import type {
  ParseResult,
  SessionEvent,
  TokenUsageEntry,
} from "../domain/types";
import { readFileSafe } from "../infrastructure/fs/utils";
import { registerParser } from "./registry";
import type { IParser, ToolDefinition } from "./types";

const TOOL_ID = "droid";
const TOOL_NAME = "Droid";
const DEFAULT_DATA_DIR = join(homedir(), ".factory", "sessions");

interface DroidMessageEvent {
  type?: string;
  timestamp?: string;
  message?: {
    role?: string;
  };
}

interface DroidSettings {
  model?: string;
  tokenUsage?: {
    inputTokens?: unknown;
    outputTokens?: unknown;
    cacheReadTokens?: unknown;
    thinkingTokens?: unknown;
  };
}

function createToolDefinition(dataDir: string): ToolDefinition {
  return {
    id: TOOL_ID,
    name: TOOL_NAME,
    dataDir,
  };
}

function findSessionFiles(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...findSessionFiles(fullPath));
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".jsonl") &&
        !entry.name.endsWith(".settings.json")
      ) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore unreadable directories and keep scanning.
  }

  return results;
}

export function extractDroidProject(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "unknown";
}

function toSafeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export class DroidParser implements IParser {
  readonly tool: ToolDefinition;

  constructor(private readonly dataDir = DEFAULT_DATA_DIR) {
    this.tool = createToolDefinition(dataDir);
  }

  async parse(): Promise<ParseResult> {
    const sessionFiles = findSessionFiles(this.dataDir);
    if (sessionFiles.length === 0) {
      return { buckets: [], sessions: [] };
    }

    const entries: TokenUsageEntry[] = [];
    const sessionEvents: SessionEvent[] = [];

    for (const filePath of sessionFiles) {
      const sessionId = filePath;
      const project = extractDroidProject(basename(dirname(filePath)));
      let firstMessageTimestamp: Date | null = null;

      const content = readFileSafe(filePath);
      if (!content) continue;

      for (const line of content.split("\n")) {
        if (!line.trim()) continue;

        let obj: DroidMessageEvent;
        try {
          obj = JSON.parse(line) as DroidMessageEvent;
        } catch {
          continue;
        }

        if (obj.type !== "message" || !obj.timestamp) continue;

        const timestamp = new Date(obj.timestamp);
        if (Number.isNaN(timestamp.getTime())) continue;

        const role = obj.message?.role;
        if (role !== "user" && role !== "assistant") continue;

        if (firstMessageTimestamp === null) {
          firstMessageTimestamp = timestamp;
        }

        sessionEvents.push({
          sessionId,
          source: TOOL_ID,
          project,
          timestamp,
          role,
        });
      }

      const settingsPath = join(
        dirname(filePath),
        `${basename(filePath, ".jsonl")}.settings.json`,
      );
      const settingsContent = readFileSafe(settingsPath);
      if (!settingsContent || firstMessageTimestamp === null) continue;

      let settings: DroidSettings;
      try {
        settings = JSON.parse(settingsContent) as DroidSettings;
      } catch {
        continue;
      }

      const tokenUsage = settings.tokenUsage;
      if (!tokenUsage) continue;

      const cachedTokens = toSafeNumber(tokenUsage.cacheReadTokens);
      const reasoningTokens = toSafeNumber(tokenUsage.thinkingTokens);
      const inputTokens = Math.max(
        0,
        toSafeNumber(tokenUsage.inputTokens) - cachedTokens,
      );
      const outputTokens = Math.max(
        0,
        toSafeNumber(tokenUsage.outputTokens) - reasoningTokens,
      );

      if (
        inputTokens === 0 &&
        outputTokens === 0 &&
        cachedTokens === 0 &&
        reasoningTokens === 0
      ) {
        continue;
      }

      entries.push({
        sessionId,
        source: TOOL_ID,
        model: settings.model || "unknown",
        project,
        timestamp: firstMessageTimestamp,
        inputTokens,
        outputTokens,
        reasoningTokens,
        cachedTokens,
      });
    }

    return {
      buckets: aggregateToBuckets(entries),
      sessions: extractSessions(sessionEvents, entries),
    };
  }

  isInstalled(): boolean {
    return existsSync(this.dataDir);
  }
}

registerParser(new DroidParser());
