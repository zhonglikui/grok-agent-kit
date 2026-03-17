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

  it("pins modern GitHub Actions majors and a Node 22 release runtime", () => {
    expect(ciWorkflow).toContain("uses: actions/checkout@v6");
    expect(ciWorkflow).toContain("uses: actions/setup-node@v6");
    expect(ciWorkflow).toContain("node-version: 22");
    expect(publishWorkflow).toContain("uses: actions/checkout@v6");
    expect(publishWorkflow).toContain("uses: actions/setup-node@v6");
    expect(publishWorkflow).toContain("node-version: 22");
  });

  it("uses GitHub OIDC trusted publishing instead of an npm token", () => {
    expect(publishWorkflow).toContain("id-token: write");
    expect(publishWorkflow).toContain("working-directory: apps/cli");
    expect(publishWorkflow).toContain("npm publish --access public --provenance");
    expect(publishWorkflow).not.toContain("NODE_AUTH_TOKEN");
    expect(publishWorkflow).not.toContain("NPM_TOKEN");
    expect(publishWorkflow).not.toContain("npm publish --workspace apps/cli");
  });

  it("upgrades npm to a trusted-publishing-compatible version on Node 22", () => {
    expect(publishWorkflow).toContain("npm install -g npm@^11.5.1");
    expect(publishWorkflow).toContain("npm --version");
  });
});
