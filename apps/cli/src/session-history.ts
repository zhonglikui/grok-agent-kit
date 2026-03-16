import type { GrokTextResult } from "@grok-agent-kit/core";

import type { SessionHistoryEntry } from "./session-store.js";

export function createSessionHistoryEntry(
  prompt: string,
  result: GrokTextResult,
  createdAt: string
): SessionHistoryEntry {
  return {
    prompt,
    responseText: result.text,
    responseId: result.responseId,
    createdAt,
    ...(result.model ? { model: result.model } : {}),
    citations: result.citations,
    ...(result.usage ? { usage: result.usage } : {})
  };
}
