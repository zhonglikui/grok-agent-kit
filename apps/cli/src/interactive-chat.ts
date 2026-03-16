import { createInterface } from "node:readline";

import {
  resolveLocalImageInputs,
  toSessionImageReferences
} from "@grok-agent-kit/core";
import type {
  GrokTextResult,
  ResolvedLocalImageInput
} from "@grok-agent-kit/core";

import { renderStreamResult } from "./output.js";
import { createSessionHistoryEntry } from "./session-history.js";
import type { SessionHistoryEntry } from "./session-store.js";
import type {
  CliDependencies,
  InteractiveConsole
} from "./types.js";

export interface ConversationState {
  responseId?: string;
  history: SessionHistoryEntry[];
}

export interface ExecuteChatTurnOptions {
  dependencies: CliDependencies;
  prompt: string;
  state: ConversationState;
  sessionName?: string;
  system?: string;
  model?: string;
  images?: ResolvedLocalImageInput[];
  previousResponseId?: string;
  store?: boolean;
  stream?: boolean;
}

export interface InteractiveChatOptions {
  dependencies: CliDependencies;
  sessionName?: string;
  system?: string;
  model?: string;
  previousResponseId?: string;
}

const INTERACTIVE_CHAT_STARTUP_HINT =
  "Interactive chat ready. Commands: /help, /image <path>, /reset, /exit.";
const INTERACTIVE_CHAT_HELP =
  "Commands: /help shows this message; /image <path> queues local images; /reset clears the current conversation; /exit leaves interactive mode.";
const INTERACTIVE_CHAT_UNKNOWN_COMMAND =
  "Unknown command. Use /help, /image <path>, /reset, or /exit.";

export async function loadConversationState(options: {
  dependencies: CliDependencies;
  sessionName?: string;
  previousResponseId?: string;
}): Promise<ConversationState> {
  const existingSession = options.sessionName
    ? await options.dependencies.sessionStore.get(options.sessionName)
    : undefined;

  return {
    responseId: options.previousResponseId ?? existingSession?.responseId,
    history: existingSession?.history ?? []
  };
}

export async function executeChatTurn(
  options: ExecuteChatTurnOptions
): Promise<{
  result: GrokTextResult;
  state: ConversationState;
  streamedText: string;
}> {
  const resolvedImages = options.images ?? [];
  const shouldReplayLocally =
    resolvedImages.length > 0 || hasImageHistory(options.state.history);

  if (options.sessionName && options.store === false && !shouldReplayLocally) {
    throw new Error("--session cannot be used with --no-store");
  }

  if (options.previousResponseId && shouldReplayLocally) {
    throw new Error(
      "--previous-response-id cannot be used with image-backed chats; use --session instead"
    );
  }

  let streamedText = "";
  const result = await options.dependencies.service.chat({
    prompt: options.prompt,
    system: options.system,
    model: options.model,
    ...(resolvedImages.length > 0 ? { images: resolvedImages } : {}),
    ...(shouldReplayLocally && options.state.history.length > 0
      ? { history: toChatHistory(options.state.history) }
      : {}),
    previousResponseId: shouldReplayLocally
      ? undefined
      : options.previousResponseId ?? options.state.responseId,
    store: shouldReplayLocally ? false : options.store,
    ...(options.stream
      ? {
          onTextDelta: async (chunk: string) => {
            streamedText += chunk;
            options.dependencies.writeStdoutRaw(chunk);
          }
        }
      : {})
  });

  const timestamp = new Date().toISOString();
  const nextState: ConversationState = {
    responseId: result.responseId ?? options.state.responseId,
    history: [
      ...options.state.history,
      createSessionHistoryEntry(
        options.prompt,
        result,
        timestamp,
        toSessionImageReferences(resolvedImages)
      )
    ]
  };

  if (options.sessionName && nextState.responseId) {
    await options.dependencies.sessionStore.set(options.sessionName, {
      responseId: nextState.responseId,
      updatedAt: timestamp,
      history: nextState.history
    });
  }

  return {
    result,
    state: nextState,
    streamedText
  };
}

export async function runInteractiveChat(
  options: InteractiveChatOptions
): Promise<void> {
  const interactiveConsole = await (
    options.dependencies.createInteractiveConsole?.() ??
    createReadlineInteractiveConsole()
  );
  const replHistoryStore = options.dependencies.replHistoryStore ?? {
    load: async () => [],
    append: async () => undefined
  };

  let state = await loadConversationState({
    dependencies: options.dependencies,
    sessionName: options.sessionName,
    previousResponseId: options.previousResponseId
  });
  let queuedImages: ResolvedLocalImageInput[] = [];

  try {
    interactiveConsole.setHistory(await replHistoryStore.load());
    options.dependencies.writeStdout(INTERACTIVE_CHAT_STARTUP_HINT);

    while (true) {
      const line = await interactiveConsole.prompt("grok> ");
      if (line === undefined) {
        break;
      }

      const trimmedLine = line.trim();
      if (!trimmedLine) {
        continue;
      }

      if (trimmedLine === "/exit") {
        break;
      }

      if (trimmedLine === "/reset") {
        if (options.sessionName) {
          await options.dependencies.sessionStore.delete(options.sessionName);
        }

        state = {
          history: []
        };
        queuedImages = [];
        options.dependencies.writeStdout("Conversation reset.");
        continue;
      }

      if (trimmedLine === "/help") {
        options.dependencies.writeStdout(INTERACTIVE_CHAT_HELP);
        continue;
      }

      if (trimmedLine.startsWith("/image")) {
        const imagePath = trimmedLine.slice("/image".length).trim();
        if (!imagePath) {
          options.dependencies.writeStderr("Usage: /image <path>");
          continue;
        }

        try {
          const resolvedImages = await resolveLocalImageInputs([imagePath]);
          queuedImages = [...queuedImages, ...resolvedImages];
          options.dependencies.writeStdout(
            `Queued ${resolvedImages.length} image(s) for the next prompt.`
          );
        } catch (error) {
          const detail = error instanceof Error ? error.message : "Unknown image error";
          options.dependencies.writeStderr(detail);
        }
        continue;
      }

      if (trimmedLine.startsWith("/")) {
        options.dependencies.writeStderr(INTERACTIVE_CHAT_UNKNOWN_COMMAND);
        continue;
      }

      await replHistoryStore.append(trimmedLine);
      const turn = await executeChatTurn({
        dependencies: options.dependencies,
        prompt: trimmedLine,
        state,
        sessionName: options.sessionName,
        system: options.system,
        model: options.model,
        images: queuedImages,
        store: true,
        stream: true
      });
      state = turn.state;
      renderStreamResult(
        turn.result,
        turn.streamedText.length > 0,
        options.dependencies.writeStdout,
        options.dependencies.writeStdoutRaw
      );
      options.dependencies.writeStdout("");
      queuedImages = [];
    }
  } finally {
    await interactiveConsole.close();
  }
}

export function createReadlineInteractiveConsole(): InteractiveConsole {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 200,
    terminal: (process.stdin.isTTY ?? false) && (process.stdout.isTTY ?? false)
  });
  const readlineWithHistory = readline as typeof readline & {
    history: string[];
  };
  let isClosed = false;

  return {
    async prompt(message) {
      if (isClosed) {
        return undefined;
      }

      return await new Promise<string | undefined>((resolve) => {
        const handleClose = () => {
          readline.off("close", handleClose);
          resolve(undefined);
        };

        readline.once("close", handleClose);
        readline.question(message, (answer) => {
          readline.off("close", handleClose);
          resolve(answer);
        });
      });
    },

    setHistory(entries) {
      readlineWithHistory.history = [...entries].reverse();
    },

    async close() {
      if (isClosed) {
        return;
      }

      isClosed = true;
      readline.close();
    }
  };
}

function toChatHistory(history: SessionHistoryEntry[]) {
  return history.map((entry) => ({
    prompt: entry.prompt,
    responseText: entry.responseText,
    ...(entry.images ? { images: entry.images } : {})
  }));
}

function hasImageHistory(history: SessionHistoryEntry[]): boolean {
  return history.some((entry) => (entry.images?.length ?? 0) > 0);
}
