import { Command } from "commander";

import type { CliDependencies } from "../types.js";

export function createSessionsCommand(dependencies: CliDependencies): Command {
  const command = new Command("sessions").description(
    "Manage local grok-agent-kit chat sessions"
  );

  command
    .command("list")
    .description("List saved local chat sessions")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const sessions = await dependencies.sessionStore.list();

      if (options.json) {
        dependencies.writeStdout(JSON.stringify(sessions, null, 2));
        return;
      }

      if (sessions.length === 0) {
        dependencies.writeStdout("No sessions found.");
        return;
      }

      dependencies.writeStdout(
        sessions
          .map(
            (session) =>
              `${session.name}\t${session.responseId}\t${session.updatedAt}`
          )
          .join("\n")
      );
    });

  command
    .command("delete")
    .description("Delete a saved local chat session")
    .argument("<name>", "Session name")
    .action(async (name: string) => {
      await dependencies.sessionStore.delete(name);
      dependencies.writeStdout(`Deleted session ${name}`);
    });

  return command;
}
