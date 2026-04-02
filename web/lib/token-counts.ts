const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
const MIN_SAFE_BIGINT = BigInt(Number.MIN_SAFE_INTEGER);

export function tokenCountToBigInt(value: number | bigint | null | undefined) {
  return typeof value === "bigint" ? value : BigInt(Math.trunc(value ?? 0));
}

export function tokenCountToNumber(value: number | bigint | null | undefined) {
  if (typeof value === "bigint") {
    if (value > MAX_SAFE_BIGINT) {
      return Number.MAX_SAFE_INTEGER;
    }

    if (value < MIN_SAFE_BIGINT) {
      return Number.MIN_SAFE_INTEGER;
    }

    return Number(value);
  }

  return value ?? 0;
}
