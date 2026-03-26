"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UsageBreakdowns } from "@/lib/usage/types";
import { BreakdownTable } from "./breakdown-table";

type BreakdownTabsProps = {
  breakdowns: UsageBreakdowns;
};

const tabs = [
  {
    value: "devices",
    labelKey: "devices",
    emptyLabelKey: "devices",
  },
  { value: "tools", labelKey: "tools", emptyLabelKey: "tools" },
  {
    value: "models",
    labelKey: "models",
    emptyLabelKey: "models",
  },
  {
    value: "projects",
    labelKey: "projects",
    emptyLabelKey: "projects",
  },
] as const;

export function BreakdownTabs({ breakdowns }: BreakdownTabsProps) {
  const t = useTranslations("usage.breakdowns");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices">
          <TabsList variant="line" className="mb-4 flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {t(`tabs.${tab.labelKey}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <BreakdownTable
                rows={breakdowns[tab.value]}
                emptyLabel={t(`empty.${tab.emptyLabelKey}`)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
