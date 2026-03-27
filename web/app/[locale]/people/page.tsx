import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileListItem } from "@/components/social/profile-list-item";
import { SocialShell } from "@/components/social/social-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { getOptionalSession } from "@/lib/session";
import {
  listFollowerProfiles,
  listFollowingProfiles,
  type SocialListProfile,
  searchPublicProfiles,
} from "@/lib/social/queries";
import { cn } from "@/lib/utils";

type PeoplePageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PeopleTab = "all" | "following" | "followers";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePeopleTab(
  value: string | undefined,
  authenticated: boolean,
): PeopleTab {
  if (!authenticated) {
    return "all";
  }

  if (value === "following" || value === "followers") {
    return value;
  }

  return "all";
}

function filterProfiles(profiles: SocialListProfile[], query: string) {
  if (!query) {
    return profiles;
  }

  const normalized = query.toLowerCase();

  return profiles.filter((profile) => {
    const haystack = [profile.username, profile.name, profile.bio ?? ""]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "social.people" });

  return {
    title: `${t("title")} | Tokens Burned`,
    description: t("description"),
  };
}

export default async function PeoplePage({
  params,
  searchParams,
}: PeoplePageProps) {
  const { locale } = await params;
  const viewer = await getOptionalSession();
  const t = await getTranslations({ locale, namespace: "social.people" });
  const tNetwork = await getTranslations({
    locale,
    namespace: "social.network",
  });
  const tCard = await getTranslations({ locale, namespace: "social.card" });
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = firstValue(resolvedSearchParams?.query)?.trim() ?? "";
  const tab = normalizePeopleTab(
    firstValue(resolvedSearchParams?.tab),
    Boolean(viewer),
  );

  const profiles = await (async () => {
    if (tab === "following" && viewer) {
      return filterProfiles(await listFollowingProfiles(viewer.user.id), query);
    }

    if (tab === "followers" && viewer) {
      return filterProfiles(await listFollowerProfiles(viewer.user.id), query);
    }

    return searchPublicProfiles({
      query,
      viewerUserId: viewer?.user.id ?? null,
    });
  })();

  const tabs: Array<{ value: PeopleTab; label: string }> = [
    { value: "all", label: t("title") },
    ...(viewer
      ? [
          { value: "following" as const, label: tNetwork("followingTitle") },
          { value: "followers" as const, label: tNetwork("followersTitle") },
        ]
      : []),
  ];

  const summaryText = query
    ? t("results", { count: profiles.length })
    : tab === "following"
      ? tNetwork("followingDescription")
      : tab === "followers"
        ? tNetwork("followersDescription")
        : t("allPublic");

  const emptyText =
    tab === "following"
      ? tNetwork("emptyFollowing")
      : tab === "followers"
        ? tNetwork("emptyFollowers")
        : t("empty");

  return (
    <SocialShell
      locale={locale}
      viewer={
        viewer
          ? {
              id: viewer.user.id,
              email: viewer.user.email,
              username: viewer.user.username,
            }
          : null
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label={t("title")}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {tabs.map((item) => (
              <Link
                key={item.value}
                href={
                  item.value === "all"
                    ? query
                      ? { pathname: "/people", query: { query } }
                      : "/people"
                    : query
                      ? {
                          pathname: "/people",
                          query: { tab: item.value, query },
                        }
                      : { pathname: "/people", query: { tab: item.value } }
                }
                aria-current={tab === item.value ? "page" : undefined}
                className={cn(
                  "inline-flex items-center border-b-2 border-transparent py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  tab === item.value && "border-foreground text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form className="flex flex-col gap-2 sm:flex-row">
            {tab !== "all" ? (
              <input type="hidden" name="tab" value={tab} />
            ) : null}
            <Input
              type="search"
              name="query"
              defaultValue={query}
              placeholder={t("searchPlaceholder")}
              className="w-full sm:w-72"
            />
            <Button type="submit">{t("search")}</Button>
          </form>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>{summaryText}</div>
        </div>

        {profiles.length > 0 ? (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <ProfileListItem
                key={profile.id}
                locale={locale}
                profile={profile}
                isAuthenticated={Boolean(viewer)}
                labels={{
                  followers: tCard("followers"),
                  following: tCard("following"),
                  mutual: tCard("mutual"),
                  private: tCard("private"),
                  you: tCard("you"),
                  viewProfile: tCard("viewProfile"),
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-background/90 shadow-sm ring-1 ring-border/60">
            <CardContent className="py-6 text-sm text-muted-foreground">
              {emptyText}
            </CardContent>
          </Card>
        )}
      </div>
    </SocialShell>
  );
}
