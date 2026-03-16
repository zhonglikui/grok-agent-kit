import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
  vi.unstubAllEnvs();
});

describe("doctor bundle", () => {
  it("writes a redacted diagnostic bundle to disk", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-doctor-bundle-"));
    tempDirectories.push(directory);
    const bundlePath = join(directory, "doctor-bundle.json");
    const stdout: string[] = [];

    vi.stubEnv("XAI_API_KEY", "super-secret-runtime-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("XAI_MANAGEMENT_API_KEY", "super-secret-management-key");
    vi.stubEnv("XAI_MANAGEMENT_BASE_URL", "https://management-api.x.ai");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn().mockResolvedValue({ models: [] })
      },
      authService: {
        validateManagementKey: vi.fn().mockResolvedValue({
          valid: true,
          keyId: "mgmt_123",
          teamIds: ["team_123"]
        }),
        listApiKeys: vi.fn(),
        createApiKey: vi.fn()
      },
      sessionStore: {
        get: vi.fn(),
        list: vi.fn(),
        set: vi.fn(),
        delete: vi.fn()
      },
      startMcpServer: vi.fn(),
      writeStdout: (value) => stdout.push(value),
      writeStdoutRaw: vi.fn(),
      writeStderr: vi.fn()
    } as any);

    await cli.parseAsync([
      "node",
      "grok-agent-kit",
      "doctor",
      "--bundle",
      bundlePath
    ]);

    const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
      summary: {
        failures: number;
        warnings: number;
        passes: number;
      };
      checks: Array<{ label: string }>;
      environment: {
        xaiApiKeyPresent: boolean;
        xaiManagementApiKeyPresent: boolean;
        xaiBaseUrl: string;
        xaiManagementBaseUrl: string;
        defaultModel: string | null;
      };
    };
    const serialized = JSON.stringify(bundle);

    expect(stdout.join("\n")).toContain("Saved doctor bundle");
    expect(bundle.summary.passes).toBeGreaterThan(0);
    expect(bundle.checks.some((check) => check.label === "XAI_API_KEY")).toBe(true);
    expect(bundle.environment.xaiApiKeyPresent).toBe(true);
    expect(bundle.environment.xaiManagementApiKeyPresent).toBe(true);
    expect(bundle.environment.xaiBaseUrl).toBe("https://api.x.ai/v1");
    expect(bundle.environment.xaiManagementBaseUrl).toBe("https://management-api.x.ai");
    expect(bundle.environment.defaultModel).toBe("grok-4");
    expect(serialized).not.toContain("super-secret-runtime-key");
    expect(serialized).not.toContain("super-secret-management-key");
  });
});
