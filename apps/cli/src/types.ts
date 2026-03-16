import type {
  ChatOptions,
  GrokModelsResult,
  GrokTextResult,
  WebSearchOptions,
  XSearchOptions
} from "@grok-agent-kit/core";

import type { SessionStore } from "./session-store.js";

export interface CliService {
  chat(input: ChatOptions): Promise<GrokTextResult>;
  xSearch(input: XSearchOptions): Promise<GrokTextResult>;
  webSearch(input: WebSearchOptions): Promise<GrokTextResult>;
  models(includeRaw?: boolean): Promise<GrokModelsResult>;
}

export interface CliDependencies {
  service: CliService;
  sessionStore: SessionStore;
  startMcpServer: () => Promise<void>;
  createInteractiveConsole?: () => Promise<InteractiveConsole> | InteractiveConsole;
  replHistoryStore?: ReplHistoryStore;
  stdinIsTTY?: () => boolean;
  readStdin?: () => Promise<string>;
  writeStdout: (value: string) => void;
  writeStdoutRaw: (value: string) => void;
  writeStderr: (value: string) => void;
}

export interface InteractiveConsole {
  prompt(message: string): Promise<string | undefined>;
  setHistory(entries: string[]): void;
  close(): Promise<void> | void;
}

export interface ReplHistoryStore {
  load(): Promise<string[]>;
  append(entry: string): Promise<void>;
}
