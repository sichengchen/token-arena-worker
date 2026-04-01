import { randomBytes } from "node:crypto";
import { addDays } from "date-fns";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { FollowTag } from "../generated/prisma/enums";
import {
  resolveLeaderboardWindow,
  startOfShanghaiDay,
} from "../lib/leaderboard/date";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/** Stable test users; safe to re-run (upsert by email). */
const MOCK_USERS = [
  {
    id: "mock_user_001",
    name: "Mock Alice",
    username: "mock_alice",
    email: "mock-alice@local.test",
  },
  {
    id: "mock_user_002",
    name: "Mock Bob",
    username: "mock_bob",
    email: "mock-bob@local.test",
  },
  {
    id: "mock_user_003",
    name: "Mock Carol",
    username: "mock_carol",
    email: "mock-carol@local.test",
  },
  {
    id: "mock_user_004",
    name: "Mock David",
    username: "mock_david",
    email: "mock-david@local.test",
  },
  {
    id: "mock_user_005",
    name: "Mock Erin",
    username: "mock_erin",
    email: "mock-erin@local.test",
  },
] as const;

/** Target weekly totalTokens per user (descending rank). */
const MOCK_WEEKLY_TOTAL_TOKENS = [
  2_500_000, 1_800_000, 1_200_000, 700_000, 350_000,
] as const;

const SEED_DEVICE_ID = "mock_seed_device";
const SEED_SOURCE = "seed";
const SEED_MODEL = "gpt-4o";
const SEED_PROJECT_KEY = "seed-proj";
const SEED_PROJECT_LABEL = "Seed project";

const MOCK_FOLLOW_EDGES: Array<[string, string]> = [
  ["mock_user_001", "mock_user_002"],
  ["mock_user_001", "mock_user_003"],
  ["mock_user_002", "mock_user_003"],
  ["mock_user_002", "mock_user_004"],
  ["mock_user_003", "mock_user_004"],
  ["mock_user_004", "mock_user_005"],
];

function randomProjectHashSalt() {
  return randomBytes(32).toString("hex");
}

function splitWeeklyTotalAcrossDays(weeklyTotal: number, dayCount: number) {
  const base = Math.floor(weeklyTotal / dayCount);
  const remainder = weeklyTotal - base * dayCount;
  return Array.from({ length: dayCount }, (_, index) =>
    index === 0 ? base + remainder : base,
  );
}

function distributeTokens(total: number) {
  const inputTokens = Math.floor(total * 0.45);
  const outputTokens = total - inputTokens;
  return { inputTokens, outputTokens };
}

async function seedLeaderboardDaysAndBuckets(userIds: string[]) {
  const now = new Date();
  const week = resolveLeaderboardWindow("week", now);
  if (!week.start || !week.end) {
    return;
  }

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(week.start, i);
    if (day.getTime() >= week.end.getTime()) {
      break;
    }
    weekDays.push(startOfShanghaiDay(day));
  }

  if (weekDays.length === 0) {
    return;
  }

  for (let userIndex = 0; userIndex < userIds.length; userIndex++) {
    const userId = userIds[userIndex];
    const weeklyTotal = MOCK_WEEKLY_TOTAL_TOKENS[userIndex] ?? 100_000;
    const perDayTotals = splitWeeklyTotalAcrossDays(
      weeklyTotal,
      weekDays.length,
    );

    for (let d = 0; d < weekDays.length; d++) {
      const statDate = weekDays[d];
      const totalTokens = perDayTotals[d] ?? 0;
      const { inputTokens, outputTokens } = distributeTokens(totalTokens);
      const sessions = 4 + userIndex + (d % 3);
      const activeSeconds = 900 * sessions;

      await prisma.leaderboardUserDay.upsert({
        where: {
          userId_statDate: {
            userId,
            statDate,
          },
        },
        create: {
          userId,
          statDate,
          inputTokens,
          outputTokens,
          reasoningTokens: 0,
          cachedTokens: 0,
          totalTokens,
          activeSeconds,
          sessions,
          messages: 20 + d * 5,
          userMessages: 10 + d * 3,
        },
        update: {
          inputTokens,
          outputTokens,
          reasoningTokens: 0,
          cachedTokens: 0,
          totalTokens,
          activeSeconds,
          sessions,
          messages: 20 + d * 5,
          userMessages: 10 + d * 3,
        },
      });

      await prisma.usageBucket.upsert({
        where: {
          userId_deviceId_source_model_projectKey_bucketStart: {
            userId,
            deviceId: SEED_DEVICE_ID,
            source: SEED_SOURCE,
            model: SEED_MODEL,
            projectKey: SEED_PROJECT_KEY,
            bucketStart: statDate,
          },
        },
        create: {
          userId,
          deviceId: SEED_DEVICE_ID,
          source: SEED_SOURCE,
          model: SEED_MODEL,
          projectKey: SEED_PROJECT_KEY,
          projectLabel: SEED_PROJECT_LABEL,
          bucketStart: statDate,
          inputTokens,
          outputTokens,
          reasoningTokens: 0,
          cachedTokens: 0,
          totalTokens,
        },
        update: {
          inputTokens,
          outputTokens,
          reasoningTokens: 0,
          cachedTokens: 0,
          totalTokens,
          projectLabel: SEED_PROJECT_LABEL,
        },
      });
    }
  }
}

async function seedFollows() {
  for (const [followerId, followingId] of MOCK_FOLLOW_EDGES) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      create: {
        followerId,
        followingId,
        tag: FollowTag.peer,
      },
      update: {
        tag: FollowTag.peer,
      },
    });
  }
}

async function main() {
  const resolvedIds: string[] = [];

  for (const u of MOCK_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        emailVerified: true,
        usernameNeedsSetup: false,
        usernameAutoAdjusted: false,
      },
      update: {
        name: u.name,
        username: u.username,
        emailVerified: true,
        usernameNeedsSetup: false,
        usernameAutoAdjusted: false,
      },
    });

    resolvedIds.push(user.id);

    await prisma.usagePreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        projectHashSalt: randomProjectHashSalt(),
        publicProfileEnabled: true,
        bio: `Seeded mock account (${u.username})`,
      },
      update: {
        publicProfileEnabled: true,
        bio: `Seeded mock account (${u.username})`,
      },
    });
  }

  await seedLeaderboardDaysAndBuckets(resolvedIds);
  await seedFollows();

  console.log(
    `Seeded ${MOCK_USERS.length} mock users (${MOCK_USERS.map((x) => x.username).join(", ")}), leaderboard days + usage buckets for the current Shanghai week, and ${MOCK_FOLLOW_EDGES.length} follow edges.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
