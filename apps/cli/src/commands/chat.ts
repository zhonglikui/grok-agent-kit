import { Command } from "commander";

import { renderTextResult } from "../output.js";
import type { CliDependencies } from "../types.js";

export function createChatCommand(dependencies: CliDependencies): Command {
  return new Command("chat")
    .description("Send a plain chat prompt to xAI Grok")
    .requiredOption("--prompt <prompt>", "Prompt text")
    .option("--system <system>", "System prompt")
    .option("--model <model>", "Override model")
    .option("--session <name>", "Continue or create a named local session")
    .option("--reset-session", "Reset the named session before sending the prompt")
    .option(
      "--previous-response-id <id>",
      "Continue from a previous xAI response id"
    )
    .option("--no-store", "Do not store the response on xAI")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      if (options.session && options.store === false) {
        throw new Error("--session cannot be used with --no-store");
      }

      if (options.resetSession && !options.session) {
        throw new Error("--reset-session requires --session");
      }

      if (options.resetSession && options.session) {
        await dependencies.sessionStore.delete(options.session);
      }

      let existingSession = undefined;
      let previousResponseId = options.previousResponseId as string | undefined;

      if (!previousResponseId && options.session) {
        existingSession = await dependencies.sessionStore.get(options.session);
        previousResponseId = existingSession?.responseId;
      } else if (options.session) {
        existingSession = await dependencies.sessionStore.get(options.session);
      }

      const result = await dependencies.service.chat({
        prompt: options.prompt,
        system: options.system,
        model: options.model,
        previousResponseId,
        store: options.session ? true : options.store
      });

      const nextResponseId = result.responseId ?? existingSession?.responseId;

      if (options.session && nextResponseId) {
        await dependencies.sessionStore.set(options.session, {
          responseId: nextResponseId,
          updatedAt: new Date().toISOString(),
          history: [
            ...(existingSession?.history ?? []),
            {
              prompt: options.prompt,
              responseText: result.text,
              responseId: result.responseId,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }

      renderTextResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
