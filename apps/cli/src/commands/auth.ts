import { Command } from "commander";

import type { CliAuthService, CliDependencies } from "../types.js";

const DEFAULT_AUTH_ACLS = [
  "api-key:model:*",
  "api-key:endpoint:*"
];

export function createAuthCommand(dependencies: CliDependencies): Command {
  const command = new Command("auth")
    .description("Inspect and manage local xAI authentication setup");

  command
    .addCommand(
      new Command("status")
        .description("Show local auth configuration guidance")
        .option("--json", "Print JSON output")
        .action(async (options) => {
          const status = {
            inference: {
              env: "XAI_API_KEY",
              configured: isConfigured(process.env.XAI_API_KEY)
            },
            management: {
              env: "XAI_MANAGEMENT_API_KEY",
              configured: isConfigured(process.env.XAI_MANAGEMENT_API_KEY),
              baseUrl:
                process.env.XAI_MANAGEMENT_BASE_URL ?? "https://management-api.x.ai"
            },
            browserAuth: {
              supported: false,
              detail:
                "No official xAI browser OAuth flow is wired into this local CLI/MCP toolkit; use API keys instead."
            }
          };

          if (options.json) {
            dependencies.writeStdout(JSON.stringify(status, null, 2));
            return;
          }

          dependencies.writeStdout(
            [
              `XAI_API_KEY: ${status.inference.configured ? "configured" : "not configured"}`,
              `XAI_MANAGEMENT_API_KEY: ${status.management.configured ? "configured" : "not configured"} (${status.management.baseUrl})`,
              `Browser auth: ${status.browserAuth.supported ? "supported" : "not supported"} - ${status.browserAuth.detail}`
            ].join("\n")
          );
        })
    )
    .addCommand(
      new Command("validate-management")
        .description("Validate the configured xAI management key")
        .option("--json", "Print JSON output")
        .action(async (options) => {
          const result = await requireAuthService(dependencies).validateManagementKey();

          if (options.json) {
            dependencies.writeStdout(JSON.stringify(result, null, 2));
            return;
          }

          dependencies.writeStdout(
            [
              `valid: ${String(result.valid)}`,
              ...(result.keyId ? [`keyId: ${result.keyId}`] : []),
              ...(result.teamIds?.length ? [`teamIds: ${result.teamIds.join(", ")}`] : [])
            ].join("\n")
          );
        })
    )
    .addCommand(
      new Command("list-api-keys")
        .description("List API keys for a team through the management API")
        .requiredOption("--team <teamId>", "Team identifier")
        .option("--page-size <size>", "Number of keys per page", parseInteger)
        .option("--page-token <token>", "Pagination token")
        .option("--json", "Print JSON output")
        .action(async (options) => {
          const result = await requireAuthService(dependencies).listApiKeys({
            teamId: options.team,
            pageSize: options.pageSize,
            paginationToken: options.pageToken
          });

          if (options.json) {
            dependencies.writeStdout(JSON.stringify(result, null, 2));
            return;
          }

          const lines = [
            ...(result.apiKeys ?? []).map(
              (apiKey) => `${apiKey.name ?? "(unnamed)"} (${apiKey.apiKeyId ?? "unknown-id"})`
            ),
            ...(result.nextPageToken ? [`nextPageToken: ${result.nextPageToken}`] : [])
          ];

          dependencies.writeStdout(lines.join("\n"));
        })
    )
    .addCommand(
      new Command("create-api-key")
        .description("Create a team API key through the management API")
        .requiredOption("--team <teamId>", "Team identifier")
        .requiredOption("--name <name>", "Display name for the new API key")
        .option("--acl <acl>", "ACL to grant", collectAcl, [])
        .option("--qps <qps>", "Queries per second limit", parseInteger)
        .option("--qpm <qpm>", "Queries per minute limit", parseInteger)
        .option("--tpm <tpm>", "Tokens per minute limit", parseNullableInteger)
        .option("--json", "Print JSON output")
        .action(async (options) => {
          const result = await requireAuthService(dependencies).createApiKey({
            teamId: options.team,
            name: options.name,
            acls: options.acl.length > 0 ? options.acl : DEFAULT_AUTH_ACLS,
            qps: options.qps,
            qpm: options.qpm,
            tpm: options.tpm ?? null
          });

          if (options.json) {
            dependencies.writeStdout(JSON.stringify(result, null, 2));
            return;
          }

          dependencies.writeStdout(
            [
              `apiKeyId: ${result.apiKeyId}`,
              ...(result.apiKey ? [`apiKey: ${result.apiKey}`] : [])
            ].join("\n")
          );
        })
    );

  return command;
}

function requireAuthService(dependencies: CliDependencies): CliAuthService {
  if (!dependencies.authService) {
    throw new Error("Auth service is not configured");
  }

  return dependencies.authService;
}

function isConfigured(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function parseInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer but received: ${value}`);
  }

  return parsed;
}

function parseNullableInteger(value: string): number | null {
  if (value === "null") {
    return null;
  }

  return parseInteger(value);
}

function collectAcl(value: string, previous: string[]): string[] {
  return [
    ...previous,
    value
  ];
}
