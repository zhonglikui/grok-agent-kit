import { resolveLocalImageInputs, toSessionImageReferences } from "@grok-agent-kit/core";
import { Command } from "commander";

import {
  executeChatTurn,
  loadChatConversationState,
  runInteractiveChat
} from "../interactive-chat.js";
import { renderStreamResult, renderTextResult } from "../output.js";
import { readPipedStdin, resolveOptionalTextInput, resolvePromptInput } from "../prompt-input.js";
import type { CliDependencies } from "../types.js";

export function createChatCommand(dependencies: CliDependencies): Command {
  return new Command("chat")
    .description("Send a plain chat prompt to xAI Grok")
    .option("--prompt <prompt>", "Prompt text")
    .option("-f, --prompt-file <path>", "Read prompt text from a file")
    .option(
      "--image <path>",
      "Attach a local PNG or JPEG image",
      collectImagePath,
      []
    )
    .option("--system <system>", "System prompt")
    .option("--system-file <path>", "Read system prompt from a file")
    .option("--model <model>", "Override model")
    .option("--session <name>", "Continue or create a named local session")
    .option("--reset-session", "Reset the named session before sending the prompt")
    .option("-i, --interactive", "Start an interactive chat REPL")
    .option(
      "--previous-response-id <id>",
      "Continue from a previous xAI response id"
    )
    .option("--no-store", "Do not store the response on xAI")
    .option("--stream", "Stream text output as it arrives")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      if (options.stream && options.json) {
        throw new Error("--stream cannot be used with --json");
      }

      if (options.resetSession && !options.session) {
        throw new Error("--reset-session requires --session");
      }

      if (options.resetSession && options.session) {
        await dependencies.sessionStore.delete(options.session);
      }

      const system = await resolveOptionalTextInput({
        value: options.system,
        filePath: options.systemFile,
        valueFlag: "--system",
        fileFlag: "--system-file",
        label: "system prompt"
      });

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

        await runInteractiveChat({
          dependencies,
          sessionName: options.session,
          system,
          model: options.model,
          previousResponseId: options.previousResponseId
        });
        return;
      }

      const stdinText = await readPipedStdin({
        stdinIsTTY: dependencies.stdinIsTTY,
        readStdin: dependencies.readStdin
      });
      const prompt = await resolvePromptInput({
        prompt: options.prompt,
        promptFile: options.promptFile,
        stdinText
      });
      const resolvedImages = await resolveLocalImageInputs(options.image ?? []);
      const state = await loadChatConversationState({
        dependencies,
        sessionName: options.session,
        previousResponseId: options.previousResponseId
      });
      const { result, streamedText } = await executeChatTurn({
        dependencies,
        prompt,
        state,
        sessionName: options.session,
        system,
        model: options.model,
        images: resolvedImages,
        previousResponseId: options.previousResponseId,
        store: options.session ? true : options.store,
        stream: options.stream
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

function collectImagePath(value: string, previous: string[]): string[] {
  return [
    ...previous,
    value
  ];
}
