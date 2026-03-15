import { describe, expect, it, vi } from "vitest";

import { createToolHandlers } from "../src/index.js";

describe("createToolHandlers", () => {
  it("returns structured chat output", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "chat result",
        citations: [],
        responseId: "resp_chat"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_chat({
      prompt: "Say hi",
      previousResponseId: "resp_prev",
      store: true
    });

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Say hi",
        previousResponseId: "resp_prev",
        store: true
      })
    );
    expect(result.structuredContent.text).toBe("chat result");
    expect(result.structuredContent.responseId).toBe("resp_chat");
  });

  it("returns structured X Search output", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "x result",
        citations: [
          {
            url: "https://x.com/example/status/1"
          }
        ]
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_x_search({
      prompt: "Find launch posts"
    });

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Find launch posts"
      })
    );
    expect(result.structuredContent.citations).toHaveLength(1);
  });

  it("returns structured model output", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn().mockResolvedValue({
        models: [
          {
            id: "grok-4",
            object: "model"
          }
        ]
      })
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_models({});

    expect(service.models).toHaveBeenCalledTimes(1);
    expect(result.structuredContent.models).toEqual([
      {
        id: "grok-4",
        object: "model"
      }
    ]);
  });
});
