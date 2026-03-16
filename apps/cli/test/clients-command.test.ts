import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

function createCli(stdout: string[]) {
  return buildCli({
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
}

describe("clients command", () => {
  it("prints a published Codex MCP config snippet", async () => {
    const stdout: string[] = [];
    const cli = createCli(stdout);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "clients",
      "codex",
      "--mode",
      "published"
    ]);

    expect(stdout[0]).toContain("[mcp_servers.grok-agent-kit]");
    expect(stdout[0]).toContain('command = "npx"');
    expect(stdout[0]).toContain('args = ["-y", "grok-agent-kit", "mcp"]');
    expect(stdout[0]).toContain('XAI_API_KEY = "YOUR_XAI_API_KEY"');
  });

  it("prints a local OpenClaw MCP config snippet for a repo path", async () => {
    const stdout: string[] = [];
    const cli = createCli(stdout);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "clients",
      "openclaw",
      "--mode",
      "local",
      "--project-path",
      "D:/work/typescript/grok-agent-kit"
    ]);

    expect(stdout[0]).toContain('"command": "node"');
    expect(stdout[0]).toContain('"grok-agent-kit"');
    expect(stdout[0]).toContain('/apps/cli/dist/bin.js');
    expect(stdout[0]).toContain('"XAI_API_KEY": "YOUR_XAI_API_KEY"');
  });

  it("prints a published Gemini CLI MCP install command", async () => {
    const stdout: string[] = [];
    const cli = createCli(stdout);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "clients",
      "gemini-cli",
      "--mode",
      "published"
    ]);

    expect(stdout[0]).toContain("gemini mcp add grok-agent-kit");
    expect(stdout[0]).toContain("npx");
    expect(stdout[0]).toContain("grok-agent-kit");
    expect(stdout[0]).toContain("mcp");
  });
});
