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

  command
    .command("show")
    .description("Show the local transcript for a saved chat session")
    .argument("<name>", "Session name")
    .action(async (name: string) => {
      const session = await dependencies.sessionStore.get(name);

      if (!session) {
        dependencies.writeStdout(`Session ${name} not found.`);
        return;
      }

      if (session.history.length === 0) {
        dependencies.writeStdout(
          `${session.name}\nLast response: ${session.responseId}\nUpdated: ${session.updatedAt}\n\nNo local history recorded yet.`
        );
        return;
      }

      const transcript = session.history
        .map(
          (entry) =>
            `[${entry.createdAt}]\nUser: ${entry.prompt}\nAssistant: ${entry.responseText}${
              entry.responseId ? `\nResponse ID: ${entry.responseId}` : ""
            }`
        )
        .join("\n\n");

      dependencies.writeStdout(
        `${session.name}\nLast response: ${session.responseId}\nUpdated: ${session.updatedAt}\n\n${transcript}`
      );
    });

  return command;
}
