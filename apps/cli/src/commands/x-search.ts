import { Command } from "commander";

import { renderTextResult } from "../output.js";
import type { CliDependencies } from "../types.js";

export function createXSearchCommand(dependencies: CliDependencies): Command {
  return new Command("x-search")
    .description("Answer a prompt using xAI X Search")
    .requiredOption("--prompt <prompt>", "Prompt text")
    .option("--model <model>", "Override model")
    .option("--allow-handle <handles...>", "Allow only these X handles")
    .option("--exclude-handle <handles...>", "Exclude these X handles")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const result = await dependencies.service.xSearch({
        prompt: options.prompt,
        model: options.model,
        allowedXHandles: options.allowHandle,
        excludedXHandles: options.excludeHandle
      });

      renderTextResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
