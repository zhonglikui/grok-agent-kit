import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

class MockInteractiveConsole {
  public readonly prompts: string[] = [];
  public readonly historySets: string[][] = [];
  public closed = false;

  public constructor(private readonly inputs: Array<string | undefined>) {}

  public async prompt(message: string): Promise<string | undefined> {
    this.prompts.push(message);
    return this.inputs.shift();
  }

  public setHistory(entries: string[]): void {
    this.historySets.push([...entries]);
  }

  public async close(): Promise<void> {
    this.closed = true;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("interactive search", () => {
  it("prints startup guidance and supports /help in interactive search", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const interactiveConsole = new MockInteractiveConsole([
      "/help",
      "/exit"
    ]);

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      replHistoryStore: {
        load: vi.fn().mockResolvedValue([]),
        append: vi.fn().mockResolvedValue(undefined)
      },
      createInteractiveConsole: vi.fn().mockResolvedValue(interactiveConsole),
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: vi.fn(),
      writeStderr: (value) => stderr.push(value)
    } as any);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search",
      "--interactive"
    ]);

    expect(stdout).toContain(
      "Interactive x-search ready. Commands: /help, /reset, /exit."
    );
    expect(stdout).toContain(
      "Commands: /help shows this message; /reset clears the current conversation; /exit leaves interactive mode."
    );
    expect(stderr).toEqual([]);
    expect(service.xSearch).not.toHaveBeenCalled();
    expect(interactiveConsole.closed).toBe(true);
  });

  it("runs multi-turn interactive x-search with streaming continuity", async () => {
    const stdout: string[] = [];
    const service = {
      chat: vi.fn(),
      xSearch: vi
        .fn()
        .mockImplementationOnce(async (input) => {
          await input.onTextDelta?.("First");
          await input.onTextDelta?.(" result");

          return {
            text: "First result",
            citations: [],
            responseId: "resp_x_first"
          };
        })
        .mockImplementationOnce(async (input) => {
          await input.onTextDelta?.("Second");
          await input.onTextDelta?.(" result");

          return {
            text: "Second result",
            citations: [],
            responseId: "resp_x_second"
          };
        }),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const interactiveConsole = new MockInteractiveConsole([
      "Latest xAI posts",
      "Only show today's posts",
      "/exit"
    ]);
    const replHistoryStore = {
      load: vi.fn().mockResolvedValue(["older search"]),
      append: vi.fn().mockResolvedValue(undefined)
    };

    const cli = buildCli({
      service,
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      replHistoryStore,
      createInteractiveConsole: vi.fn().mockResolvedValue(interactiveConsole),
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: (value) => stdout.push(value),
      writeStderr: vi.fn()
    } as any);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "x-search",
      "--interactive",
      "--allow-handle",
      "xai"
    ]);

    expect(interactiveConsole.historySets).toEqual([["older search"]]);
    expect(service.xSearch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        prompt: "Latest xAI posts",
        allowedXHandles: ["xai"],
        store: true,
        onTextDelta: expect.any(Function)
      })
    );
    expect(service.xSearch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        prompt: "Only show today's posts",
        previousResponseId: "resp_x_first",
        allowedXHandles: ["xai"],
        store: true,
        onTextDelta: expect.any(Function)
      })
    );
    expect(replHistoryStore.append).toHaveBeenNthCalledWith(1, "Latest xAI posts");
    expect(replHistoryStore.append).toHaveBeenNthCalledWith(2, "Only show today's posts");
    expect(stdout).toContain("First");
    expect(stdout).toContain(" result");
    expect(stdout).toContain("Second");
    expect(stdout).toContain(" result");
    expect(interactiveConsole.closed).toBe(true);
  });

  it("loads, resets, and persists a named interactive web-search session", async () => {
    const service = {
      chat: vi.fn(),
      xSearch: vi.fn(),
      webSearch: vi
        .fn()
        .mockResolvedValueOnce({
          text: "Docs answer",
          citations: [],
          responseId: "resp_web_next"
        })
        .mockResolvedValueOnce({
          text: "Fresh docs answer",
          citations: [],
          responseId: "resp_web_fresh"
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
      delete: vi.fn().mockResolvedValue(undefined)
    };
    const interactiveConsole = new MockInteractiveConsole([
      "Find the latest xAI docs",
      "/reset",
      "Start over from scratch",
      "/exit"
    ]);

    const cli = buildCli({
      service,
      sessionStore,
      replHistoryStore: {
        load: vi.fn().mockResolvedValue([]),
        append: vi.fn().mockResolvedValue(undefined)
      },
      createInteractiveConsole: vi.fn().mockResolvedValue(interactiveConsole),
      stdinIsTTY: () => true,
      readStdin: vi.fn(),
      startMcpServer: vi.fn(),
      writeStdout: vi.fn(),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    } as any);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "web-search",
      "--interactive",
      "--session",
      "docs",
      "--allow-domain",
      "docs.x.ai"
    ]);

    expect(sessionStore.get).toHaveBeenCalledWith("docs");
    expect(service.webSearch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        prompt: "Find the latest xAI docs",
        previousResponseId: "resp_web_prev",
        allowedWebDomains: ["docs.x.ai"],
        store: true
      })
    );
    expect(sessionStore.delete).toHaveBeenCalledWith("docs");
    expect(service.webSearch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        prompt: "Start over from scratch",
        previousResponseId: undefined,
        allowedWebDomains: ["docs.x.ai"],
        store: true
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "docs",
      expect.objectContaining({
        responseId: "resp_web_fresh",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Start over from scratch",
            responseText: "Fresh docs answer",
            responseId: "resp_web_fresh"
          })
        ])
      })
    );
    expect(interactiveConsole.closed).toBe(true);
  });
});
