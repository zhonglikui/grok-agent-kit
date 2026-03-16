import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("skill docs alignment", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const rootSkill = readFileSync(resolve(repoRoot, "SKILL.md"), "utf8");
  const codexGuidance = readFileSync(
    resolve(repoRoot, "skills/codex/README.md"),
    "utf8"
  );

  it("teaches Codex how to choose between Grok MCP tools", () => {
    expect(rootSkill).toContain("grok_x_search");
    expect(rootSkill).toContain("grok_web_search");
    expect(rootSkill).toContain("grok_chat");
    expect(rootSkill).toContain("allowedXHandles");
    expect(rootSkill).toContain("allowedWebDomains");
    expect(rootSkill).toContain("resetSession");
    expect(rootSkill).toContain("session");
  });

  it("keeps Codex-specific guidance aligned with the MCP surface", () => {
    expect(codexGuidance).toContain("grok_x_search");
    expect(codexGuidance).toContain("grok_web_search");
    expect(codexGuidance).toContain("grok_chat");
    expect(codexGuidance).toContain("allowedXHandles");
    expect(codexGuidance).toContain("allowedWebDomains");
    expect(codexGuidance).toContain("resetSession");
    expect(codexGuidance).toContain("session");
  });
});
