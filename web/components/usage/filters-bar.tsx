"use client";

import {
  Brain,
  CalendarDays,
  Folder,
  KeyRound,
  Monitor,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateInput } from "@/lib/usage/format";
import type {
  DashboardPreset,
  UsageFilterOptions,
  UsageFilters,
} from "@/lib/usage/types";
import { buildUsageHref } from "./filter-query";
import {
  getActiveFilterChips,
  getFilterMeta,
  hasActiveDashboardState,
} from "./filter-state";

type FiltersBarProps = {
  preset: DashboardPreset;
  range: {
    from: string;
    to: string;
    timezone: string;
  };
  filters: UsageFilters;
  options: UsageFilterOptions;
};

const ALL_VALUE = "__all__";
const presets: DashboardPreset[] = ["1d", "7d", "30d", "custom"];

function FilterIcon({
  type,
  className = "size-3.5",
}: {
  type: ReturnType<typeof getFilterMeta>["icon"];
  className?: string;
}) {
  switch (type) {
    case "key":
      return <KeyRound className={className} />;
    case "device":
      return <Monitor className={className} />;
    case "tool":
      return <Wrench className={className} />;
    case "model":
      return <Brain className={className} />;
    case "project":
      return <Folder className={className} />;
    default:
      return <SlidersHorizontal className={className} />;
  }
}

type FilterSelectFieldProps = {
  label: string;
  icon: ReturnType<typeof getFilterMeta>["icon"];
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

function FilterSelectField({
  label,
  icon,
  value,
  placeholder,
  onValueChange,
  children,
}: FilterSelectFieldProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <FilterIcon type={icon} className="size-3.5" />
        <span>{label}</span>
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {children}
      </Select>
    </div>
  );
}

function buildDateValue(value: string, timezone: string) {
  return formatDateInput(new Date(value), timezone);
}

function getPresetLabel(value: DashboardPreset) {
  return value === "custom" ? "Custom" : value.toUpperCase();
}

export function FiltersBar({
  preset,
  range,
  filters,
  options,
}: FiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(
    buildDateValue(range.from, range.timezone),
  );
  const [customTo, setCustomTo] = useState(
    buildDateValue(range.to, range.timezone),
  );

  const activeChips = useMemo(
    () => getActiveFilterChips(filters, options),
    [filters, options],
  );
  const hasActiveState = hasActiveDashboardState(preset, filters);

  const updateParams = (updates: Record<string, string | null>) => {
    router.replace(buildUsageHref(searchParams.toString(), updates));
  };

  const setPreset = (nextPreset: DashboardPreset) => {
    if (nextPreset === "custom") {
      setIsCustomOpen(true);
      return;
    }

    updateParams({
      preset: nextPreset === "7d" ? null : nextPreset,
      from: null,
      to: null,
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
    setIsCustomOpen(false);
  };

  const resetAll = () => {
    router.replace("/usage");
  };

  const removeFilter = (key: keyof UsageFilters) => {
    updateParams({
      [key]: null,
    });
  };

  const updateFilter = (key: keyof UsageFilters, value: string) => {
    updateParams({
      [key]: value === ALL_VALUE ? null : value,
    });
  };

  return (
    <div className="rounded-2xl bg-background px-4 py-4 ring-1 ring-foreground/10 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((item) =>
            item === "custom" ? (
              <Popover
                key={item}
                open={isCustomOpen}
                onOpenChange={(open) => {
                  setIsCustomOpen(open);
                  if (open) {
                    setCustomFrom(buildDateValue(range.from, range.timezone));
                    setCustomTo(buildDateValue(range.to, range.timezone));
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={preset === item ? "default" : "outline"}
                    size="sm"
                  >
                    <CalendarDays />
                    {getPresetLabel(item)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="font-medium">Custom range</div>
                      <p className="text-sm text-muted-foreground">
                        Pick a start and end date in {range.timezone}.
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="custom-from">From</Label>
                        <Input
                          id="custom-from"
                          type="date"
                          value={customFrom}
                          onChange={(event) =>
                            setCustomFrom(event.target.value)
                          }
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
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                key={item}
                type="button"
                variant={preset === item ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(item)}
              >
                {getPresetLabel(item)}
              </Button>
            ),
          )}

          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={activeChips.totalCount > 0 ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
              >
                <SlidersHorizontal className="size-4" />
                <span>Filters</span>
                {activeChips.totalCount > 0 ? (
                  <Badge variant="outline" className="h-5 rounded-full px-1.5">
                    {activeChips.totalCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[min(92vw,560px)] p-4"
              onInteractOutside={(event) => {
                const target = event.target;

                if (
                  target instanceof HTMLElement &&
                  target.closest('[data-slot="select-content"]')
                ) {
                  event.preventDefault();
                }
              }}
            >
              <div className="space-y-4">
                <div className="font-medium">Filters</div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FilterSelectField
                    label="Keys"
                    icon="key"
                    value={filters.apiKeyId ?? ALL_VALUE}
                    placeholder="All keys"
                    onValueChange={(value) => updateFilter("apiKeyId", value)}
                  >
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All keys</SelectItem>
                      {options.apiKeys.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </FilterSelectField>

                  <FilterSelectField
                    label="Devices"
                    icon="device"
                    value={filters.deviceId ?? ALL_VALUE}
                    placeholder="All devices"
                    onValueChange={(value) => updateFilter("deviceId", value)}
                  >
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All devices</SelectItem>
                      {options.devices.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </FilterSelectField>

                  <FilterSelectField
                    label="Tools"
                    icon="tool"
                    value={filters.source ?? ALL_VALUE}
                    placeholder="All tools"
                    onValueChange={(value) => updateFilter("source", value)}
                  >
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All tools</SelectItem>
                      {options.sources.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </FilterSelectField>

                  <FilterSelectField
                    label="Models"
                    icon="model"
                    value={filters.model ?? ALL_VALUE}
                    placeholder="All models"
                    onValueChange={(value) => updateFilter("model", value)}
                  >
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All models</SelectItem>
                      {options.models.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </FilterSelectField>

                  <FilterSelectField
                    label="Projects"
                    icon="project"
                    value={filters.projectKey ?? ALL_VALUE}
                    placeholder="All projects"
                    onValueChange={(value) => updateFilter("projectKey", value)}
                  >
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All projects</SelectItem>
                      {options.projects.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </FilterSelectField>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeChips.visible.map((chip) => {
            const meta = getFilterMeta(chip.key);

            return (
              <Button
                key={`${chip.key}-${chip.value}`}
                type="button"
                variant="outline"
                size="xs"
                className="max-w-[180px] gap-1.5 bg-muted/20"
                onClick={() => removeFilter(chip.key)}
              >
                <FilterIcon type={meta.icon} className="size-3.5" />
                <span className="truncate">{chip.label}</span>
                <X className="size-3" />
              </Button>
            );
          })}

          {activeChips.hiddenCount > 0 ? (
            <Badge variant="secondary">+{activeChips.hiddenCount}</Badge>
          ) : null}

          {hasActiveState ? (
            <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw />
              Reset
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
