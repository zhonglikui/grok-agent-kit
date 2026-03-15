import { describe, expect, it } from "vitest";

import { readEnvironmentConfig } from "../src/config.js";

describe("readEnvironmentConfig", () => {
  it("reads retry settings from environment variables", () => {
    const config = readEnvironmentConfig({
      XAI_API_KEY: "test-key",
      GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS: "5",
      GROK_AGENT_KIT_RETRY_BASE_DELAY_MS: "400",
      GROK_AGENT_KIT_RETRY_MAX_DELAY_MS: "5000"
    });

    expect(config.retry).toEqual({
      maxAttempts: 5,
      baseDelayMs: 400,
      maxDelayMs: 5000
    });
  });

  it("falls back to sensible retry defaults when retry env vars are missing", () => {
    const config = readEnvironmentConfig({
      XAI_API_KEY: "test-key"
    });

    expect(config.retry).toEqual({
      maxAttempts: 3,
      baseDelayMs: 250,
      maxDelayMs: 4000
    });
  });
});
