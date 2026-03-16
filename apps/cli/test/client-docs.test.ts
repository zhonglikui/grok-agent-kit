import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("client docs alignment", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");

  it("documents auth and interactive workflows in English client docs", () => {
    const docs = [
      readFileSync(resolve(repoRoot, "docs/clients/README.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/codex.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/claude-code.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/openclaw.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/gemini-cli.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-command-clients.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-json-clients.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-gui-clients.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/skills-skill-md-clients.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/skills-command-clients.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("XAI_API_KEY");
    expect(docs).toContain("XAI_MANAGEMENT_API_KEY");
    expect(docs).toContain("chat --interactive");
    expect(docs).toContain("x-search --interactive");
    expect(docs).toContain("web-search --interactive");
    expect(docs).toContain("grok-agent-kit clients");
    expect(docs).toContain("gemini mcp add");
    expect(docs).toContain("mcpServers");
    expect(docs).toContain("SKILL.md");
  });

  it("keeps Simplified Chinese client docs readable and aligned", () => {
    const docs = [
      readFileSync(resolve(repoRoot, "docs/clients/README.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/codex.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/claude-code.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/openclaw.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/gemini-cli.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-command-clients.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-json-clients.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/mcp-gui-clients.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/skills-skill-md-clients.zh-CN.md"), "utf8"),
      readFileSync(resolve(repoRoot, "docs/clients/skills-command-clients.zh-CN.md"), "utf8")
    ].join("\n");

    expect(docs).toContain("简体中文");
    expect(docs).toContain("XAI_API_KEY");
    expect(docs).toContain("XAI_MANAGEMENT_API_KEY");
    expect(docs).toContain("chat --interactive");
    expect(docs).toContain("x-search --interactive");
    expect(docs).toContain("web-search --interactive");
    expect(docs).toContain("grok-agent-kit clients");
    expect(docs).toContain("gemini mcp add");
    expect(docs).toContain("mcpServers");
    expect(docs).toContain("SKILL.md");
  });
});
