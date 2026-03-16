import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageJsonPath = fileURLToPath(
  new URL("../package.json", import.meta.url)
);

type PackageJson = {
  name?: string;
  description?: string;
  license?: string;
  bin?: Record<string, string>;
  files?: string[];
  repository?: {
    type?: string;
    url?: string;
  };
  homepage?: string;
  bugs?: {
    url?: string;
  };
  engines?: {
    node?: string;
  };
  dependencies?: Record<string, string>;
};

function readPackageJson(): PackageJson {
  return JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
}

describe("CLI package metadata", () => {
  it("declares publish-ready npm metadata", () => {
    const packageJson = readPackageJson();

    expect(packageJson.name).toBe("grok-agent-kit");
    expect(packageJson.description).toContain("CLI + MCP + skills");
    expect(packageJson.license).toBeTruthy();
    expect(packageJson.bin?.["grok-agent-kit"]).toBe("dist/bin.js");
    expect(packageJson.files).toContain("dist");
    expect(packageJson.repository?.type).toBe("git");
    expect(packageJson.repository?.url).toContain("github.com/zhonglikui/grok-agent-kit");
    expect(packageJson.homepage).toContain("github.com/zhonglikui/grok-agent-kit");
    expect(packageJson.bugs?.url).toContain("github.com/zhonglikui/grok-agent-kit/issues");
    expect(packageJson.engines?.node).toBeTruthy();
  });

  it("avoids unpublished local file dependencies", () => {
    const packageJson = readPackageJson();

    const dependencyEntries = Object.entries(packageJson.dependencies ?? {});

    expect(
      dependencyEntries.filter(([, version]) => version.startsWith("file:"))
    ).toEqual([]);
  });
});
