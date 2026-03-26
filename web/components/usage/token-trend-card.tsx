"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTokenCount } from "@/lib/usage/format";
import type { TokenTrendPoint } from "@/lib/usage/types";

type TokenTrendCardProps = {
  data: TokenTrendPoint[];
};

export function TokenTrendCard({ data }: TokenTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Trend</CardTitle>
        <CardDescription>
          Total, input, output, reasoning, and cache over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" minTickGap={24} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatTokenCount} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  return formatTokenCount(numericValue);
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalTokens"
                name="Total"
                stroke="#111827"
                fill="#111827"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="inputTokens"
                name="Input"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="outputTokens"
                name="Output"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="reasoningTokens"
                name="Reasoning"
                stroke="#9333ea"
                fill="#9333ea"
                fillOpacity={0.06}
              />
              <Area
                type="monotone"
                dataKey="cachedTokens"
                name="Cache"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.06}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
