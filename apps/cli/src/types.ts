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
  stdinIsTTY?: () => boolean;
  readStdin?: () => Promise<string>;
  writeStdout: (value: string) => void;
  writeStdoutRaw: (value: string) => void;
  writeStderr: (value: string) => void;
}
