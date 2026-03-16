import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createToolHandlers } from "../src/index.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

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

  it("continues a named MCP X Search session and persists the result", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "x session reply",
        citations: [
          {
            url: "https://x.com/xai/status/2"
          }
        ],
        responseId: "resp_x_next"
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "research",
        responseId: "resp_x_prev",
        updatedAt: "2026-03-16T01:00:00.000Z",
        history: []
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const handlers = createToolHandlers(service as never, sessionStore as never);
    await handlers.grok_x_search({
      prompt: "Find launch posts",
      session: "research"
    } as never);

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Find launch posts",
        previousResponseId: "resp_x_prev",
        store: true
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "research",
      expect.objectContaining({
        responseId: "resp_x_next",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Find launch posts",
            responseText: "x session reply"
          })
        ])
      })
    );
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

  it("continues a named MCP Web Search session and persists the result", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn().mockResolvedValue({
        text: "web session reply",
        citations: [
          {
            url: "https://docs.x.ai/en/latest"
          }
        ],
        responseId: "resp_web_next"
      }),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "docs",
        responseId: "resp_web_prev",
        updatedAt: "2026-03-16T01:00:00.000Z",
        history: []
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const handlers = createToolHandlers(service as never, sessionStore as never);
    await handlers.grok_web_search({
      prompt: "Find docs updates",
      session: "docs"
    } as never);

    expect(service.webSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Find docs updates",
        previousResponseId: "resp_web_prev",
        store: true
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "docs",
      expect.objectContaining({
        responseId: "resp_web_next",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Find docs updates",
            responseText: "web session reply"
          })
        ])
      })
    );
  });

  it("resets a named MCP search session before issuing a new request", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "fresh x session",
        citations: [],
        responseId: "resp_x_fresh"
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue(undefined),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    const handlers = createToolHandlers(service as never, sessionStore as never);
    await handlers.grok_x_search({
      prompt: "Start over",
      session: "research",
      resetSession: true
    } as never);

    expect(sessionStore.delete).toHaveBeenCalledWith("research");
    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Start over",
        store: true
      })
    );
    expect(service.xSearch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        previousResponseId: expect.anything()
      })
    );
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

  it("lists saved local sessions via MCP", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn(),
      list: vi.fn().mockResolvedValue([
        {
          name: "alpha",
          responseId: "resp_alpha",
          updatedAt: "2026-03-16T02:00:00.000Z",
          history: []
        }
      ]),
      set: vi.fn(),
      delete: vi.fn()
    };

    const handlers = (createToolHandlers as any)(service, sessionStore);
    const result = await handlers.grok_list_sessions({});

    expect(sessionStore.list).toHaveBeenCalledTimes(1);
    expect(result.structuredContent.sessions).toEqual([
      expect.objectContaining({
        name: "alpha"
      })
    ]);
  });

  it("returns a saved session transcript via MCP", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "alpha",
        responseId: "resp_alpha",
        updatedAt: "2026-03-16T02:00:00.000Z",
        history: [
          {
            prompt: "Hello",
            responseText: "Hi there",
            responseId: "resp_alpha",
            createdAt: "2026-03-16T02:00:00.000Z",
            citations: []
          }
        ]
      }),
      list: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };

    const handlers = (createToolHandlers as any)(service, sessionStore);
    const result = await handlers.grok_get_session({
      name: "alpha"
    });

    expect(sessionStore.get).toHaveBeenCalledWith("alpha");
    expect(result.structuredContent.session).toEqual(
      expect.objectContaining({
        name: "alpha"
      })
    );
  });

  it("deletes a saved session via MCP", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn(),
      list: vi.fn(),
      set: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    const handlers = (createToolHandlers as any)(service, sessionStore);
    const result = await handlers.grok_delete_session({
      name: "alpha"
    });

    expect(sessionStore.delete).toHaveBeenCalledWith("alpha");
    expect(result.content[0]?.text).toContain("Deleted session alpha");
  });

  it("continues a named MCP chat session and persists the result", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "continued reply",
        citations: [],
        responseId: "resp_next",
        model: "grok-4"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "alpha",
        responseId: "resp_prev",
        updatedAt: "2026-03-16T01:00:00.000Z",
        history: [
          {
            prompt: "Earlier prompt",
            responseText: "Earlier response",
            responseId: "resp_prev",
            createdAt: "2026-03-16T01:00:00.000Z",
            citations: []
          }
        ]
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const handlers = (createToolHandlers as any)(service, sessionStore);
    await handlers.grok_chat({
      prompt: "Continue locally",
      session: "alpha"
    });

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Continue locally",
        previousResponseId: "resp_prev",
        store: true
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "alpha",
      expect.objectContaining({
        responseId: "resp_next",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Continue locally",
            responseText: "continued reply"
          })
        ])
      })
    );
  });

  it("passes resolved local images into MCP chat requests", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-mcp-image-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "screen.png");
    writeFileSync(imagePath, Buffer.from("png-binary"), "utf8");

    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "vision reply",
        citations: [],
        responseId: "resp_vision"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const handlers = createToolHandlers(service);
    await handlers.grok_chat({
      prompt: "Describe the screenshot",
      images: [
        imagePath
      ]
    } as never);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Describe the screenshot",
        images: [
          expect.objectContaining({
            path: imagePath,
            fileName: "screen.png",
            mediaType: "image/png",
            dataUrl: expect.stringContaining("data:image/png;base64,")
          })
        ],
        store: false
      })
    );
  });

  it("replays named MCP sessions locally after an image turn", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-mcp-image-history-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "screen.png");
    writeFileSync(imagePath, Buffer.from("png-binary"), "utf8");

    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "continued reply",
        citations: [],
        responseId: "resp_next"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "vision",
        responseId: "resp_prev",
        updatedAt: "2026-03-16T01:00:00.000Z",
        history: [
          {
            prompt: "Describe the screenshot",
            responseText: "It shows a dashboard.",
            responseId: "resp_prev",
            createdAt: "2026-03-16T01:00:00.000Z",
            citations: [],
            images: [
              {
                path: imagePath,
                fileName: "screen.png",
                mediaType: "image/png"
              }
            ]
          }
        ]
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const handlers = createToolHandlers(service as never, sessionStore as never);
    await handlers.grok_chat({
      prompt: "What changed next?",
      session: "vision"
    });

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "What changed next?",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Describe the screenshot"
          })
        ]),
        store: false
      })
    );
    expect(service.chat).not.toHaveBeenCalledWith(
      expect.objectContaining({
        previousResponseId: "resp_prev"
      })
    );
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
