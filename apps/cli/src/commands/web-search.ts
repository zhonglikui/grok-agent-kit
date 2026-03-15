import { Command } from "commander";

import { renderTextResult } from "../output.js";
import type { CliDependencies } from "../types.js";

export function createWebSearchCommand(dependencies: CliDependencies): Command {
  return new Command("web-search")
    .description("Answer a prompt using xAI Web Search")
    .requiredOption("--prompt <prompt>", "Prompt text")
    .option("--model <model>", "Override model")
    .option("--allow-domain <domains...>", "Allow only these domains")
    .option("--exclude-domain <domains...>", "Exclude these domains")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const result = await dependencies.service.webSearch({
        prompt: options.prompt,
        model: options.model,
        allowedWebDomains: options.allowDomain,
        excludedWebDomains: options.excludeDomain
      });

      renderTextResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
