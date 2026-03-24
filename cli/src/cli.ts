import { Command } from "commander";
import { createAgentsCommand } from "./commands/agents";
import { createDailyCommand } from "./commands/daily";
import { createIngestCommand } from "./commands/ingest";

const CLI_VERSION = "0.1.0";

export function createCli(): Command {
  const program = new Command();

  program
    .name("tokens-burned")
    .description("Track daily token burn across coding agents.")
    .version(CLI_VERSION)
    .showHelpAfterError()
    .showSuggestionAfterError();

  program.addCommand(createDailyCommand());
  program.addCommand(createAgentsCommand());
  program.addCommand(createIngestCommand());

  return program;
}
