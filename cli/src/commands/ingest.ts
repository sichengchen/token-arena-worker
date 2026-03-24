import { Command } from "commander";

export function createIngestCommand(): Command {
  return new Command("ingest")
    .description("Prepare to import usage exports from a coding agent.")
    .argument("<source>", "Path to a usage export, log file, or directory.")
    .option("-a, --agent <agent>", "Explicitly specify the agent.")
    .action((source: string, options: { agent?: string }) => {
      console.log("Ingest pipeline scaffold is ready.");
      console.log(`- source: ${source}`);
      console.log(`- agent: ${options.agent ?? "auto-detect"}`);
      console.log("- next: add real parsers under cli/src or a future shared module.");
    });
}
