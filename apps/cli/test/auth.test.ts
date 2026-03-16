import { describe, expect, it, vi } from "vitest";

import { buildCli } from "../src/index.js";

describe("auth command", () => {
  it("prints local auth status and supported modes", async () => {
    const stdout: string[] = [];
    vi.stubEnv("XAI_API_KEY", "inference-key");
    vi.stubEnv("XAI_MANAGEMENT_API_KEY", "");

    try {
      const cli = buildCli({
        service: {
          chat: vi.fn(),
          xSearch: vi.fn(),
          webSearch: vi.fn(),
          models: vi.fn()
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
        "auth",
        "status"
      ]);
    } finally {
      vi.unstubAllEnvs();
    }

    expect(stdout[0]).toContain("XAI_API_KEY");
    expect(stdout[0]).toContain("configured");
    expect(stdout[0]).toContain("XAI_MANAGEMENT_API_KEY");
    expect(stdout[0]).toContain("not configured");
    expect(stdout[0]).toContain("Browser auth");
    expect(stdout[0]).toContain("not supported");
  });

  it("validates the management key through the auth service", async () => {
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

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
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
      "auth",
      "validate-management"
    ]);

    expect(authService.validateManagementKey).toHaveBeenCalledTimes(1);
    expect(stdout[0]).toContain("mgmt_1");
    expect(stdout[0]).toContain("team_1");
  });

  it("lists team API keys through the auth service", async () => {
    const stdout: string[] = [];
    const authService = {
      validateManagementKey: vi.fn(),
      listApiKeys: vi.fn().mockResolvedValue({
        apiKeys: [
          {
            apiKeyId: "key_1",
            name: "Codex key"
          }
        ],
        nextPageToken: "next-page"
      }),
      createApiKey: vi.fn()
    };

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
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
      "auth",
      "list-api-keys",
      "--team",
      "team_1",
      "--page-size",
      "10"
    ]);

    expect(authService.listApiKeys).toHaveBeenCalledWith({
      teamId: "team_1",
      pageSize: 10,
      paginationToken: undefined
    });
    expect(stdout[0]).toContain("Codex key");
    expect(stdout[0]).toContain("key_1");
    expect(stdout[0]).toContain("next-page");
  });

  it("creates a team API key with sensible default ACLs", async () => {
    const stdout: string[] = [];
    const authService = {
      validateManagementKey: vi.fn(),
      listApiKeys: vi.fn(),
      createApiKey: vi.fn().mockResolvedValue({
        apiKeyId: "key_created",
        apiKey: "xai-created-secret"
      })
    };

    const cli = buildCli({
      service: {
        chat: vi.fn(),
        xSearch: vi.fn(),
        webSearch: vi.fn(),
        models: vi.fn()
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
      "auth",
      "create-api-key",
      "--team",
      "team_1",
      "--name",
      "Codex key",
      "--qps",
      "5",
      "--qpm",
      "100"
    ]);

    expect(authService.createApiKey).toHaveBeenCalledWith({
      teamId: "team_1",
      name: "Codex key",
      acls: [
        "api-key:model:*",
        "api-key:endpoint:*"
      ],
      qps: 5,
      qpm: 100,
      tpm: null
    });
    expect(stdout[0]).toContain("key_created");
    expect(stdout[0]).toContain("xai-created-secret");
  });
});
