import { resolve } from "node:path";

export const supportedClients = [
  "codex",
  "claude-code",
  "openclaw"
] as const;

export type SupportedClient = (typeof supportedClients)[number];
export type ClientConfigMode = "local" | "published";

type RenderClientConfigInput = {
  client: SupportedClient;
  mode: ClientConfigMode;
  projectPath?: string;
};

const packageCommand = ["npx", "-y", "grok-agent-kit", "mcp"] as const;

export function renderClientConfig(input: RenderClientConfigInput): string {
  switch (input.client) {
    case "codex":
      return renderCodexConfig(input);
    case "claude-code":
      return renderClaudeCodeConfig(input);
    case "openclaw":
      return renderOpenClawConfig(input);
  }
}

function renderCodexConfig(input: RenderClientConfigInput): string {
  const transport =
    input.mode === "published"
      ? {
          command: "npx",
          args: ["-y", "grok-agent-kit", "mcp"]
        }
      : {
          command: "node",
          args: [resolveLocalCliPath(input.projectPath), "mcp"]
        };

  return [
    "[mcp_servers.grok-agent-kit]",
    `command = "${transport.command}"`,
    `args = [${transport.args.map((value) => `"${value}"`).join(", ")}]`,
    'env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }'
  ].join("\n");
}

function renderClaudeCodeConfig(input: RenderClientConfigInput): string {
  const args =
    input.mode === "published"
      ? [...packageCommand]
      : ["node", resolveLocalCliPath(input.projectPath), "mcp"];

  return [
    "claude mcp add grok-agent-kit --scope user",
    ...args.map(formatShellArgument)
  ].join(" ");
}

function renderOpenClawConfig(input: RenderClientConfigInput): string {
  const config =
    input.mode === "published"
      ? {
          mcpServers: {
            "grok-agent-kit": {
              command: "npx",
              args: ["-y", "grok-agent-kit", "mcp"],
              env: {
                XAI_API_KEY: "YOUR_XAI_API_KEY"
              }
            }
          }
        }
      : {
          mcpServers: {
            "grok-agent-kit": {
              command: "node",
              args: [resolveLocalCliPath(input.projectPath), "mcp"],
              env: {
                XAI_API_KEY: "YOUR_XAI_API_KEY"
              }
            }
          }
        };

  return JSON.stringify(config, null, 2);
}

function resolveLocalCliPath(projectPath?: string): string {
  const resolvedProjectPath = normalizePath(resolve(projectPath ?? process.cwd()));
  return `${resolvedProjectPath}/apps/cli/dist/bin.js`;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function formatShellArgument(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value;
}
