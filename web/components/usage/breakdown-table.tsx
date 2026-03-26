"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDuration,
  formatPercentage,
  formatTokenCount,
} from "@/lib/usage/format";
import type { BreakdownRow } from "@/lib/usage/types";

type BreakdownTableProps = {
  rows: BreakdownRow[];
  emptyLabel: string;
};

export function BreakdownTable({ rows, emptyLabel }: BreakdownTableProps) {
  const locale = useLocale();
  const t = useTranslations("usage.breakdowns.table");

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("totalTokens")}</TableHead>
          <TableHead>{t("input")}</TableHead>
          <TableHead>{t("output")}</TableHead>
          <TableHead>{t("cache")}</TableHead>
          <TableHead>{t("activeTime")}</TableHead>
          <TableHead>{t("sessions")}</TableHead>
          <TableHead>{t("messages")}</TableHead>
          <TableHead>{t("userMessages")}</TableHead>
          <TableHead>{t("share")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="max-w-56 truncate font-medium">
              {row.name}
            </TableCell>
            <TableCell>{formatTokenCount(row.totalTokens)}</TableCell>
            <TableCell>{formatTokenCount(row.inputTokens)}</TableCell>
            <TableCell>
              <div>{formatTokenCount(row.outputTokens)}</div>
              <div className="text-xs text-muted-foreground">
                {t("reasoning", {
                  value: formatTokenCount(row.reasoningTokens),
                })}
              </div>
            </TableCell>
            <TableCell>{formatTokenCount(row.cachedTokens)}</TableCell>
            <TableCell>{formatDuration(row.activeSeconds)}</TableCell>
            <TableCell>{formatTokenCount(row.sessions)}</TableCell>
            <TableCell>{formatTokenCount(row.messages)}</TableCell>
            <TableCell>{formatTokenCount(row.userMessages)}</TableCell>
            <TableCell>{formatPercentage(row.share, locale)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
