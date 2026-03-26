const datePartsFormatterCache = new Map<string, Intl.DateTimeFormat>();
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();
const percentageFormatterCache = new Map<string, Intl.NumberFormat>();

function getDatePartsFormatter(timezone: string) {
  const cached = datePartsFormatterCache.get(timezone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  datePartsFormatterCache.set(timezone, formatter);

  return formatter;
}

function getDateTimeFormatter(timezone: string, locale = "en") {
  const cacheKey = `${locale}:${timezone}`;
  const cached = dateTimeFormatterCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  dateTimeFormatterCache.set(cacheKey, formatter);

  return formatter;
}

function getPercentageFormatter(locale = "en") {
  const cached = percentageFormatterCache.get(locale);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  percentageFormatterCache.set(locale, formatter);

  return formatter;
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatTokenCount(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue < 1000) {
    return String(value);
  }

  if (absValue < 1_000_000) {
    return `${sign}${(absValue / 1000).toFixed(1)}K`;
  }

  if (absValue < 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  }

  return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) {
    return "0s";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatPercentage(value: number, locale = "en") {
  return getPercentageFormatter(locale).format(value);
}

export function formatDateInput(value: Date | string, timezone: string) {
  return getDatePartsFormatter(timezone).format(normalizeDate(value));
}

export function formatDateTime(
  value: Date | string,
  timezone: string,
  locale = "en",
) {
  return getDateTimeFormatter(timezone, locale).format(normalizeDate(value));
}
