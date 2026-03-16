import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

describe("doctor auth checks", () => {
  it("warns when the management key is not configured", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "inference-key");
    vi.stubEnv("XAI_MANAGEMENT_API_KEY", "");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models: vi.fn().mockResolvedValue({ models: [] })
        },
        authService: {
          validateManagementKey: vi.fn(),
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
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      } as any);

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("XAI_MANAGEMENT_API_KEY");
    expect(stdout[0]).toContain("WARN");
    expect(stdout[0]).toContain("xAI management API connectivity");
  });

  it("reports healthy management API connectivity when validation succeeds", async () => {
    const stdout: string[] = [];
    const authService = {
      validateManagementKey: vi.fn().mockResolvedValue({
        valid: true,
        keyId: "mgmt_1",
        teamIds: [
          "team_1"
        ]
      }),
      listApiKeys: vi.fn(),
      createApiKey: vi.fn()
    };
    vi.stubEnv("XAI_API_KEY", "inference-key");
    vi.stubEnv("XAI_MANAGEMENT_API_KEY", "management-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models: vi.fn().mockResolvedValue({ models: [] })
        },
        authService,
        sessionStore: {
          get: vi.fn(),
          list: vi.fn(),
          set: vi.fn(),
          delete: vi.fn()
        },
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      } as any);

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(authService.validateManagementKey).toHaveBeenCalledTimes(1);
    expect(stdout[0]).toContain("PASS");
    expect(stdout[0]).toContain("xAI management API connectivity");
    expect(stdout[0]).toContain("team_1");
  });

  it("reports failed management API connectivity when validation fails", async () => {
    const stdout: string[] = [];
    const authService = {
      validateManagementKey: vi.fn().mockRejectedValue(new Error("401 Unauthorized")),
      listApiKeys: vi.fn(),
      createApiKey: vi.fn()
    };
    vi.stubEnv("XAI_API_KEY", "inference-key");
    vi.stubEnv("XAI_MANAGEMENT_API_KEY", "management-key");
    vi.stubEnv("XAI_BASE_URL", "https://api.x.ai/v1");
    vi.stubEnv("GROK_AGENT_KIT_MODEL", "grok-4");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models: vi.fn().mockResolvedValue({ models: [] })
        },
        authService,
        sessionStore: {
          get: vi.fn(),
          list: vi.fn(),
          set: vi.fn(),
          delete: vi.fn()
        },
        startMcpServer: vi.fn(),
        writeStdout: (value) => stdout.push(value),
        writeStdoutRaw: (value) => stdout.push(value),
        writeStderr: vi.fn()
      } as any);

      await cli.parseAsync([
        "node",
        "grok-agent-kit",
        "doctor"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("FAIL");
    expect(stdout[0]).toContain("xAI management API connectivity");
    expect(stdout[0]).toContain("401 Unauthorized");
  });
});
