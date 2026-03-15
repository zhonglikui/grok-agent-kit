import type {
  XaiCitation,
  XaiModel,
  XaiRetryOptions,
  XaiTransportLike
} from "@grok-agent-kit/xai-client";

export interface BasePromptOptions {
  prompt: string;
  system?: string;
  model?: string;
  include?: string[];
  includeRaw?: boolean;
  maxOutputTokens?: number;
  temperature?: number;
  responseOverrides?: Record<string, unknown>;
}

export interface XSearchOptions extends BasePromptOptions {
  allowedXHandles?: string[];
  excludedXHandles?: string[];
  toolOverrides?: Record<string, unknown>;
}

export interface WebSearchOptions extends BasePromptOptions {
  allowedWebDomains?: string[];
  excludedWebDomains?: string[];
  toolOverrides?: Record<string, unknown>;
}

export interface ChatOptions extends BasePromptOptions {
  xSearch?: Pick<XSearchOptions, "allowedXHandles" | "excludedXHandles" | "toolOverrides">;
  webSearch?: Pick<
    WebSearchOptions,
    "allowedWebDomains" | "excludedWebDomains" | "toolOverrides"
  >;
}

export interface GrokTextResult {
  text: string;
  model?: string;
  citations: XaiCitation[];
  raw?: unknown;
}

export interface GrokModelsResult {
  models: XaiModel[];
  raw?: unknown;
}

export interface GrokServiceOptions {
  client: XaiTransportLike;
  defaultModel?: string;
}

export interface GrokEnvironmentConfig {
  apiKey?: string;
  baseUrl: string;
  defaultModel: string;
  timeoutMs?: number;
  retry: Required<Pick<XaiRetryOptions, "maxAttempts" | "baseDelayMs" | "maxDelayMs">>;
}
