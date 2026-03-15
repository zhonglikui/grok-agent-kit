import { XaiClient } from "@grok-agent-kit/xai-client";

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

  return {
    apiKey: env.XAI_API_KEY,
    baseUrl: env.XAI_BASE_URL ?? "https://api.x.ai/v1",
    defaultModel: env.GROK_AGENT_KIT_MODEL ?? "grok-4",
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined
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
      timeoutMs: config.timeoutMs
    }),
    defaultModel: config.defaultModel
  });
}
