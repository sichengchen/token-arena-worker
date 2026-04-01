import { describe, expect, it, vi } from "vitest";
import {
  generateUniqueUsername,
  resolveCreatedUsername,
} from "./auth-username.server";

describe("generateUniqueUsername", () => {
  it("returns the provided seed when the username is available", async () => {
    const username = await generateUniqueUsername("alice", {
      findUserByUsername: vi.fn().mockResolvedValue(null),
      createRandomSuffix: () => "abcdef",
    });

    expect(username).toBe("alice");
  });

  it("adds a random suffix when the first candidate is taken", async () => {
    const findUserByUsername = vi
      .fn()
      .mockResolvedValueOnce({ id: "user-1" })
      .mockResolvedValueOnce(null);

    const username = await generateUniqueUsername("alice", {
      findUserByUsername,
      createRandomSuffix: () => "abcdef",
    });

    expect(username).toBe("alice.abcdef");
    expect(findUserByUsername).toHaveBeenNthCalledWith(1, "alice");
    expect(findUserByUsername).toHaveBeenNthCalledWith(2, "alice.abcdef");
  });
});

describe("resolveCreatedUsername", () => {
  it("keeps a unique provided username unchanged", async () => {
    await expect(
      resolveCreatedUsername({
        providedUsername: "Alice",
        seed: "alice@example.com",
        findUserByUsername: vi.fn().mockResolvedValue(null),
        createRandomSuffix: () => "abcdef",
      }),
    ).resolves.toEqual({
      username: "alice",
      usernameNeedsSetup: false,
      usernameAutoAdjusted: false,
    });
  });

  it("auto-adjusts a conflicting provided username", async () => {
    const findUserByUsername = vi
      .fn()
      .mockResolvedValueOnce({ id: "user-1" })
      .mockResolvedValueOnce({ id: "user-1" })
      .mockResolvedValueOnce(null);

    await expect(
      resolveCreatedUsername({
        providedUsername: "alice",
        seed: "alice@example.com",
        findUserByUsername,
        createRandomSuffix: () => "abcdef",
      }),
    ).resolves.toEqual({
      username: "alice.abcdef",
      usernameNeedsSetup: false,
      usernameAutoAdjusted: true,
    });
  });

  it("marks generated usernames as needing setup when no username is provided", async () => {
    await expect(
      resolveCreatedUsername({
        providedUsername: "",
        seed: "alice",
        findUserByUsername: vi.fn().mockResolvedValue(null),
        createRandomSuffix: () => "abcdef",
      }),
    ).resolves.toEqual({
      username: "alice",
      usernameNeedsSetup: true,
      usernameAutoAdjusted: false,
    });
  });
});
