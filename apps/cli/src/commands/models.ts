import { Command } from "commander";

import { renderModelsResult } from "../output.js";
import type { CliDependencies } from "../types.js";

export function createModelsCommand(dependencies: CliDependencies): Command {
  return new Command("models")
    .description("List available xAI models")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const result = await dependencies.service.models(Boolean(options.json));

      renderModelsResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
