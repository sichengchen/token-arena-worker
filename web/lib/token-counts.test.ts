import { describe, expect, it } from "vitest";
import { tokenCountToBigInt, tokenCountToNumber } from "./token-counts";

describe("token counts", () => {
  it("converts numbers to bigint for Prisma writes", () => {
    expect(tokenCountToBigInt(6_355_629_440)).toBe(6_355_629_440n);
  });

  it("converts bigint values back to numbers for UI reads", () => {
    expect(tokenCountToNumber(2_272_772_480n)).toBe(2_272_772_480);
  });

  it("clamps values above the safe integer limit", () => {
    expect(tokenCountToNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
