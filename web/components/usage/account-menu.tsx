"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Link } from "@/i18n/navigation";

type AccountMenuProps = {
  email: string;
  username?: string | null;
};

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "?";
}

export function AccountMenu({ email, username }: AccountMenuProps) {
  const t = useTranslations("common");
  const tUsage = useTranslations("usage.accountMenu");
  const tSocial = useTranslations("social.nav");
  const identity = username ?? email;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const links = [
    ...(username
      ? [{ href: `/u/${username}`, label: tSocial("profile") }]
      : []),
    { href: "/usage", label: tSocial("dashboard") },
    { href: "/people", label: tSocial("people") },
  ];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setOpen(true);
  };

  const closeMenu = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 120);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={tUsage("open")}
        aria-expanded={open}
        aria-haspopup="menu"
        onPointerEnter={openMenu}
        onPointerLeave={closeMenu}
        onFocus={openMenu}
        onBlur={(event) => {
          if (
            !containerRef.current?.contains(event.relatedTarget as Node | null)
          ) {
            setOpen(false);
          }
        }}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[0.7rem] font-semibold text-background">
          {getInitial(identity)}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 flex w-64 flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden"
          onPointerEnter={openMenu}
          onPointerLeave={closeMenu}
          onBlur={(event) => {
            if (
              !containerRef.current?.contains(
                event.relatedTarget as Node | null,
              )
            ) {
              setOpen(false);
            }
          }}
        >
          <div className="rounded-lg px-2 py-1.5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("account")}
            </div>
            {username ? (
              <div className="mt-1 text-sm font-semibold">@{username}</div>
            ) : null}
            <div className="mt-1 break-all text-sm font-medium">{email}</div>
          </div>
          <div className="space-y-1 px-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-8 items-center rounded-md px-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <LogoutButton variant="ghost" className="w-full justify-start">
            {t("signOut")}
          </LogoutButton>
        </div>
      ) : null}
    </div>
  );
}
