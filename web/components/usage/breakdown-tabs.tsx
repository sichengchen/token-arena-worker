"use client";

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
    label: "Devices",
    emptyLabel: "No device data in this range.",
  },
  { value: "tools", label: "Tools", emptyLabel: "No tool data in this range." },
  {
    value: "models",
    label: "Models",
    emptyLabel: "No model data in this range.",
  },
  {
    value: "projects",
    label: "Projects",
    emptyLabel: "No project data in this range.",
  },
] as const;

export function BreakdownTabs({ breakdowns }: BreakdownTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdowns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices">
          <TabsList variant="line" className="mb-4 flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <BreakdownTable
                rows={breakdowns[tab.value]}
                emptyLabel={tab.emptyLabel}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
