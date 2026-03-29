"use client";

import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

type LeaderboardTagSelectProps = {
  value: string;
  defaultValue: string;
  ariaLabel: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

function buildLeaderboardHref(
  pathname: string,
  searchParams: URLSearchParams,
  tag: string,
  defaultValue: string,
) {
  const nextParams = new URLSearchParams(searchParams.toString());

  if (tag === defaultValue) {
    nextParams.delete("tag");
  } else {
    nextParams.set("tag", tag);
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LeaderboardTagSelect({
  value,
  defaultValue,
  ariaLabel,
  options,
}: LeaderboardTagSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (nextValue: string) => {
    if (nextValue === value) {
      return;
    }

    router.replace(
      buildLeaderboardHref(
        pathname,
        new URLSearchParams(searchParams.toString()),
        nextValue,
        defaultValue,
      ),
    );
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        size="default"
        className="h-8 min-w-[148px] bg-background"
      >
        <SelectValue placeholder={ariaLabel} />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
