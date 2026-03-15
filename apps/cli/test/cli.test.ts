import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

describe("CLI", () => {
  it("dispatches the chat command to the service", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "chat output",
        citations: [],
        responseId: "resp_chat"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const stdout: string[] = [];

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "chat",
      "--prompt",
      "Explain search"
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Explain search"
      })
    );
    expect(stdout[0]).toContain("chat output");
  });

  it("dispatches the x-search command to the service", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "x output",
        citations: []
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const stdout: string[] = [];

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search",
      "--prompt",
      "Search X"
    ]);

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Search X"
      })
    );
    expect(stdout[0]).toContain("x output");
  });

  it("continues a named x-search session and stores the new response id", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "x search output",
        citations: [],
        responseId: "resp_x_next"
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "research",
        responseId: "resp_x_prev",
        updatedAt: "2026-03-16T00:00:00.000Z",
        history: []
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore,
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search",
      "--prompt",
      "Search X session",
      "--session",
      "research"
    ]);

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Search X session",
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
            prompt: "Search X session",
            responseText: "x search output",
            responseId: "resp_x_next"
          })
        ])
      })
    );
  });

  it("streams x-search output incrementally when --stream is used", async () => {
    const stdout: string[] = [];
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("Live");
        await input.onTextDelta?.(" search");

        return {
          text: "Live search",
          citations: [
            {
              url: "https://x.com/xai/status/1"
            }
          ],
          responseId: "resp_x_stream"
        };
      }),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search",
      "--prompt",
      "Stream x results",
      "--stream"
    ]);

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Stream x results",
        onTextDelta: expect.any(Function)
      })
    );
    expect(stdout).toEqual([
      "Live",
      " search",
      "\n\nSources:\n- https://x.com/xai/status/1"
    ]);
  });

  it("starts the MCP server for the mcp command", async () => {
    const startMcpServer = vi.fn().mockResolvedValue(undefined);

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
      },
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer,
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "mcp"
    ]);

    expect(startMcpServer).toHaveBeenCalledTimes(1);
  });

  it("shows help without touching service startup", async () => {
    const serviceTrap = vi.fn();
    const startMcpServer = vi.fn();
    const cli = buildCli({
      service: {
        chat: serviceTrap,
        xSearch: serviceTrap,
        webSearch: serviceTrap,
        models: serviceTrap
      },
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer,
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    cli.exitOverride();

    await expect(
      cli.parseAsync(["node", "grok-agent-kit", "--help"])
    ).rejects.toMatchObject({
      code: "commander.helpDisplayed"
    });

    expect(serviceTrap).not.toHaveBeenCalled();
    expect(startMcpServer).not.toHaveBeenCalled();
  });

  it("continues a named web-search session and stores the new response id", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn().mockResolvedValue({
        text: "web search output",
        citations: [],
        responseId: "resp_web_next"
      }),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "docs",
        responseId: "resp_web_prev",
        updatedAt: "2026-03-16T00:00:00.000Z",
        history: []
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore,
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "web-search",
      "--prompt",
      "Search docs session",
      "--session",
      "docs"
    ]);

    expect(service.webSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Search docs session",
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
            prompt: "Search docs session",
            responseText: "web search output",
            responseId: "resp_web_next"
          })
        ])
      })
    );
  });

  it("streams web-search output incrementally when --stream is used", async () => {
    const stdout: string[] = [];
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("Live");
        await input.onTextDelta?.(" web");

        return {
          text: "Live web",
          citations: [
            {
              url: "https://docs.x.ai"
            }
          ],
          responseId: "resp_web_stream"
        };
      }),
      models: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "web-search",
      "--prompt",
      "Stream web results",
      "--stream"
    ]);

    expect(service.webSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Stream web results",
        onTextDelta: expect.any(Function)
      })
    );
    expect(stdout).toEqual([
      "Live",
      " web",
      "\n\nSources:\n- https://docs.x.ai"
    ]);
  });

  it("continues a named chat session and stores the new response id", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "continued output",
        citations: [],
        responseId: "resp_next"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "alpha",
        responseId: "resp_prev",
        updatedAt: "2026-03-15T00:00:00.000Z",
        history: [
          {
            prompt: "Earlier prompt",
            responseText: "Earlier response",
            responseId: "resp_prev",
            createdAt: "2026-03-15T00:00:00.000Z"
          }
        ]
      }),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore,
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "chat",
      "--prompt",
      "Continue",
      "--session",
      "alpha"
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Continue",
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
            prompt: "Continue",
            responseText: "continued output",
            responseId: "resp_next"
          })
        ])
      })
    );
  });

  it("lists and deletes local sessions", async () => {
    const stdout: string[] = [];
    const sessionStore = {
      get: vi.fn(),
      list: vi.fn().mockResolvedValue([
        {
          name: "alpha",
          responseId: "resp_alpha",
          updatedAt: "2026-03-15T01:00:00.000Z"
        }
      ]),
      set: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
      },
      sessionStore,
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "list"
    ]);
    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "delete",
      "alpha"
    ]);

    expect(stdout[0]).toContain("alpha");
    expect(sessionStore.delete).toHaveBeenCalledWith("alpha");
  });

  it("shows the local transcript for a saved session", async () => {
    const stdout: string[] = [];
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
            createdAt: "2026-03-16T02:00:00.000Z"
          }
        ]
      }),
      list: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    };

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
      },
      sessionStore,
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "show",
      "alpha"
    ]);

    expect(stdout[0]).toContain("Hello");
    expect(stdout[0]).toContain("Hi there");
  });

  it("streams chat output incrementally when --stream is used", async () => {
    const stdout: string[] = [];
    const service = {
      chat: vi.fn().mockImplementation(async (input) => {
        await input.onTextDelta?.("Hello");
        await input.onTextDelta?.(" world");

        return {
          text: "Hello world",
          citations: [
            {
              url: "https://docs.x.ai"
            }
          ],
          responseId: "resp_stream"
        };
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "chat",
      "--prompt",
      "Stream this",
      "--stream"
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Stream this",
        onTextDelta: expect.any(Function)
      })
    );
    expect(stdout).toEqual([
      "Hello",
      " world",
      "\n\nSources:\n- https://docs.x.ai"
    ]);
  });
});
