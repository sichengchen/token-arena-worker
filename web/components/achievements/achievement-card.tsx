import { Card, CardContent } from "@/components/ui/card";
import type { AchievementStatus } from "@/lib/achievements/types";
import { AchievementBadge } from "./achievement-badge";

type AchievementCardProps = {
  achievement: AchievementStatus;
  title: string;
  description: string;
};

export function AchievementCard({
  achievement,
  title,
  description,
}: AchievementCardProps) {
  return (
    <Card
      size="sm"
      className="h-full min-w-0 w-full gap-0 overflow-visible rounded-[1.4rem] bg-zinc-900/70 py-0 text-inherit shadow-none ring-0 backdrop-blur-sm transition-colors duration-200 hover:bg-zinc-900"
    >
      <CardContent className="flex h-full flex-col items-center gap-3 px-3 py-4 text-center sm:px-4 sm:py-5">
        <AchievementBadge
          iconKey={achievement.iconKey}
          tier={achievement.tier}
          locked={!achievement.unlocked}
        />
        <div className="min-w-0 space-y-1.5">
          <h3 className="w-full max-w-full break-words text-sm font-semibold leading-snug tracking-tight text-zinc-100">
            {title}
          </h3>
          <p className="w-full max-w-full break-words text-[11px] leading-5 text-zinc-400 sm:text-xs">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
