import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

describe("interactive chat", () => {
  it("prints startup guidance and supports /help in interactive chat", async () => {
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
      "chat",
      "--interactive"
    ]);

    expect(stdout).toContain(
      "Interactive chat ready. Commands: /help, /image <path>, /reset, /exit."
    );
    expect(stdout).toContain(
      "Commands: /help shows this message; /image <path> queues local images; /reset clears the current conversation; /exit leaves interactive mode."
    );
    expect(stderr).toEqual([]);
    expect(service.chat).not.toHaveBeenCalled();
    expect(interactiveConsole.closed).toBe(true);
  });

  it("runs multi-turn interactive chat with streaming continuity", async () => {
    const stdout: string[] = [];
    const service = {
      chat: vi
        .fn()
        .mockImplementationOnce(async (input) => {
          await input.onTextDelta?.("First");
          await input.onTextDelta?.(" answer");

          return {
            text: "First answer",
            citations: [],
            responseId: "resp_first"
          };
        })
        .mockImplementationOnce(async (input) => {
          await input.onTextDelta?.("Second");
          await input.onTextDelta?.(" answer");

          return {
            text: "Second answer",
            citations: [],
            responseId: "resp_second"
          };
        }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const interactiveConsole = new MockInteractiveConsole([
      "Hello Grok",
      "Keep going",
      "/exit"
    ]);
    const replHistoryStore = {
      load: vi.fn().mockResolvedValue(["saved prompt"]),
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
      "chat",
      "--interactive"
    ]);

    expect(interactiveConsole.historySets).toEqual([["saved prompt"]]);
    expect(service.chat).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        prompt: "Hello Grok",
        store: true,
        onTextDelta: expect.any(Function)
      })
    );
    expect(service.chat).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        prompt: "Keep going",
        previousResponseId: "resp_first",
        store: true,
        onTextDelta: expect.any(Function)
      })
    );
    expect(replHistoryStore.append).toHaveBeenNthCalledWith(1, "Hello Grok");
    expect(replHistoryStore.append).toHaveBeenNthCalledWith(2, "Keep going");
    expect(stdout).toContain("First");
    expect(stdout).toContain(" answer");
    expect(stdout).toContain("Second");
    expect(stdout).toContain(" answer");
    expect(interactiveConsole.closed).toBe(true);
  });

  it("loads and persists a named session during interactive chat", async () => {
    const service = {
      chat: vi.fn().mockResolvedValue({
        text: "Session reply",
        citations: [],
        responseId: "resp_next"
      }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue({
        name: "research",
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
      replHistoryStore: {
        load: vi.fn().mockResolvedValue([]),
        append: vi.fn().mockResolvedValue(undefined)
      },
      createInteractiveConsole: vi.fn().mockResolvedValue(
        new MockInteractiveConsole([
          "Continue the research",
          "/exit"
        ])
      ),
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
      "chat",
      "--interactive",
      "--session",
      "research"
    ]);

    expect(sessionStore.get).toHaveBeenCalledWith("research");
    expect(service.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Continue the research",
        previousResponseId: "resp_prev",
        store: true
      })
    );
    expect(sessionStore.set).toHaveBeenCalledWith(
      "research",
      expect.objectContaining({
        responseId: "resp_next",
        history: expect.arrayContaining([
          expect.objectContaining({
            prompt: "Continue the research",
            responseText: "Session reply",
            responseId: "resp_next"
          })
        ])
      })
    );
  });

  it("loads existing prompt history and appends new prompts", async () => {
    const interactiveConsole = new MockInteractiveConsole([
      "Fresh prompt",
      "/exit"
    ]);
    const replHistoryStore = {
      load: vi.fn().mockResolvedValue(["older one", "older two"]),
      append: vi.fn().mockResolvedValue(undefined)
    };

    const cli = buildCli({
      service: {
        chat: vi.fn().mockResolvedValue({
          text: "History reply",
          citations: [],
          responseId: "resp_history"
        }),
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
      replHistoryStore,
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
      "chat",
      "--interactive"
    ]);

    expect(replHistoryStore.load).toHaveBeenCalledTimes(1);
    expect(interactiveConsole.historySets).toEqual([["older one", "older two"]]);
    expect(replHistoryStore.append).toHaveBeenCalledWith("Fresh prompt");
  });

  it("supports /image, /reset, and /exit inside interactive mode", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-repl-image-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "vision.png");
    writeFileSync(imagePath, Buffer.from("png-binary"), "utf8");

    const service = {
      chat: vi
        .fn()
        .mockResolvedValueOnce({
          text: "Image reply",
          citations: [],
          responseId: "resp_image"
        })
        .mockResolvedValueOnce({
          text: "Reset reply",
          citations: [],
          responseId: "resp_reset"
        }),
      xSearch: vi.fn(),
      webSearch: vi.fn(),
      models: vi.fn()
    };
    const sessionStore = {
      get: vi.fn().mockResolvedValue(undefined),
      list: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    const cli = buildCli({
      service,
      sessionStore,
      replHistoryStore: {
        load: vi.fn().mockResolvedValue([]),
        append: vi.fn().mockResolvedValue(undefined)
      },
      createInteractiveConsole: vi.fn().mockResolvedValue(
        new MockInteractiveConsole([
          `/image ${imagePath}`,
          "Describe the image",
          "/reset",
          "Start again",
          "/exit"
        ])
      ),
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
      "chat",
      "--interactive",
      "--session",
      "vision"
    ]);

    expect(service.chat).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        prompt: "Describe the image",
        images: [
          expect.objectContaining({
            path: imagePath,
            fileName: "vision.png",
            mediaType: "image/png",
            dataUrl: expect.stringContaining("data:image/png;base64,")
          })
        ],
        store: false
      })
    );
    expect(sessionStore.delete).toHaveBeenCalledWith("vision");
    expect(service.chat).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        prompt: "Start again",
        previousResponseId: undefined,
        store: true
      })
    );
  });
});
