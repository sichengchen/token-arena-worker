"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

type UsernameAutoAdjustedToastProps = {
  enabled?: boolean;
  username: string;
};

function getToastStorageKey(username: string) {
  return `tokenarena:username-auto-adjusted-toast:${username}`;
}

export function UsernameAutoAdjustedToast({
  enabled = false,
  username,
}: UsernameAutoAdjustedToastProps) {
  const t = useTranslations("usage.settings.identity");

  useEffect(() => {
    if (!enabled || !username) {
      return;
    }

    const storageKey = getToastStorageKey(username);

    if (window.sessionStorage.getItem(storageKey) === "1") {
      return;
    }

    toast.info(t("autoAdjustedNotice", { username }));
    window.sessionStorage.setItem(storageKey, "1");
  }, [enabled, t, username]);

  return null;
}
