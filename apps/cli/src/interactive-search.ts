import type {
  GrokTextResult,
  WebSearchOptions,
  XSearchOptions
} from "@grok-agent-kit/core";

import {
  createReadlineInteractiveConsole,
  loadConversationState,
  type ConversationState
} from "./interactive-chat.js";
import { renderStreamResult } from "./output.js";
import { createSessionHistoryEntry } from "./session-history.js";
import type { CliDependencies } from "./types.js";

interface BaseSearchTurnOptions {
  dependencies: CliDependencies;
  prompt: string;
  state: ConversationState;
  sessionName?: string;
  model?: string;
  previousResponseId?: string;
  store?: boolean;
  stream?: boolean;
}

interface InteractiveSearchOptions {
  dependencies: CliDependencies;
  sessionName?: string;
  model?: string;
  previousResponseId?: string;
}

interface ExecuteXSearchTurnOptions extends BaseSearchTurnOptions {
  allowedXHandles?: string[];
  excludedXHandles?: string[];
}

interface ExecuteWebSearchTurnOptions extends BaseSearchTurnOptions {
  allowedWebDomains?: string[];
  excludedWebDomains?: string[];
}

interface InteractiveXSearchOptions extends InteractiveSearchOptions {
  allowedXHandles?: string[];
  excludedXHandles?: string[];
}

interface InteractiveWebSearchOptions extends InteractiveSearchOptions {
  allowedWebDomains?: string[];
  excludedWebDomains?: string[];
}

export async function executeXSearchTurn(
  options: ExecuteXSearchTurnOptions
): Promise<{
  result: GrokTextResult;
  state: ConversationState;
  streamedText: string;
}> {
  return executeSearchTurn<XSearchOptions>({
    options,
    runSearch: async (input) => options.dependencies.service.xSearch(input)
  });
}

export async function executeWebSearchTurn(
  options: ExecuteWebSearchTurnOptions
): Promise<{
  result: GrokTextResult;
  state: ConversationState;
  streamedText: string;
}> {
  return executeSearchTurn<WebSearchOptions>({
    options,
    runSearch: async (input) => options.dependencies.service.webSearch(input)
  });
}

export async function runInteractiveXSearch(
  options: InteractiveXSearchOptions
): Promise<void> {
  await runInteractiveSearch({
    ...options,
    promptLabel: "x-search> ",
    startupHint: "Interactive x-search ready. Commands: /help, /reset, /exit.",
    helpText:
      "Commands: /help shows this message; /reset clears the current conversation; /exit leaves interactive mode.",
    usageHint: "Unknown command. Use /help, /reset, or /exit.",
    executeTurn: async (prompt, state) =>
      executeXSearchTurn({
        dependencies: options.dependencies,
        prompt,
        state,
        sessionName: options.sessionName,
        model: options.model,
        store: true,
        stream: true,
        allowedXHandles: options.allowedXHandles,
        excludedXHandles: options.excludedXHandles
      })
  });
}

export async function runInteractiveWebSearch(
  options: InteractiveWebSearchOptions
): Promise<void> {
  await runInteractiveSearch({
    ...options,
    promptLabel: "web-search> ",
    startupHint:
      "Interactive web-search ready. Commands: /help, /reset, /exit.",
    helpText:
      "Commands: /help shows this message; /reset clears the current conversation; /exit leaves interactive mode.",
    usageHint: "Unknown command. Use /help, /reset, or /exit.",
    executeTurn: async (prompt, state) =>
      executeWebSearchTurn({
        dependencies: options.dependencies,
        prompt,
        state,
        sessionName: options.sessionName,
        model: options.model,
        store: true,
        stream: true,
        allowedWebDomains: options.allowedWebDomains,
        excludedWebDomains: options.excludedWebDomains
      })
  });
}

async function executeSearchTurn<
  TOptions extends XSearchOptions | WebSearchOptions
>(input: {
  options: BaseSearchTurnOptions & Partial<TOptions>;
  runSearch: (input: TOptions) => Promise<GrokTextResult>;
}): Promise<{
  result: GrokTextResult;
  state: ConversationState;
  streamedText: string;
}> {
  if (input.options.sessionName && input.options.store === false) {
    throw new Error("--session cannot be used with --no-store");
  }

  let streamedText = "";
  const result = await input.runSearch({
    prompt: input.options.prompt,
    model: input.options.model,
    previousResponseId:
      input.options.previousResponseId ?? input.options.state.responseId,
    store: input.options.sessionName ? true : input.options.store,
    ...(input.options.stream
      ? {
          onTextDelta: async (chunk: string) => {
            streamedText += chunk;
            input.options.dependencies.writeStdoutRaw(chunk);
          }
        }
      : {}),
    ...toSearchOptionBag(input.options)
  } as TOptions);

  const timestamp = new Date().toISOString();
  const nextState: ConversationState = {
    responseId: result.responseId ?? input.options.state.responseId,
    history: [
      ...input.options.state.history,
      createSessionHistoryEntry(input.options.prompt, result, timestamp)
    ]
  };

  if (input.options.sessionName && nextState.responseId) {
    await input.options.dependencies.sessionStore.set(input.options.sessionName, {
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

async function runInteractiveSearch(input: {
  dependencies: CliDependencies;
  sessionName?: string;
  model?: string;
  previousResponseId?: string;
  promptLabel: string;
  startupHint: string;
  helpText: string;
  usageHint: string;
  executeTurn: (
    prompt: string,
    state: ConversationState
  ) => Promise<{
    result: GrokTextResult;
    state: ConversationState;
    streamedText: string;
  }>;
}): Promise<void> {
  const interactiveConsole = await (
    input.dependencies.createInteractiveConsole?.() ??
    createReadlineInteractiveConsole()
  );
  const replHistoryStore = input.dependencies.replHistoryStore ?? {
    load: async () => [],
    append: async () => undefined
  };
  let state = await loadConversationState({
    dependencies: input.dependencies,
    sessionName: input.sessionName,
    previousResponseId: input.previousResponseId
  });

  try {
    interactiveConsole.setHistory(await replHistoryStore.load());
    input.dependencies.writeStdout(input.startupHint);

    while (true) {
      const line = await interactiveConsole.prompt(input.promptLabel);
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
        if (input.sessionName) {
          await input.dependencies.sessionStore.delete(input.sessionName);
        }

        state = {
          history: []
        };
        input.dependencies.writeStdout("Conversation reset.");
        continue;
      }

      if (trimmedLine === "/help") {
        input.dependencies.writeStdout(input.helpText);
        continue;
      }

      if (trimmedLine.startsWith("/")) {
        input.dependencies.writeStderr(input.usageHint);
        continue;
      }

      await replHistoryStore.append(trimmedLine);
      const turn = await input.executeTurn(trimmedLine, state);
      state = turn.state;
      renderStreamResult(
        turn.result,
        turn.streamedText.length > 0,
        input.dependencies.writeStdout,
        input.dependencies.writeStdoutRaw
      );
      input.dependencies.writeStdout("");
    }
  } finally {
    await interactiveConsole.close();
  }
}

function toSearchOptionBag(
  options: Partial<XSearchOptions & WebSearchOptions>
) {
  return {
    ...(options.allowedXHandles ? { allowedXHandles: options.allowedXHandles } : {}),
    ...(options.excludedXHandles ? { excludedXHandles: options.excludedXHandles } : {}),
    ...(options.allowedWebDomains ? { allowedWebDomains: options.allowedWebDomains } : {}),
    ...(options.excludedWebDomains
      ? { excludedWebDomains: options.excludedWebDomains }
      : {})
  };
}
