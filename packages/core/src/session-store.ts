import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import type {
  GrokTextResult,
  GrokTextUsage,
  SessionImageReference
} from "./types.js";

export interface SessionRecord {
  name: string;
  responseId: string;
  updatedAt: string;
  history: SessionHistoryEntry[];
}

export interface SessionCitation {
  url?: string;
  [key: string]: unknown;
}

export interface SessionHistoryEntry {
  prompt: string;
  responseText: string;
  responseId?: string;
  createdAt: string;
  model?: string;
  citations: SessionCitation[];
  usage?: GrokTextUsage;
  images?: SessionImageReference[];
}

export interface SessionStore {
  get(name: string): Promise<SessionRecord | undefined>;
  list(): Promise<SessionRecord[]>;
  set(
    name: string,
    value: Omit<SessionRecord, "name">
  ): Promise<void>;
  delete(name: string): Promise<void>;
}

interface SessionStoreFileShape {
  sessions?: Record<
    string,
    Omit<SessionRecord, "name"> & {
      history?: SessionHistoryEntry[];
    }
  >;
}

export function createFileSessionStore(options?: {
  baseDirectory?: string;
  fileName?: string;
}): SessionStore {
  const baseDirectory =
    options?.baseDirectory ?? join(homedir(), ".grok-agent-kit");
  const filePath = join(baseDirectory, options?.fileName ?? "sessions.json");

  return {
    async get(name) {
      const data = await readStore(filePath);
      const record = data.sessions?.[name];
      return record ? toSessionRecord(name, record) : undefined;
    },

    async list() {
      const data = await readStore(filePath);
      return Object.entries(data.sessions ?? {})
        .map(([name, record]) => toSessionRecord(name, record))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },

    async set(name, value) {
      const data = await readStore(filePath);
      data.sessions ??= {};
      data.sessions[name] = {
        ...value,
        history: value.history ?? []
      };
      await writeStore(filePath, data);
    },

    async delete(name) {
      const data = await readStore(filePath);
      if (!data.sessions?.[name]) {
        return;
      }

      delete data.sessions[name];
      await writeStore(filePath, data);
    }
  };
}

export function createSessionHistoryEntry(
  prompt: string,
  result: GrokTextResult,
  createdAt: string,
  images?: SessionImageReference[]
): SessionHistoryEntry {
  return {
    prompt,
    responseText: result.text,
    responseId: result.responseId,
    createdAt,
    ...(result.model ? { model: result.model } : {}),
    citations: result.citations,
    ...(result.usage ? { usage: result.usage } : {}),
    ...(images && images.length > 0 ? { images } : {})
  };
}

async function readStore(filePath: string): Promise<SessionStoreFileShape> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as SessionStoreFileShape;
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

async function writeStore(
  filePath: string,
  data: SessionStoreFileShape
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function toSessionRecord(
  name: string,
  record: Omit<SessionRecord, "name"> & {
    history?: SessionHistoryEntry[];
  }
): SessionRecord {
  return {
    name,
    responseId: record.responseId,
    updatedAt: record.updatedAt,
    history: (record.history ?? []).map((entry) => ({
      ...entry,
      citations: entry.citations ?? [],
      ...(entry.images ? { images: entry.images } : {})
    }))
  };
}
