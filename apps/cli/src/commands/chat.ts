import { Command } from "commander";

import { renderTextResult } from "../output.js";
import type { CliDependencies } from "../types.js";

export function createChatCommand(dependencies: CliDependencies): Command {
  return new Command("chat")
    .description("Send a plain chat prompt to xAI Grok")
    .requiredOption("--prompt <prompt>", "Prompt text")
    .option("--system <system>", "System prompt")
    .option("--model <model>", "Override model")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const result = await dependencies.service.chat({
        prompt: options.prompt,
        system: options.system,
        model: options.model
      });

      renderTextResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
