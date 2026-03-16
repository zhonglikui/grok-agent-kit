import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { renderClientConfig } from "../src/client-config.js";

const repoRoot = resolve(import.meta.dirname, "../../..");
const placeholderPath = "/absolute/path/to/grok-agent-kit";

describe("client examples alignment", () => {
  it("keeps the Codex example aligned with the local generator output", () => {
    const example = readFileSync(
      resolve(repoRoot, "examples/clients/codex-config.toml"),
      "utf8"
    );

    expect(example.trim()).toBe(
      renderClientConfig({
        client: "codex",
        mode: "local",
        projectPath: placeholderPath
      })
    );
  });

  it("keeps JSON client examples aligned with the local MCP transport shape", () => {
    const claudeCodeExample = JSON.parse(
      readFileSync(
        resolve(repoRoot, "examples/clients/claude-code-config.json"),
        "utf8"
      )
    );
    const openClawExample = JSON.parse(
      readFileSync(
        resolve(repoRoot, "examples/clients/openclaw-config.json"),
        "utf8"
      )
    );
    const expected = JSON.parse(
      renderClientConfig({
        client: "openclaw",
        mode: "local",
        projectPath: placeholderPath
      })
    );

    expect(claudeCodeExample).toEqual(expected);
    expect(openClawExample).toEqual(expected);
  });
});
