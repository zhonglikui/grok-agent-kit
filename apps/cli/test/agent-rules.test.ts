import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../..");

describe("persistent agent rules alignment", () => {
  const agents = readFileSync(resolve(repoRoot, "AGENTS.md"), "utf8");
  const gemini = readFileSync(resolve(repoRoot, "GEMINI.md"), "utf8");
  const claude = readFileSync(resolve(repoRoot, "CLAUDE.md"), "utf8");
  const projectRules = readFileSync(
    resolve(repoRoot, "docs/project-agent-rules.md"),
    "utf8"
  );

  it("states that progress reports are not stopping points in root workflow docs", () => {
    expect(agents).toContain("Do not treat a progress update or phase summary as a stopping point.");
    expect(gemini).toContain("Do not treat a progress update or phase summary as a stopping point.");
    expect(claude).toContain("Do not treat a progress update or phase summary as a stopping point.");
    expect(projectRules).toContain("Do not treat a progress update or phase summary as a stopping point.");
  });

  it("states that same-slice execution continues without re-asking for approval", () => {
    const requiredPhrase =
      "continue executing until the slice is fully delivered unless genuinely blocked";

    expect(agents).toContain(requiredPhrase);
    expect(gemini).toContain(requiredPhrase);
    expect(claude).toContain(requiredPhrase);
    expect(projectRules).toContain(requiredPhrase);
  });
});
