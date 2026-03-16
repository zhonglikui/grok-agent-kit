import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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

  it("reports a missing XAI_API_KEY in doctor output", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
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
        stdinIsTTY: () => true,
        readStdin: vi.fn(),
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      });

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("FAIL");
    expect(stdout[0]).toContain("XAI_API_KEY");
  });

  it("reports a healthy doctor summary when required env is present", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "test-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
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
        stdinIsTTY: () => true,
        readStdin: vi.fn(),
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      });

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("PASS");
    expect(stdout[0]).toContain("XAI_API_KEY");
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
        model: "grok-4",
        citations: [
          {
            url: "https://docs.x.ai"
          }
        ],
        usage: {
          promptTokens: 12,
          completionTokens: 8,
          totalTokens: 20
        },
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
            createdAt: "2026-03-15T00:00:00.000Z",
            citations: []
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
            responseId: "resp_next",
            model: "grok-4",
            citations: [
              {
                url: "https://docs.x.ai"
              }
            ],
            usage: {
              promptTokens: 12,
              completionTokens: 8,
              totalTokens: 20
            }
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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

  it("filters sessions list by regex search and limit", async () => {
    const stdout: string[] = [];
    const sessionStore = {
      get: vi.fn(),
      list: vi.fn().mockResolvedValue([
        {
          name: "alpha",
          responseId: "resp_alpha",
          updatedAt: "2026-03-16T02:00:00.000Z",
          history: [
            {
              prompt: "Debug auth",
              responseText: "Investigate auth logs",
              responseId: "resp_alpha",
              createdAt: "2026-03-16T02:00:00.000Z",
              citations: [],
              model: "grok-4"
            }
          ]
        },
        {
          name: "beta",
          responseId: "resp_beta",
          updatedAt: "2026-03-16T01:00:00.000Z",
          history: [
            {
              prompt: "Brainstorm docs",
              responseText: "Write docs outline",
              responseId: "resp_beta",
              createdAt: "2026-03-16T01:00:00.000Z",
              citations: [],
              model: "grok-4"
            }
          ]
        }
      ]),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "list",
      "--search",
      "auth",
      "--limit",
      "1"
    ]);

    expect(stdout[0]).toContain("alpha");
    expect(stdout[0]).not.toContain("beta");
  });

  it("filters sessions list by model", async () => {
    const stdout: string[] = [];
    const sessionStore = {
      get: vi.fn(),
      list: vi.fn().mockResolvedValue([
        {
          name: "alpha",
          responseId: "resp_alpha",
          updatedAt: "2026-03-16T02:00:00.000Z",
          history: [
            {
              prompt: "Hello",
              responseText: "Hi",
              responseId: "resp_alpha",
              createdAt: "2026-03-16T02:00:00.000Z",
              citations: [],
              model: "grok-4"
            }
          ]
        },
        {
          name: "beta",
          responseId: "resp_beta",
          updatedAt: "2026-03-16T01:00:00.000Z",
          history: [
            {
              prompt: "Hello",
              responseText: "Hi",
              responseId: "resp_beta",
              createdAt: "2026-03-16T01:00:00.000Z",
              citations: [],
              model: "grok-3-mini"
            }
          ]
        }
      ]),
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "list",
      "--model",
      "grok-3-mini"
    ]);

    expect(stdout[0]).toContain("beta");
    expect(stdout[0]).not.toContain("alpha");
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
            createdAt: "2026-03-16T02:00:00.000Z",
            model: "grok-4",
            citations: [
              {
                url: "https://docs.x.ai"
              }
            ],
            usage: {
              promptTokens: 10,
              completionTokens: 30,
              totalTokens: 40
            }
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
    expect(stdout[0]).toContain("Models: grok-4");
    expect(stdout[0]).toContain("Total tokens: 40");
    expect(stdout[0]).toContain("(grok-4)");
  });

  it("exports a saved session as markdown", async () => {
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
            createdAt: "2026-03-16T02:00:00.000Z",
            model: "grok-4",
            citations: [
              {
                url: "https://docs.x.ai"
              }
            ],
            usage: {
              promptTokens: 10,
              completionTokens: 30,
              totalTokens: 40
            }
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "export",
      "alpha",
      "--format",
      "markdown"
    ]);

    expect(stdout[0]).toContain("# Session: alpha");
    expect(stdout[0]).toContain("Total tokens: 40");
    expect(stdout[0]).toContain("## Turn 1");
    expect(stdout[0]).toContain("https://docs.x.ai");
  });

  it("exports a saved session as json", async () => {
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
            createdAt: "2026-03-16T02:00:00.000Z",
            model: "grok-4",
            citations: [],
            usage: {
              totalTokens: 40
            }
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "sessions",
      "export",
      "alpha",
      "--format",
      "json"
    ]);

    expect(JSON.parse(stdout[0] ?? "{}")).toEqual(
      expect.objectContaining({
        name: "alpha",
        history: expect.arrayContaining([
          expect.objectContaining({
            model: "grok-4",
            usage: expect.objectContaining({
              totalTokens: 40
            })
          })
        ])
      })
    );
  });

  it("writes an exported session to a file", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-export-"));
    tempDirectories.push(directory);
    const outputPath = join(directory, "alpha.md");
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
            createdAt: "2026-03-16T02:00:00.000Z",
            citations: []
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
      "export",
      "alpha",
      "--format",
      "markdown",
      "--output",
      outputPath
    ]);

    expect(readFileSync(outputPath, "utf8")).toContain("# Session: alpha");
    expect(stdout[0]).toContain(outputPath);
  });

  it("reports when exporting a missing session", async () => {
    const stdout: string[] = [];
    const sessionStore = {
      get: vi.fn().mockResolvedValue(undefined),
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
      "export",
      "missing",
      "--format",
      "markdown"
    ]);

    expect(stdout[0]).toContain("Session missing not found.");
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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

  it("loads a chat prompt from a file", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-cli-prompt-file-"));
    tempDirectories.push(directory);
    const promptFile = join(directory, "prompt.txt");
    writeFileSync(promptFile, "Prompt from file", "utf8");

    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "chat output",
        citations: []
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "chat",
      "--prompt-file",
      promptFile
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Prompt from file"
      })
    );
  });

  it("combines a direct prompt with piped stdin and stores the resolved prompt", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "combined output",
        citations: [],
        responseId: "resp_pipe"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "pipe-session",
        responseId: "resp_prev",
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
      stdinIsTTY: () => false,
      readStdin: vi.fn().mockResolvedValue("line 1\nline 2"),
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
      "Analyze these logs:",
      "--session",
      "pipe-session"
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Analyze these logs:\n\nline 1\nline 2"
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "pipe-session",
      expect.objectContaining({
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Analyze these logs:\n\nline 1\nline 2"
          })
        ])
      })
    );
  });

  it("supports stdin-only prompts for x-search", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn().mockResolvedValue({
        text: "x output",
        citations: []
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
      stdinIsTTY: () => false,
      readStdin: vi.fn().mockResolvedValue("piped X prompt"),
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    });

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search"
    ]);

    expect(service.xSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "piped X prompt"
      })
    );
  });

  it("loads a system prompt from a file", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-cli-system-file-"));
    tempDirectories.push(directory);
    const systemFile = join(directory, "system.txt");
    writeFileSync(systemFile, "You are precise.", "utf8");

    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "chat output",
        citations: []
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
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
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
      "Explain this",
      "--system-file",
      systemFile
    ]);

    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        system: "You are precise."
      })
    );
  });

  it("reports healthy API connectivity in doctor output", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "test-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
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
        },
        sessionStore: {
          get: vi.fn(),
          list: vi.fn(),
          set: vi.fn(),
          delete: vi.fn()
        },
        stdinIsTTY: () => true,
        readStdin: vi.fn(),
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      });

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("XAI API connectivity");
    expect(stdout[0]).toContain("PASS");
  });

  it("reports failed API connectivity in doctor output", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "test-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models: vi.fn().mockRejectedValue(new Error("401 Unauthorized"))
        },
        sessionStore: {
          get: vi.fn(),
          list: vi.fn(),
          set: vi.fn(),
          delete: vi.fn()
        },
        stdinIsTTY: () => true,
        readStdin: vi.fn(),
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      });

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("XAI API connectivity");
    expect(stdout[0]).toContain("401 Unauthorized");
    expect(stdout[0]).toContain("FAIL");
  });

  it("skips API connectivity when the API key is missing", async () => {
    const stdout: string[] = [];
    const models = vi.fn();
    vi.stubEnv("XAI_API_KEY", "");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models
        },
        sessionStore: {
          get: vi.fn(),
          list: vi.fn(),
          set: vi.fn(),
          delete: vi.fn()
        },
        stdinIsTTY: () => true,
        readStdin: vi.fn(),
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      });

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(models).not.toHaveBeenCalled();
    expect(stdout[0]).toContain("XAI API connectivity");
    expect(stdout[0]).toContain("WARN");
  });
});
