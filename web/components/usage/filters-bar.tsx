"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateInput, formatDateTime } from "@/lib/usage/format";
import type {
  DashboardPreset,
  UsageFilterOptions,
  UsageFilters,
} from "@/lib/usage/types";

type FiltersBarProps = {
  preset: DashboardPreset;
  range: {
    from: string;
    to: string;
    timezone: string;
  };
  filters: UsageFilters;
  options: UsageFilterOptions;
  lastSyncedAt: string | null;
};

const ALL_VALUE = "__all__";
const presets: DashboardPreset[] = ["1d", "7d", "30d", "custom"];

function buildDateValue(value: string, timezone: string) {
  return formatDateInput(new Date(value), timezone);
}

export function FiltersBar({
  preset,
  range,
  filters,
  options,
  lastSyncedAt,
}: FiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = useState(
    buildDateValue(range.from, range.timezone),
  );
  const [customTo, setCustomTo] = useState(
    buildDateValue(range.to, range.timezone),
  );

  useEffect(() => {
    setCustomFrom(buildDateValue(range.from, range.timezone));
    setCustomTo(buildDateValue(range.to, range.timezone));
  }, [range.from, range.timezone, range.to]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) {
      return "No sync recorded yet";
    }

    return formatDateTime(lastSyncedAt, range.timezone);
  }, [lastSyncedAt, range.timezone]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    router.replace(next.toString() ? `/usage?${next.toString()}` : "/usage");
  };

  const setPreset = (nextPreset: DashboardPreset) => {
    updateParams({
      preset: nextPreset === "7d" ? null : nextPreset,
      from: nextPreset === "custom" ? customFrom : null,
      to: nextPreset === "custom" ? customTo : null,
    });
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) {
      return;
    }

    updateParams({
      preset: "custom",
      from: customFrom,
      to: customTo,
    });
  };

  const resetFilters = () => {
    router.replace("/usage");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Account timezone: {range.timezone}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Last synced {lastSyncedLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => (
            <Button
              key={item}
              type="button"
              variant={preset === item ? "default" : "outline"}
              onClick={() => setPreset(item)}
            >
              {item === "custom" ? "Custom" : item.toUpperCase()}
            </Button>
          ))}

          <Button type="button" variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>

        {preset === "custom" ? (
          <div className="grid gap-3 rounded-xl border border-dashed p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="custom-from">From</Label>
              <Input
                id="custom-from"
                type="date"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-to">To</Label>
              <Input
                id="custom-to"
                type="date"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
              />
            </div>
            <Button type="button" onClick={applyCustomRange}>
              Apply
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Select
            value={filters.apiKeyId ?? ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ apiKeyId: value === ALL_VALUE ? null : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All keys" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All keys</SelectItem>
              {options.apiKeys.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.deviceId ?? ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ deviceId: value === ALL_VALUE ? null : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All devices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All devices</SelectItem>
              {options.devices.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source ?? ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ source: value === ALL_VALUE ? null : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tools</SelectItem>
              {options.sources.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.model ?? ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ model: value === ALL_VALUE ? null : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All models</SelectItem>
              {options.models.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.projectKey ?? ALL_VALUE}
            onValueChange={(value) =>
              updateParams({ projectKey: value === ALL_VALUE ? null : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All projects</SelectItem>
              {options.projects.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
