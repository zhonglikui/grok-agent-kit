import { Command } from "commander";

import {
  executeXSearchTurn,
  runInteractiveXSearch
} from "../interactive-search.js";
import { loadConversationState } from "../interactive-chat.js";
import { renderStreamResult, renderTextResult } from "../output.js";
import { readPipedStdin, resolvePromptInput } from "../prompt-input.js";
import type { CliDependencies } from "../types.js";

export function createXSearchCommand(dependencies: CliDependencies): Command {
  return new Command("x-search")
    .description("Answer a prompt using xAI X Search")
    .option("--prompt <prompt>", "Prompt text")
    .option("-f, --prompt-file <path>", "Read prompt text from a file")
    .option("--model <model>", "Override model")
    .option("--session <name>", "Continue or create a named local session")
    .option("--reset-session", "Reset the named session before sending the prompt")
    .option("-i, --interactive", "Start an interactive X Search REPL")
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

      if (options.interactive) {
        if (options.store === false) {
          throw new Error("--interactive cannot be used with --no-store");
        }

        if (options.json) {
          throw new Error("--interactive cannot be used with --json");
        }

        if (options.prompt || options.promptFile) {
          throw new Error("--interactive cannot be used with prompt input flags");
        }

        const stdinIsTTY = dependencies.stdinIsTTY ?? (() => process.stdin.isTTY ?? true);
        if (!stdinIsTTY()) {
          throw new Error("--interactive requires a TTY and cannot use piped stdin");
        }

        await runInteractiveXSearch({
          dependencies,
          sessionName: options.session,
          model: options.model,
          previousResponseId: options.previousResponseId,
          allowedXHandles: options.allowHandle,
          excludedXHandles: options.excludeHandle
        });
        return;
      }

      const prompt = await resolvePromptInput({
        prompt: options.prompt,
        promptFile: options.promptFile,
        stdinText: await readPipedStdin({
          stdinIsTTY: dependencies.stdinIsTTY,
          readStdin: dependencies.readStdin
        })
      });
      const state = await loadConversationState({
        dependencies,
        sessionName: options.session,
        previousResponseId: options.previousResponseId
      });
      const { result, streamedText } = await executeXSearchTurn({
        dependencies,
        prompt,
        state,
        sessionName: options.session,
        model: options.model,
        previousResponseId: options.previousResponseId,
        store: options.session ? true : options.store,
        stream: options.stream,
        allowedXHandles: options.allowHandle,
        excludedXHandles: options.excludeHandle
      });

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
