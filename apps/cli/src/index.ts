import { createDefaultGrokService } from "@grok-agent-kit/core";
import { startStdioMcpServer } from "@grok-agent-kit/mcp-server";
import { Command } from "commander";

import { createChatCommand } from "./commands/chat.js";
import { createMcpCommand } from "./commands/mcp.js";
import { createModelsCommand } from "./commands/models.js";
import { createWebSearchCommand } from "./commands/web-search.js";
import { createXSearchCommand } from "./commands/x-search.js";
import type { CliDependencies } from "./types.js";

export function buildCli(dependencies: CliDependencies): Command {
  const program = new Command();

  program
    .name("grok-agent-kit")
    .description("CLI + MCP + skills for xAI Grok")
    .addCommand(createChatCommand(dependencies))
    .addCommand(createXSearchCommand(dependencies))
    .addCommand(createWebSearchCommand(dependencies))
    .addCommand(createModelsCommand(dependencies))
    .addCommand(createMcpCommand(dependencies));

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  let service = undefined as ReturnType<typeof createDefaultGrokService> | undefined;
  const getService = () => {
    service ??= createDefaultGrokService();
    return service;
  };

  const program = buildCli({
    service: {
      chat: async (input) => getService().chat(input),
      xSearch: async (input) => getService().xSearch(input),
      webSearch: async (input) => getService().webSearch(input),
      models: async (includeRaw) => getService().models(includeRaw)
    },
    startMcpServer: async () => {
      await startStdioMcpServer({ service: getService() });
    },
    writeStdout: (value) => {
      process.stdout.write(`${value}\n`);
    },
    writeStderr: (value) => {
      process.stderr.write(`${value}\n`);
    }
  });

  await program.parseAsync(argv);
}
