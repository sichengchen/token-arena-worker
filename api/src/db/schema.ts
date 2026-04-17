import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const user = sqliteTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
    usernameNeedsSetup: integer("username_needs_setup", { mode: "boolean" }).default(false),
    usernameAutoAdjusted: integer("username_auto_adjusted", { mode: "boolean" }).default(false),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
    image: text("image"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("user_email_idx").on(table.email),
  }),
);

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export const session = sqliteTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    expiresAt: text("expires_at").notNull(),
    token: text("token").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdx: index("session_user_idx").on(table.userId),
  }),
);

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------
export const account = sqliteTable(
  "account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: text("access_token_expires_at"),
    refreshTokenExpiresAt: text("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userIdx: index("account_user_idx").on(table.userId),
  }),
);

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
export const verification = sqliteTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
);

// ---------------------------------------------------------------------------
// UsagePreference
// ---------------------------------------------------------------------------
export const usagePreference = sqliteTable("usage_preference", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  locale: text("locale").default("en"),
  theme: text("theme").default("system"),
  timezone: text("timezone").default("UTC"),
  projectMode: text("project_mode").default("hashed"),
  publicProfileEnabled: integer("public_profile_enabled", { mode: "boolean" }).default(true),
  bio: text("bio"),
  projectHashSalt: text("project_hash_salt").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------------------------------------------------------------------------
// Follow
// ---------------------------------------------------------------------------
export const follow = sqliteTable(
  "follow",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tag: text("tag"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    followerCreatedIdx: index("follow_follower_created_idx").on(table.followerId, table.createdAt),
    followerTagIdx: index("follow_follower_tag_idx").on(
      table.followerId,
      table.tag,
      table.createdAt,
    ),
    followingCreatedIdx: index("follow_following_created_idx").on(
      table.followingId,
      table.createdAt,
    ),
    uniqueFollowerFollowing: uniqueIndex("follow_unique").on(table.followerId, table.followingId),
  }),
);

// ---------------------------------------------------------------------------
// UsageApiKey
// ---------------------------------------------------------------------------
export const usageApiKey = sqliteTable(
  "usage_api_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    status: text("status").default("active"),
    lastUsedAt: text("last_used_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userStatusIdx: index("api_key_user_status_idx").on(table.userId, table.status),
  }),
);

// ---------------------------------------------------------------------------
// Device
// ---------------------------------------------------------------------------
export const device = sqliteTable(
  "device",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    hostname: text("hostname").notNull(),
    firstSeenAt: text("first_seen_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull(),
    lastApiKeyId: text("last_api_key_id"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userDeviceIdx: uniqueIndex("device_user_device_idx").on(table.userId, table.deviceId),
  }),
);

// ---------------------------------------------------------------------------
// UsageBucket
// ---------------------------------------------------------------------------
export const usageBucket = sqliteTable(
  "usage_bucket",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    apiKeyId: text("api_key_id"),
    deviceId: text("device_id").notNull(),
    source: text("source").notNull(),
    model: text("model").notNull(),
    projectKey: text("project_key").notNull(),
    projectLabel: text("project_label").notNull(),
    bucketStart: text("bucket_start").notNull(),
    inputTokens: text("input_tokens").notNull().default("0"),
    outputTokens: text("output_tokens").notNull().default("0"),
    reasoningTokens: text("reasoning_tokens").notNull().default("0"),
    cachedTokens: text("cached_tokens").notNull().default("0"),
    totalTokens: text("total_tokens").notNull().default("0"),
    estimatedCostUsd: real("estimated_cost_usd"),
    estimatedInputUsd: real("estimated_input_usd"),
    estimatedOutputUsd: real("estimated_output_usd"),
    estimatedReasoningUsd: real("estimated_reasoning_usd"),
    estimatedCacheUsd: real("estimated_cache_usd"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    bucketUniqueIdx: uniqueIndex("bucket_unique_idx").on(
      table.userId,
      table.deviceId,
      table.source,
      table.model,
      table.projectKey,
      table.bucketStart,
    ),
    userBucketStartIdx: index("bucket_user_bucket_start_idx").on(table.userId, table.bucketStart),
  }),
);

// ---------------------------------------------------------------------------
// UsageSession
// ---------------------------------------------------------------------------
export const usageSession = sqliteTable(
  "usage_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    apiKeyId: text("api_key_id"),
    deviceId: text("device_id").notNull(),
    source: text("source").notNull(),
    projectKey: text("project_key").notNull(),
    projectLabel: text("project_label").notNull(),
    sessionHash: text("session_hash").notNull(),
    firstMessageAt: text("first_message_at").notNull(),
    lastMessageAt: text("last_message_at").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    activeSeconds: integer("active_seconds").notNull(),
    inputTokens: text("input_tokens").notNull().default("0"),
    outputTokens: text("output_tokens").notNull().default("0"),
    reasoningTokens: text("reasoning_tokens").notNull().default("0"),
    cachedTokens: text("cached_tokens").notNull().default("0"),
    totalTokens: text("total_tokens").notNull().default("0"),
    primaryModel: text("primary_model").notNull().default(""),
    estimatedCostUsd: real("estimated_cost_usd"),
    messageCount: integer("message_count").notNull(),
    userMessageCount: integer("user_message_count").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    sessionUniqueIdx: uniqueIndex("session_unique_idx").on(
      table.userId,
      table.deviceId,
      table.source,
      table.sessionHash,
    ),
    userFirstMessageIdx: index("session_user_first_message_idx").on(
      table.userId,
      table.firstMessageAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// LeaderboardUserDay
// ---------------------------------------------------------------------------
export const leaderboardUserDay = sqliteTable(
  "leaderboard_user_day",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    statDate: text("stat_date").notNull(),
    inputTokens: text("input_tokens").notNull().default("0"),
    outputTokens: text("output_tokens").notNull().default("0"),
    reasoningTokens: text("reasoning_tokens").notNull().default("0"),
    cachedTokens: text("cached_tokens").notNull().default("0"),
    totalTokens: text("total_tokens").notNull().default("0"),
    activeSeconds: integer("active_seconds").notNull().default(0),
    sessions: integer("sessions").notNull().default(0),
    messages: integer("messages").notNull().default(0),
    userMessages: integer("user_messages").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userStatDateIdx: uniqueIndex("leaderboard_day_unique_idx").on(table.userId, table.statDate),
    statDateUserIdx: index("leaderboard_day_stat_date_idx").on(table.statDate, table.userId),
  }),
);

// ---------------------------------------------------------------------------
// LeaderboardSnapshot
// ---------------------------------------------------------------------------
export const leaderboardSnapshot = sqliteTable("leaderboard_snapshot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  period: text("period").notNull().unique(),
  windowStart: text("window_start"),
  windowEnd: text("window_end"),
  generatedAt: text("generated_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------------------------------------------------------------------------
// LeaderboardSnapshotEntry
// ---------------------------------------------------------------------------
export const leaderboardSnapshotEntry = sqliteTable(
  "leaderboard_snapshot_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => leaderboardSnapshot.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    inputTokens: text("input_tokens").notNull().default("0"),
    outputTokens: text("output_tokens").notNull().default("0"),
    reasoningTokens: text("reasoning_tokens").notNull().default("0"),
    cachedTokens: text("cached_tokens").notNull().default("0"),
    totalTokens: text("total_tokens").notNull().default("0"),
    activeSeconds: integer("active_seconds").notNull().default(0),
    sessions: integer("sessions").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    snapshotUserIdx: uniqueIndex("snapshot_entry_unique_idx").on(table.snapshotId, table.userId),
    snapshotRankIdx: uniqueIndex("snapshot_entry_rank_unique_idx").on(table.snapshotId, table.rank),
    snapshotRankIndexIdx: index("snapshot_entry_rank_idx").on(table.snapshotId, table.rank),
    userRankIdx: index("snapshot_entry_user_rank_idx").on(table.userId, table.rank),
  }),
);

// ---------------------------------------------------------------------------
// UserAchievement
// ---------------------------------------------------------------------------
export const userAchievement = sqliteTable(
  "user_achievement",
  {
    userId: text("user_id").notNull(),
    code: text("code").notNull(),
    awardCount: integer("award_count").notNull().default(0),
    firstAwardedAt: text("first_awarded_at"),
    lastAwardedAt: text("last_awarded_at"),
    state: text("state"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    pk: uniqueIndex("user_achievement_pk").on(table.userId, table.code),
    userLastAwardedIdx: index("user_achievement_last_awarded_idx").on(
      table.userId,
      table.lastAwardedAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// AchievementAward
// ---------------------------------------------------------------------------
export const achievementAward = sqliteTable(
  "achievement_award",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    awardedAt: text("awarded_at").notNull(),
    source: text("source").notNull(),
    sourceRef: text("source_ref"),
    dedupeKey: text("dedupe_key").notNull().unique(),
    pointsAwarded: integer("points_awarded").notNull(),
    progressValue: real("progress_value"),
    thresholdValue: real("threshold_value"),
    context: text("context"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userAwardedAtIdx: index("award_user_awarded_at_idx").on(table.userId, table.awardedAt),
    userCodeAwardedAtIdx: index("award_user_code_awarded_at_idx").on(
      table.userId,
      table.code,
      table.awardedAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// LeaderboardPeriodResult
// ---------------------------------------------------------------------------
export const leaderboardPeriodResult = sqliteTable(
  "leaderboard_period_result",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    period: text("period").notNull(),
    timezone: text("timezone").default("Asia/Shanghai"),
    windowStart: text("window_start"),
    windowEnd: text("window_end"),
    finalizedAt: text("finalized_at").notNull(),
    badgesIssuedAt: text("badges_issued_at"),
  },
  (table) => ({
    periodWindowIdx: uniqueIndex("period_result_unique_idx").on(
      table.period,
      table.windowStart,
      table.windowEnd,
    ),
    periodEndIdx: index("period_result_end_idx").on(table.period, table.windowEnd),
  }),
);

// ---------------------------------------------------------------------------
// LeaderboardPeriodEntry
// ---------------------------------------------------------------------------
export const leaderboardPeriodEntry = sqliteTable(
  "leaderboard_period_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resultId: text("result_id")
      .notNull()
      .references(() => leaderboardPeriodResult.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    inputTokens: text("input_tokens").notNull().default("0"),
    outputTokens: text("output_tokens").notNull().default("0"),
    reasoningTokens: text("reasoning_tokens").notNull().default("0"),
    cachedTokens: text("cached_tokens").notNull().default("0"),
    totalTokens: text("total_tokens").notNull().default("0"),
    activeSeconds: integer("active_seconds").notNull().default(0),
    sessions: integer("sessions").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    resultUserIdx: uniqueIndex("period_entry_result_user_idx").on(table.resultId, table.userId),
    resultRankIdx: uniqueIndex("period_entry_result_rank_idx").on(table.resultId, table.rank),
    resultRankIndexIdx: index("period_entry_rank_idx").on(table.resultId, table.rank),
    userCreatedIdx: index("period_entry_user_created_idx").on(table.userId, table.createdAt),
  }),
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type UsagePreference = typeof usagePreference.$inferSelect;
export type Follow = typeof follow.$inferSelect;
export type UsageApiKey = typeof usageApiKey.$inferSelect;
export type Device = typeof device.$inferSelect;
export type UsageBucket = typeof usageBucket.$inferSelect;
export type UsageSession = typeof usageSession.$inferSelect;
export type LeaderboardUserDay = typeof leaderboardUserDay.$inferSelect;
export type LeaderboardSnapshot = typeof leaderboardSnapshot.$inferSelect;
export type LeaderboardSnapshotEntry = typeof leaderboardSnapshotEntry.$inferSelect;
export type UserAchievement = typeof userAchievement.$inferSelect;
export type AchievementAward = typeof achievementAward.$inferSelect;
export type LeaderboardPeriodResult = typeof leaderboardPeriodResult.$inferSelect;
export type LeaderboardPeriodEntry = typeof leaderboardPeriodEntry.$inferSelect;
