import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("package README alignment", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const packageReadme = readFileSync(
    resolve(repoRoot, "apps/cli/README.md"),
    "utf8"
  );

  it("documents the client config generator for npm users", () => {
    expect(packageReadme).toContain("grok-agent-kit clients codex --mode published");
    expect(packageReadme).toContain("grok-agent-kit clients openclaw --mode local");
    expect(packageReadme).toContain("grok-agent-kit clients claude-code --mode published");
    expect(packageReadme).toContain("grok-agent-kit doctor --bundle ./doctor-bundle.json");
  });
});
