import { Command } from "commander";
import { sampleUsageEvents } from "../data/sample-usage";
import { summarizeDailyUsage } from "../domain/summarize-daily-usage";
import { printDailySummary } from "../lib/print-daily-summary";

export function createDailyCommand(): Command {
  return new Command("daily")
    .description("Show a daily summary of token usage.")
    .option("-d, --date <date>", "Only show a specific YYYY-MM-DD.")
    .option("--json", "Output the summary as JSON.")
    .action((options: { date?: string; json?: boolean }) => {
      const summaries = summarizeDailyUsage(sampleUsageEvents);
      const summary = options.date
        ? summaries.find((item) => item.date === options.date)
        : summaries.at(-1);

      if (!summary) {
        throw new Error(
          options.date
            ? `No usage data found for ${options.date}.`
            : "No usage data found.",
        );
      }

      if (options.json) {
        console.log(JSON.stringify(summary, null, 2));
        return;
      }

      printDailySummary(summary);
    });
}
