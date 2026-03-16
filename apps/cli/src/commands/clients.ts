import { Command, InvalidArgumentError } from "commander";

import {
  renderClientConfig,
  supportedClients,
  type ClientConfigMode,
  type SupportedClient
} from "../client-config.js";
import type { CliDependencies } from "../types.js";

const supportedModes = ["local", "published"] as const;

export function createClientsCommand(dependencies: CliDependencies): Command {
  return new Command("clients")
    .description(
      "Print ready-to-paste Codex, Claude Code, OpenClaw, or Gemini CLI setup snippets"
    )
    .argument("<client>", "codex | claude-code | openclaw | gemini-cli", parseClient)
    .option(
      "--mode <mode>",
      "Snippet target: local or published package",
      parseMode,
      "published"
    )
    .option(
      "--project-path <path>",
      "Repository path for local mode (defaults to the current working directory)"
    )
    .action((client: SupportedClient, options: { mode: ClientConfigMode; projectPath?: string }) => {
      dependencies.writeStdout(
        renderClientConfig({
          client,
          mode: options.mode,
          projectPath: options.projectPath
        })
      );
    });
}

function parseClient(value: string): SupportedClient {
  if (supportedClients.includes(value as SupportedClient)) {
    return value as SupportedClient;
  }

  throw new InvalidArgumentError(
    `Unsupported client "${value}". Expected one of: ${supportedClients.join(", ")}.`
  );
}

function parseMode(value: string): ClientConfigMode {
  if (supportedModes.includes(value as ClientConfigMode)) {
    return value as ClientConfigMode;
  }

  throw new InvalidArgumentError(
    `Unsupported mode "${value}". Expected one of: ${supportedModes.join(", ")}.`
  );
}
