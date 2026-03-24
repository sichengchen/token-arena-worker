import { createCli } from "./cli";

async function main() {
  await createCli().parseAsync(process.argv);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n✖ ${message}`);
  process.exitCode = 1;
});
