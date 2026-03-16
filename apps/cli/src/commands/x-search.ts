import { Command } from "commander";

import { renderStreamResult, renderTextResult } from "../output.js";
import { readPipedStdin, resolvePromptInput } from "../prompt-input.js";
import { createSessionHistoryEntry } from "../session-history.js";
import type { CliDependencies } from "../types.js";

export function createXSearchCommand(dependencies: CliDependencies): Command {
  return new Command("x-search")
    .description("Answer a prompt using xAI X Search")
    .option("--prompt <prompt>", "Prompt text")
    .option("-f, --prompt-file <path>", "Read prompt text from a file")
    .option("--model <model>", "Override model")
    .option("--session <name>", "Continue or create a named local session")
    .option("--reset-session", "Reset the named session before sending the prompt")
    .option(
      "--previous-response-id <id>",
      "Continue from a previous xAI response id"
    )
    .option("--no-store", "Do not store the response on xAI")
    .option("--allow-handle <handles...>", "Allow only these X handles")
    .option("--exclude-handle <handles...>", "Exclude these X handles")
    .option("--stream", "Stream text output as it arrives")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      if (options.session && options.store === false) {
        throw new Error("--session cannot be used with --no-store");
      }

      if (options.stream && options.json) {
        throw new Error("--stream cannot be used with --json");
      }

      if (options.resetSession && !options.session) {
        throw new Error("--reset-session requires --session");
      }

      if (options.resetSession && options.session) {
        await dependencies.sessionStore.delete(options.session);
      }

      const prompt = await resolvePromptInput({
        prompt: options.prompt,
        promptFile: options.promptFile,
        stdinText: await readPipedStdin({
          stdinIsTTY: dependencies.stdinIsTTY,
          readStdin: dependencies.readStdin
        })
      });

      let existingSession = undefined;
      let previousResponseId = options.previousResponseId as string | undefined;

      if (!previousResponseId && options.session) {
        existingSession = await dependencies.sessionStore.get(options.session);
        previousResponseId = existingSession?.responseId;
      } else if (options.session) {
        existingSession = await dependencies.sessionStore.get(options.session);
      }

      let streamedText = "";
      const result = await dependencies.service.xSearch({
        prompt,
        model: options.model,
        previousResponseId,
        store: options.session ? true : options.store,
        allowedXHandles: options.allowHandle,
        excludedXHandles: options.excludeHandle,
        ...(options.stream
          ? {
              onTextDelta: async (chunk: string) => {
                streamedText += chunk;
                dependencies.writeStdoutRaw(chunk);
              }
            }
          : {})
      });

      const nextResponseId = result.responseId ?? existingSession?.responseId;

      if (options.session && nextResponseId) {
        const timestamp = new Date().toISOString();

        await dependencies.sessionStore.set(options.session, {
          responseId: nextResponseId,
          updatedAt: timestamp,
          history: [
            ...(existingSession?.history ?? []),
            createSessionHistoryEntry(prompt, result, timestamp)
          ]
        });
      }

      if (options.stream) {
        renderStreamResult(
          result,
          streamedText.length > 0,
          dependencies.writeStdout,
          dependencies.writeStdoutRaw
        );
        return;
      }

      renderTextResult(result, Boolean(options.json), dependencies.writeStdout);
    });
}
