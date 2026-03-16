import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type RootPackageJson = {
  scripts?: Record<string, string>;
};

describe("install smoke hardening", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const rootPackageJson = JSON.parse(
    readFileSync(resolve(repoRoot, "package.json"), "utf8")
  ) as RootPackageJson;
  const rootReadme = readFileSync(resolve(repoRoot, "README.md"), "utf8");
  const zhReadme = readFileSync(resolve(repoRoot, "README.zh-CN.md"), "utf8");
  const cliReadme = readFileSync(resolve(repoRoot, "apps/cli/README.md"), "utf8");
  const ciWorkflow = readFileSync(
    resolve(repoRoot, ".github/workflows/ci.yml"),
    "utf8"
  );
  const publishWorkflow = readFileSync(
    resolve(repoRoot, ".github/workflows/publish.yml"),
    "utf8"
  );

  it("defines a tarball install smoke script in the workspace package", () => {
    expect(rootPackageJson.scripts?.["smoke:pack-install"]).toBeTruthy();
  });

  it("runs the install smoke script in CI and publish workflows", () => {
    expect(ciWorkflow).toContain("npm run smoke:pack-install");
    expect(publishWorkflow).toContain("npm run smoke:pack-install");
  });

  it("documents global npm installation in English and Simplified Chinese docs", () => {
    expect(rootReadme).toContain("npm install -g grok-agent-kit");
    expect(zhReadme).toContain("npm install -g grok-agent-kit");
    expect(cliReadme).toContain("npm install -g grok-agent-kit");
  });
});
