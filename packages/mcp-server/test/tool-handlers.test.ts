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

  it("emits progress notifications for streamed X Search requests", async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("First");
        await input.onTextDelta?.(" result");

        return {
          text: "First result",
          citations: [],
          responseId: "resp_x_stream"
        };
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_x_search(
      {
        prompt: "Find launch posts",
        previousResponseId: "resp_prev",
        stream: true
      } as never,
      {
        _meta: {
          progressToken: "progress-x"
        },
        sendNotification
      } as never
    );

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Find launch posts",
        previousResponseId: "resp_prev",
        onTextDelta: expect.any(Function)
      })
    );
    expect(sendNotification).toHaveBeenNthCalledWith(1, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-x",
        progress: 1,
        message: "First"
      }
    });
    expect(sendNotification).toHaveBeenNthCalledWith(2, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-x",
        progress: 2,
        message: " result"
      }
    });
    expect(result.structuredContent.text).toBe("First result");
  });

  it("emits progress notifications for streamed chat requests", async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const service = {
      chat: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("Hello");
        await input.onTextDelta?.(" world");

        return {
          text: "Hello world",
          citations: [],
          responseId: "resp_stream"
        };
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_chat(
      {
        prompt: "Stream to MCP",
        stream: true
      },
      {
        _meta: {
          progressToken: "progress-1"
        },
        sendNotification
      } as never
    );

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Stream to MCP",
        onTextDelta: expect.any(Function)
      })
    );
    expect(sendNotification).toHaveBeenNthCalledWith(1, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-1",
        progress: 1,
        message: "Hello"
      }
    });
    expect(sendNotification).toHaveBeenNthCalledWith(2, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-1",
        progress: 2,
        message: " world"
      }
    });
    expect(result.structuredContent.text).toBe("Hello world");
  });

  it("emits progress notifications for streamed Web Search requests", async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("Web");
        await input.onTextDelta?.(" result");

        return {
          text: "Web result",
          citations: [],
          responseId: "resp_web_stream"
        };
      }),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_web_search(
      {
        prompt: "Find docs",
        allowedWebDomains: ["example.com"],
        stream: true
      } as never,
      {
        _meta: {
          progressToken: "progress-web"
        },
        sendNotification
      } as never
    );

    expect(service.webSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Find docs",
        allowedWebDomains: ["example.com"],
        onTextDelta: expect.any(Function)
      })
    );
    expect(sendNotification).toHaveBeenNthCalledWith(1, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-web",
        progress: 1,
        message: "Web"
      }
    });
    expect(sendNotification).toHaveBeenNthCalledWith(2, {
      method: "notifications/progress",
      params: {
        progressToken: "progress-web",
        progress: 2,
        message: " result"
      }
    });
    expect(result.structuredContent.text).toBe("Web result");
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

  it("wraps service failures in MCP error output", async () => {
    const service = {
      chat: vi.fn().mockRejectedValue(new Error("missing API key")),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    const result = await handlers.grok_chat({
      prompt: "Fail"
    });

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain("missing API key");
    expect(result.structuredContent).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "missing API key"
        })
      })
    );
  });
});
