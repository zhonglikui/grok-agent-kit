import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

describe("CLI", () => {
  it("dispatches the chat command to the service", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "chat output",
        citations: []
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const stdout: string[] = [];

    const cli = buildCli({
      service,
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
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
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
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

  it("starts the MCP server for the mcp command", async () => {
    const startMcpServer = vi.fn().mockResolvedValue(undefined);

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
      },
      startMcpServer,
      writeStdout: vi.fn(),
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
      startMcpServer,
      writeStdout: vi.fn(),
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
});
