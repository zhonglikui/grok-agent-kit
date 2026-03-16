import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { Command } from "commander";

import type { SessionHistoryEntry, SessionRecord } from "../session-store.js";
import type { CliDependencies } from "../types.js";

export function createSessionsCommand(dependencies: CliDependencies): Command {
  const command = new Command("sessions").description(
    "Manage local grok-agent-kit chat sessions"
  );

  command
    .command("list")
    .description("List saved local chat sessions")
    .option("--search <pattern>", "Filter by session name or transcript content using a regex")
    .option("--model <model>", "Filter by recorded model name")
    .option("--limit <number>", "Limit the number of listed sessions")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const sessions = filterSessions(
        await dependencies.sessionStore.list(),
        options
      );

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

      dependencies.writeStdout(renderSessionTranscript(session));
    });

  command
    .command("export")
    .description("Export a saved local chat session")
    .argument("<name>", "Session name")
    .requiredOption("--format <format>", "Export format: markdown or json")
    .option("--output <path>", "Write export output to a file instead of stdout")
    .action(async (name: string, options) => {
      const session = await dependencies.sessionStore.get(name);

      if (!session) {
        dependencies.writeStdout(`Session ${name} not found.`);
        return;
      }

      const format = normalizeExportFormat(options.format);
      const output =
        format === "json"
          ? JSON.stringify(session, null, 2)
          : renderSessionMarkdown(session);

      if (options.output) {
        const outputPath = resolve(options.output);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, output, "utf8");
        dependencies.writeStdout(`Exported session ${name} to ${outputPath}`);
        return;
      }

      dependencies.writeStdout(output);
    });

  return command;
}

type SessionExportFormat = "json" | "markdown";

function normalizeExportFormat(value: string): SessionExportFormat {
  if (value === "json" || value === "markdown") {
    return value;
  }

  throw new Error(`Unsupported export format: ${value}`);
}

function renderSessionTranscript(session: SessionRecord): string {
  const header = renderSessionHeader(session);

  if (session.history.length === 0) {
    return `${header}\n\nNo local history recorded yet.`;
  }

  const transcript = session.history.map(renderHistoryEntry).join("\n\n");
  return `${header}\n\n${transcript}`;
}

function filterSessions(
  sessions: SessionRecord[],
  options: {
    search?: string;
    model?: string;
    limit?: string;
  }
) {
  let filteredSessions = sessions;

  if (options.search) {
    const expression = createSearchExpression(options.search);
    filteredSessions = filteredSessions.filter((session) =>
      expression.test(buildSessionSearchText(session))
    );
  }

  if (options.model) {
    filteredSessions = filteredSessions.filter((session) =>
      session.history.some((entry) => entry.model === options.model)
    );
  }

  if (options.limit !== undefined) {
    const limit = Number(options.limit);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("--limit must be a positive integer");
    }

    filteredSessions = filteredSessions.slice(0, limit);
  }

  return filteredSessions;
}

function createSearchExpression(pattern: string) {
  try {
    return new RegExp(pattern, "i");
  } catch {
    throw new Error(`Invalid --search regex: ${pattern}`);
  }
}

function buildSessionSearchText(session: SessionRecord): string {
  return [
    session.name,
    ...session.history.flatMap((entry) => [
      entry.prompt,
      entry.responseText,
      ...(entry.images ?? []).flatMap((image) => [image.fileName, image.path])
    ])
  ].join("\n");
}

function renderSessionMarkdown(session: SessionRecord): string {
  const summary = summarizeSession(session);
  const lines = [
    `# Session: ${session.name}`,
    "",
    `- Updated: ${session.updatedAt}`,
    `- Last response: ${session.responseId}`,
    `- Entries: ${summary.entryCount}`,
    ...(summary.models.length > 0
      ? [
          `- Models: ${summary.models.join(", ")}`
        ]
      : []),
    ...(summary.totalTokens !== undefined
      ? [
          `- Total tokens: ${summary.totalTokens}`
        ]
      : [])
  ];

  for (const [index, entry] of session.history.entries()) {
    lines.push("");
    lines.push(`## Turn ${index + 1}`);
    lines.push("");
    lines.push(`- Timestamp: ${entry.createdAt}`);

    if (entry.model) {
      lines.push(`- Model: ${entry.model}`);
    }

    if (entry.responseId) {
      lines.push(`- Response ID: ${entry.responseId}`);
    }

    if (entry.usage) {
      lines.push(...renderMarkdownUsage(entry.usage));
    }

    lines.push("");
    lines.push("### Prompt");
    lines.push("");
    lines.push(entry.prompt);
    lines.push("");
    lines.push("### Response");
    lines.push("");
    lines.push(entry.responseText);

    if ((entry.images?.length ?? 0) > 0) {
      lines.push("");
      lines.push("### Images");
      lines.push("");

      for (const image of entry.images ?? []) {
        lines.push(`- ${image.fileName} (${image.mediaType})`);
      }
    }

    if (entry.citations.length > 0) {
      lines.push("");
      lines.push("### Citations");
      lines.push("");

      for (const citation of entry.citations) {
        lines.push(`- ${citation.url ?? JSON.stringify(citation)}`);
      }
    }
  }

  return lines.join("\n");
}

function renderSessionHeader(session: SessionRecord): string {
  const summary = summarizeSession(session);
  const lines = [
    session.name,
    `Last response: ${session.responseId}`,
    `Updated: ${session.updatedAt}`,
    `Entries: ${summary.entryCount}`
  ];

  if (summary.models.length > 0) {
    lines.push(`Models: ${summary.models.join(", ")}`);
  }

  if (summary.totalTokens !== undefined) {
    lines.push(`Total tokens: ${summary.totalTokens}`);
  }

  return lines.join("\n");
}

function renderHistoryEntry(entry: SessionHistoryEntry): string {
  const lines = [
    `[${entry.createdAt}]${entry.model ? ` (${entry.model})` : ""}`,
    `User: ${entry.prompt}`,
    `Assistant: ${entry.responseText}`
  ];

  if (entry.responseId) {
    lines.push(`Response ID: ${entry.responseId}`);
  }

  if ((entry.images?.length ?? 0) > 0) {
    lines.push(`Images: ${entry.images?.map((image) => image.fileName).join(", ")}`);
  }

  const usageSummary = renderUsageSummary(entry);
  if (usageSummary) {
    lines.push(`Usage: ${usageSummary}`);
  }

  if (entry.citations.length > 0) {
    lines.push("Sources:");

    for (const citation of entry.citations) {
      lines.push(`- ${citation.url ?? JSON.stringify(citation)}`);
    }
  }

  return lines.join("\n");
}

function summarizeSession(session: SessionRecord) {
  const models = Array.from(
    new Set(
      session.history
        .map((entry) => entry.model)
        .filter((value): value is string => Boolean(value))
    )
  );
  const totalTokens = session.history.reduce((sum, entry) => {
    return sum + (entry.usage?.totalTokens ?? 0);
  }, 0);

  return {
    entryCount: session.history.length,
    models,
    totalTokens: totalTokens > 0 ? totalTokens : undefined
  };
}

function renderUsageSummary(entry: SessionHistoryEntry): string | undefined {
  if (!entry.usage) {
    return undefined;
  }

  const parts = [
    entry.usage.promptTokens !== undefined
      ? `prompt ${entry.usage.promptTokens}`
      : undefined,
    entry.usage.completionTokens !== undefined
      ? `completion ${entry.usage.completionTokens}`
      : undefined,
    entry.usage.totalTokens !== undefined
      ? `total ${entry.usage.totalTokens}`
      : undefined,
    entry.usage.reasoningTokens !== undefined
      ? `reasoning ${entry.usage.reasoningTokens}`
      : undefined,
    entry.usage.cachedTokens !== undefined
      ? `cached ${entry.usage.cachedTokens}`
      : undefined,
    entry.usage.numSourcesUsed !== undefined
      ? `sources ${entry.usage.numSourcesUsed}`
      : undefined
  ].filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(", ") : undefined;
}

function renderMarkdownUsage(
  usage: NonNullable<SessionHistoryEntry["usage"]>
): string[] {
  const lines: string[] = [];

  if (usage.promptTokens !== undefined) {
    lines.push(`- Prompt tokens: ${usage.promptTokens}`);
  }

  if (usage.completionTokens !== undefined) {
    lines.push(`- Completion tokens: ${usage.completionTokens}`);
  }

  if (usage.totalTokens !== undefined) {
    lines.push(`- Total tokens: ${usage.totalTokens}`);
  }

  if (usage.reasoningTokens !== undefined) {
    lines.push(`- Reasoning tokens: ${usage.reasoningTokens}`);
  }

  if (usage.cachedTokens !== undefined) {
    lines.push(`- Cached tokens: ${usage.cachedTokens}`);
  }

  if (usage.numSourcesUsed !== undefined) {
    lines.push(`- Sources used: ${usage.numSourcesUsed}`);
  }

  if (usage.costUsdMillionths !== undefined) {
    lines.push(`- Cost (USD millionths): ${usage.costUsdMillionths}`);
  }

  return lines;
}
