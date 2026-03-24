import { Command } from "commander";
import { SUPPORTED_AGENTS } from "../domain/agents";

export function createAgentsCommand(): Command {
  return new Command("agents")
    .description("List the coding agents currently modeled by the workspace.")
    .option("--json", "Output the list as JSON.")
    .action((options: { json?: boolean }) => {
      if (options.json) {
        console.log(JSON.stringify(SUPPORTED_AGENTS, null, 2));
        return;
      }

      for (const agent of SUPPORTED_AGENTS) {
        console.log(`- ${agent}`);
      }
    });
}
