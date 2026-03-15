import {
  DEFAULT_XAI_RETRY_OPTIONS,
  XaiClient
} from "@grok-agent-kit/xai-client";

import { GrokService } from "./grok-service.js";
import type { GrokEnvironmentConfig } from "./types.js";

export function readEnvironmentConfig(
  env: NodeJS.ProcessEnv = process.env
): GrokEnvironmentConfig {
  const timeoutRaw = env.GROK_AGENT_KIT_TIMEOUT_MS;
  const timeoutMs =
    timeoutRaw !== undefined && timeoutRaw.length > 0
      ? Number(timeoutRaw)
      : undefined;
  const retryMaxAttemptsRaw = env.GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS;
  const retryBaseDelayRaw = env.GROK_AGENT_KIT_RETRY_BASE_DELAY_MS;
  const retryMaxDelayRaw = env.GROK_AGENT_KIT_RETRY_MAX_DELAY_MS;
  const retryMaxAttempts =
    retryMaxAttemptsRaw !== undefined && retryMaxAttemptsRaw.length > 0
      ? Number(retryMaxAttemptsRaw)
      : DEFAULT_XAI_RETRY_OPTIONS.maxAttempts;
  const retryBaseDelayMs =
    retryBaseDelayRaw !== undefined && retryBaseDelayRaw.length > 0
      ? Number(retryBaseDelayRaw)
      : DEFAULT_XAI_RETRY_OPTIONS.baseDelayMs;
  const retryMaxDelayMs =
    retryMaxDelayRaw !== undefined && retryMaxDelayRaw.length > 0
      ? Number(retryMaxDelayRaw)
      : DEFAULT_XAI_RETRY_OPTIONS.maxDelayMs;

  return {
    apiKey: env.XAI_API_KEY,
    baseUrl: env.XAI_BASE_URL ?? "https://api.x.ai/v1",
    defaultModel: env.GROK_AGENT_KIT_MODEL ?? "grok-4",
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
    retry: {
      maxAttempts: Number.isFinite(retryMaxAttempts)
        ? Math.max(retryMaxAttempts, 1)
        : DEFAULT_XAI_RETRY_OPTIONS.maxAttempts,
      baseDelayMs: Number.isFinite(retryBaseDelayMs)
        ? Math.max(retryBaseDelayMs, 0)
        : DEFAULT_XAI_RETRY_OPTIONS.baseDelayMs,
      maxDelayMs: Number.isFinite(retryMaxDelayMs)
        ? Math.max(retryMaxDelayMs, 0)
        : DEFAULT_XAI_RETRY_OPTIONS.maxDelayMs
    }
  };
}

export function createDefaultGrokService(
  env: NodeJS.ProcessEnv = process.env
): GrokService {
  const config = readEnvironmentConfig(env);

  if (!config.apiKey) {
    throw new Error("XAI_API_KEY is required");
  }

  return new GrokService({
    client: new XaiClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeoutMs: config.timeoutMs,
      retry: config.retry
    }),
    defaultModel: config.defaultModel
  });
}
