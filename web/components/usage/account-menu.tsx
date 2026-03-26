"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AccountMenuProps = {
  email: string;
};

function getInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "?";
}

export function AccountMenu({ email }: AccountMenuProps) {
  const t = useTranslations("common");
  const tUsage = useTranslations("usage.accountMenu");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-full border bg-background px-1.5 pr-2 text-sm font-medium text-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted"
          aria-label={tUsage("open")}
        >
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[0.7rem] font-semibold text-background">
            {getInitial(email)}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-1.5">
        <div className="space-y-3">
          <div className="rounded-lg px-2 py-1.5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("account")}
            </div>
            <div className="mt-1 break-all text-sm font-medium">{email}</div>
          </div>
          <LogoutButton variant="ghost" className="w-full justify-start">
            {t("signOut")}
          </LogoutButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
