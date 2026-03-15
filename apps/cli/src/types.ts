import type {
  ChatOptions,
  GrokModelsResult,
  GrokTextResult,
  WebSearchOptions,
  XSearchOptions
} from "@grok-agent-kit/core";

export interface CliService {
  chat(input: ChatOptions): Promise<GrokTextResult>;
  xSearch(input: XSearchOptions): Promise<GrokTextResult>;
  webSearch(input: WebSearchOptions): Promise<GrokTextResult>;
  models(includeRaw?: boolean): Promise<GrokModelsResult>;
}

export interface CliDependencies {
  service: CliService;
  startMcpServer: () => Promise<void>;
  writeStdout: (value: string) => void;
  writeStderr: (value: string) => void;
}
