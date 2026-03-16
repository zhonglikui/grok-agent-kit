import { resolve } from "node:path";

export const supportedClients = [
  "codex",
  "claude-code",
  "openclaw",
  "gemini-cli"
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
    case "gemini-cli":
      return renderGeminiCliConfig(input);
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

function renderGeminiCliConfig(input: RenderClientConfigInput): string {
  const args =
    input.mode === "published"
      ? [...packageCommand]
      : ["node", resolveLocalCliPath(input.projectPath), "mcp"];

  return [
    "# Set XAI_API_KEY in the shell before starting Gemini CLI.",
    ["gemini mcp add grok-agent-kit", ...args.map(formatShellArgument)].join(" ")
  ].join("\n");
}

function resolveLocalCliPath(projectPath?: string): string {
  const resolvedProjectPath = resolveProjectPath(projectPath);
  return `${resolvedProjectPath}/apps/cli/dist/bin.js`;
}

function resolveProjectPath(projectPath?: string): string {
  if (!projectPath) {
    return normalizePath(resolve(process.cwd()));
  }

  const normalized = normalizePath(projectPath);

  if (normalized.startsWith("/")) {
    return normalized.replace(/\/$/, "");
  }

  return normalizePath(resolve(projectPath));
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function formatShellArgument(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value;
}
