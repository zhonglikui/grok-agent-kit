import { Command } from "commander";

import type { CliDependencies } from "../types.js";

export function createMcpCommand(dependencies: CliDependencies): Command {
  return new Command("mcp")
    .description("Start the local stdio MCP server")
    .action(async () => {
      await dependencies.startMcpServer();
    });
}
