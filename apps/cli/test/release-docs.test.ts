import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("release and community docs", () => {
  const repoRoot = resolve(import.meta.dirname, "../../..");
  const releaseChecklist = resolve(repoRoot, "docs/release/launch-checklist.md");
  const releaseChecklistZh = resolve(
    repoRoot,
    "docs/release/launch-checklist.zh-CN.md"
  );
  const communityListings = resolve(
    repoRoot,
    "docs/release/community-listings.md"
  );
  const communityListingsZh = resolve(
    repoRoot,
    "docs/release/community-listings.zh-CN.md"
  );

  it("ships bilingual launch checklist docs", () => {
    expect(existsSync(releaseChecklist)).toBe(true);
    expect(existsSync(releaseChecklistZh)).toBe(true);

    const english = readFileSync(releaseChecklist, "utf8");
    const chinese = readFileSync(releaseChecklistZh, "utf8");

    expect(english).toContain("npm publish");
    expect(english).toContain("npm run smoke:pack-install");
    expect(english).toContain("README.zh-CN.md");
    expect(chinese).toContain("npm publish");
    expect(chinese).toContain("npm run smoke:pack-install");
    expect(chinese).toContain("README.zh-CN.md");
  });

  it("ships bilingual community listing templates", () => {
    expect(existsSync(communityListings)).toBe(true);
    expect(existsSync(communityListingsZh)).toBe(true);

    const english = readFileSync(communityListings, "utf8");
    const chinese = readFileSync(communityListingsZh, "utf8");

    expect(english).toContain("MCP");
    expect(english).toContain("skills");
    expect(english).toContain("Codex");
    expect(chinese).toContain("MCP");
    expect(chinese).toContain("skills");
    expect(chinese).toContain("Codex");
  });
});
