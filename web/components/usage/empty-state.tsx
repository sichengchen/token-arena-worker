import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type EmptyStateProps = {
  hasKeys: boolean;
};

export async function EmptyState({ hasKeys }: EmptyStateProps) {
  const t = await getTranslations("usage.emptyState");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-2 pl-5">
          <li>{t("step1")}</li>
          <li>{t("step2", { command: "tokens-burned init" })}</li>
          <li>{t("step3")}</li>
        </ol>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={hasKeys ? "/usage/setup" : "/settings/keys"}>
              {hasKeys ? t("openSetupGuide") : t("createFirstKey")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings/keys">{t("manageKeys")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
