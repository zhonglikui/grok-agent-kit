import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFileSessionStore } from "../src/session-store.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createTempSessionStore() {
  const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-session-store-"));
  tempDirectories.push(directory);

  return createFileSessionStore({
    baseDirectory: directory
  });
}

describe("createFileSessionStore", () => {
  it("saves and reloads a named session", async () => {
    const store = createTempSessionStore();

    await store.set("alpha", {
      responseId: "resp_123",
      updatedAt: "2026-03-15T00:00:00.000Z"
    });

    await expect(store.get("alpha")).resolves.toEqual({
      name: "alpha",
      responseId: "resp_123",
      updatedAt: "2026-03-15T00:00:00.000Z"
    });
  });

  it("lists sessions sorted by most recently updated first", async () => {
    const store = createTempSessionStore();

    await store.set("older", {
      responseId: "resp_old",
      updatedAt: "2026-03-15T00:00:00.000Z"
    });
    await store.set("newer", {
      responseId: "resp_new",
      updatedAt: "2026-03-15T01:00:00.000Z"
    });

    await expect(store.list()).resolves.toEqual([
      {
        name: "newer",
        responseId: "resp_new",
        updatedAt: "2026-03-15T01:00:00.000Z"
      },
      {
        name: "older",
        responseId: "resp_old",
        updatedAt: "2026-03-15T00:00:00.000Z"
      }
    ]);
  });

  it("deletes an existing session", async () => {
    const store = createTempSessionStore();

    await store.set("alpha", {
      responseId: "resp_123",
      updatedAt: "2026-03-15T00:00:00.000Z"
    });

    await store.delete("alpha");

    await expect(store.get("alpha")).resolves.toBeUndefined();
  });
});
