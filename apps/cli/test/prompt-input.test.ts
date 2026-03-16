import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { resolveOptionalTextInput, resolvePromptInput } from "../src/prompt-input.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createTempFile(name: string, content: string) {
  const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-prompt-input-"));
  tempDirectories.push(directory);
  const filePath = join(directory, name);
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

describe("prompt-input", () => {
  it("reads a prompt from a file", async () => {
    const promptFile = createTempFile("prompt.txt", "File prompt");

    await expect(
      resolvePromptInput({
        promptFile,
        stdinText: undefined
      })
    ).resolves.toBe("File prompt");
  });

  it("uses stdin only when no prompt flag or prompt file is provided", async () => {
    await expect(
      resolvePromptInput({
        stdinText: "Piped prompt"
      })
    ).resolves.toBe("Piped prompt");
  });

  it("appends stdin to a direct prompt with a blank line separator", async () => {
    await expect(
      resolvePromptInput({
        prompt: "Analyze these logs:",
        stdinText: "line 1\nline 2"
      })
    ).resolves.toBe("Analyze these logs:\n\nline 1\nline 2");
  });

  it("rejects prompt and prompt-file together", async () => {
    const promptFile = createTempFile("prompt.txt", "File prompt");

    await expect(
      resolvePromptInput({
        prompt: "Inline prompt",
        promptFile,
        stdinText: undefined
      })
    ).rejects.toThrow("--prompt and --prompt-file cannot be used together");
  });

  it("reads an optional system prompt from a file", async () => {
    const systemFile = createTempFile("system.txt", "You are precise.");

    await expect(
      resolveOptionalTextInput({
        value: undefined,
        filePath: systemFile,
        valueFlag: "--system",
        fileFlag: "--system-file",
        label: "system prompt"
      })
    ).resolves.toBe("You are precise.");
  });
});
