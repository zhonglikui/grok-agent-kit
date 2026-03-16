import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("release workflow guardrails", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const ciWorkflow = readFileSync(
    resolve(repoRoot, ".github/workflows/ci.yml"),
    "utf8"
  );
  const publishWorkflow = readFileSync(
    resolve(repoRoot, ".github/workflows/publish.yml"),
    "utf8"
  );

  it("runs CLI packing in CI to catch publish regressions before release", () => {
    expect(ciWorkflow).toContain("npm run pack:cli");
  });

  it("uses GitHub OIDC trusted publishing instead of an npm token", () => {
    expect(publishWorkflow).toContain("id-token: write");
    expect(publishWorkflow).not.toContain("NODE_AUTH_TOKEN");
    expect(publishWorkflow).not.toContain("NPM_TOKEN");
  });
});
