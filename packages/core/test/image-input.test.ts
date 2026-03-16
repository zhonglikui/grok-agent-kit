import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  MAX_LOCAL_IMAGE_BYTES,
  resolveLocalImageInputs,
  toSessionImageReferences
} from "../src/index.js";

const tempDirectories: string[] = [];

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("image input helpers", () => {
  it("resolves a local PNG file into a data URL and lightweight metadata", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-image-input-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "screen.png");
    writeFileSync(imagePath, Buffer.from("png-binary"), "utf8");

    const resolvedImages = await resolveLocalImageInputs([
      imagePath
    ]);

    expect(resolvedImages).toEqual([
      expect.objectContaining({
        path: imagePath,
        fileName: "screen.png",
        mediaType: "image/png",
        dataUrl: expect.stringContaining("data:image/png;base64,")
      })
    ]);
    expect(toSessionImageReferences(resolvedImages)).toEqual([
      {
        path: imagePath,
        fileName: "screen.png",
        mediaType: "image/png"
      }
    ]);
  });

  it("rejects unsupported local image formats", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-image-input-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "screen.gif");
    writeFileSync(imagePath, Buffer.from("gif-binary"), "utf8");

    await expect(
      resolveLocalImageInputs([
        imagePath
      ])
    ).rejects.toThrow("Unsupported image format");
  });

  it("rejects images larger than the local size limit", async () => {
    const directory = mkdtempSync(join(tmpdir(), "grok-agent-kit-image-input-"));
    tempDirectories.push(directory);
    const imagePath = join(directory, "large.jpg");
    writeFileSync(imagePath, Buffer.alloc(MAX_LOCAL_IMAGE_BYTES + 1, 1));

    await expect(
      resolveLocalImageInputs([
        imagePath
      ])
    ).rejects.toThrow("Image exceeds the 20 MB limit");
  });
});
