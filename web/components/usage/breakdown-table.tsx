"use client";

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
          <TableHead>Name</TableHead>
          <TableHead>Total Tokens</TableHead>
          <TableHead>Input</TableHead>
          <TableHead>Output</TableHead>
          <TableHead>Cache</TableHead>
          <TableHead>Active Time</TableHead>
          <TableHead>Sessions</TableHead>
          <TableHead>Messages</TableHead>
          <TableHead>User Messages</TableHead>
          <TableHead>Share</TableHead>
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
                Reasoning {formatTokenCount(row.reasoningTokens)}
              </div>
            </TableCell>
            <TableCell>{formatTokenCount(row.cachedTokens)}</TableCell>
            <TableCell>{formatDuration(row.activeSeconds)}</TableCell>
            <TableCell>{formatTokenCount(row.sessions)}</TableCell>
            <TableCell>{formatTokenCount(row.messages)}</TableCell>
            <TableCell>{formatTokenCount(row.userMessages)}</TableCell>
            <TableCell>{formatPercentage(row.share)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
