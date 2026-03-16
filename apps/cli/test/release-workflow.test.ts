import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("release workflow guardrails", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const ciWorkflow = readFileSync(
    resolve(repoRoot, ".github/workflows/ci.yml"),
    "utf8"
  );

  it("runs CLI packing in CI to catch publish regressions before release", () => {
    expect(ciWorkflow).toContain("npm run pack:cli");
  });
});
