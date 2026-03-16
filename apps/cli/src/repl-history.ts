import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import type { ReplHistoryStore } from "./types.js";

const DEFAULT_MAX_HISTORY_ENTRIES = 200;

interface ReplHistoryFileShape {
  entries?: string[];
}

export function createFileReplHistoryStore(options?: {
  baseDirectory?: string;
  fileName?: string;
  maxEntries?: number;
}): ReplHistoryStore {
  const baseDirectory =
    options?.baseDirectory ?? join(homedir(), ".grok-agent-kit");
  const filePath = join(baseDirectory, options?.fileName ?? "repl-history.json");
  const maxEntries = options?.maxEntries ?? DEFAULT_MAX_HISTORY_ENTRIES;

  return {
    async load() {
      const data = await readHistory(filePath);
      return (data.entries ?? []).filter((entry) => entry.length > 0);
    },

    async append(entry) {
      const normalizedEntry = entry.trim();
      if (!normalizedEntry) {
        return;
      }

      const data = await readHistory(filePath);
      const entries = [...(data.entries ?? []), normalizedEntry].slice(-maxEntries);
      await writeHistory(filePath, { entries });
    }
  };
}

async function readHistory(filePath: string): Promise<ReplHistoryFileShape> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as ReplHistoryFileShape;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return {};
    }

    throw error;
  }
}

async function writeHistory(
  filePath: string,
  data: ReplHistoryFileShape
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
