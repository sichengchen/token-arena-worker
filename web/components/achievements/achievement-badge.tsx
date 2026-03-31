import type { LucideIcon } from "lucide-react";
import {
  Brain,
  CalendarCheck2,
  Clock3,
  Coins,
  DatabaseZap,
  Flame,
  Focus,
  FolderGit2,
  Globe,
  HeartHandshake,
  MessagesSquare,
  MonitorSmartphone,
  Orbit,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import type {
  AchievementIconKey,
  AchievementTier,
} from "@/lib/achievements/types";
import { cn } from "@/lib/utils";

const iconMap: Record<AchievementIconKey, LucideIcon> = {
  rocket: Rocket,
  globe: Globe,
  flame: Flame,
  "calendar-check": CalendarCheck2,
  coins: Coins,
  "messages-square": MessagesSquare,
  clock: Clock3,
  brain: Brain,
  "database-zap": DatabaseZap,
  focus: Focus,
  orbit: Orbit,
  wrench: Wrench,
  "folder-git": FolderGit2,
  "monitor-smartphone": MonitorSmartphone,
  "user-plus": UserPlus,
  "heart-handshake": HeartHandshake,
  users: Users,
  sparkles: Sparkles,
  trophy: Trophy,
  target: Target,
};

const tierClassNames: Record<AchievementTier, string> = {
  bronze:
    "from-amber-300 via-orange-300 to-amber-500 text-amber-950 ring-amber-600/40 shadow-amber-500/20",
  silver:
    "from-slate-200 via-zinc-100 to-slate-300 text-slate-900 ring-slate-500/35 shadow-slate-400/20",
  gold: "from-yellow-200 via-amber-100 to-yellow-400 text-amber-950 ring-yellow-500/40 shadow-yellow-500/25",
  special:
    "from-fuchsia-300 via-violet-200 to-indigo-400 text-indigo-950 ring-violet-500/40 shadow-violet-500/25",
};

const lockedShellClassNames =
  "from-zinc-700 via-zinc-800 to-zinc-900 text-zinc-300 ring-zinc-500/40 shadow-none dark:from-zinc-800 dark:via-zinc-900 dark:to-black dark:text-zinc-400 dark:ring-zinc-700/50";

type AchievementBadgeProps = {
  iconKey: AchievementIconKey;
  tier: AchievementTier;
  locked?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClassNames = {
  sm: {
    ribbon: "h-4 w-3 rounded-b-sm",
    shell: "size-12 rounded-[1.1rem]",
    inner: "size-9 rounded-[0.95rem]",
    icon: "size-4",
  },
  md: {
    ribbon: "h-5 w-3.5 rounded-b-md",
    shell: "size-15 rounded-[1.4rem]",
    inner: "size-11 rounded-[1.15rem]",
    icon: "size-5",
  },
  lg: {
    ribbon: "h-6 w-4 rounded-b-md",
    shell: "size-18 rounded-[1.6rem]",
    inner: "size-13 rounded-[1.3rem]",
    icon: "size-6",
  },
} as const;

export function AchievementBadge({
  iconKey,
  tier,
  locked = false,
  size = "md",
}: AchievementBadgeProps) {
  const Icon = iconMap[iconKey];
  const classes = sizeClassNames[size];

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center",
        locked && "grayscale saturate-0",
      )}
    >
      <div className="mb-[-2px] flex items-start gap-1.5">
        <span
          className={cn(
            locked ? "bg-zinc-700/90 dark:bg-zinc-500/60" : "bg-slate-800/90",
            classes.ribbon,
          )}
        />
        <span
          className={cn(
            locked ? "bg-zinc-700/90 dark:bg-zinc-500/60" : "bg-slate-800/90",
            classes.ribbon,
          )}
        />
      </div>
      <div
        className={cn(
          "relative grid place-items-center bg-gradient-to-br ring-1 shadow-lg",
          locked ? lockedShellClassNames : tierClassNames[tier],
          classes.shell,
        )}
      >
        <div
          className={cn(
            "absolute inset-1 rounded-[inherit] border",
            locked
              ? "border-zinc-400/10 dark:border-white/5"
              : "border-white/35 dark:border-white/10",
          )}
        />
        {locked ? (
          <Icon className={cn("opacity-55", classes.icon)} strokeWidth={2.2} />
        ) : (
          <div
            className={cn(
              "grid place-items-center bg-white/70 shadow-inner backdrop-blur dark:bg-slate-950/15",
              classes.inner,
            )}
          >
            <Icon className={classes.icon} strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
}
