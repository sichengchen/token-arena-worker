"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { formatDuration, formatTokenCount } from "@/lib/usage/format";
import type { ActivityTrendPoint } from "@/lib/usage/types";

type ActivityTrendCardProps = {
  data: ActivityTrendPoint[];
};

const ACTIVITY_TREND_INITIAL_DIMENSION = {
  width: 720,
  height: 320,
} as const;

export function ActivityTrendCard({ data }: ActivityTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Trend</CardTitle>
        <CardDescription>
          Active time, total time, sessions, and messages over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={ACTIVITY_TREND_INITIAL_DIMENSION}
          >
            <LineChart
              data={data}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" minTickGap={24} tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => formatTokenCount(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  if (name === "Active" || name === "Total") {
                    return formatDuration(numericValue);
                  }

                  return formatTokenCount(numericValue);
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeSeconds"
                name="Active"
                stroke="#111827"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="totalSeconds"
                name="Total"
                stroke="#2563eb"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#16a34a"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="messages"
                name="Messages"
                stroke="#9333ea"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
