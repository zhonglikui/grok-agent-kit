import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import type {
  LocalImageInput,
  ResolvedLocalImageInput,
  SessionImageReference,
  SupportedImageMediaType
} from "./types.js";

export const MAX_LOCAL_IMAGE_BYTES = 20 * 1024 * 1024;

const SUPPORTED_IMAGE_MEDIA_TYPES: Record<string, SupportedImageMediaType> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

type ImageLike =
  | string
  | LocalImageInput
  | ResolvedLocalImageInput
  | SessionImageReference;

export async function resolveLocalImageInputs(
  inputs: ImageLike[]
): Promise<ResolvedLocalImageInput[]> {
  const resolvedInputs: ResolvedLocalImageInput[] = [];

  for (const input of inputs) {
    if (isResolvedLocalImageInput(input)) {
      resolvedInputs.push(input);
      continue;
    }

    const normalizedInput =
      typeof input === "string"
        ? { path: input }
        : input;
    const absolutePath = resolve(normalizedInput.path);
    const fileStats = await stat(absolutePath);

    if (fileStats.size > MAX_LOCAL_IMAGE_BYTES) {
      throw new Error(`Image exceeds the 20 MB limit: ${absolutePath}`);
    }

    const mediaType = inferSupportedImageMediaType(absolutePath);
    const fileContents = await readFile(absolutePath);
    const dataUrl = `data:${mediaType};base64,${fileContents.toString("base64")}`;

    resolvedInputs.push({
      path: absolutePath,
      fileName: basename(absolutePath),
      mediaType,
      dataUrl,
      ...(normalizedInput.detail ? { detail: normalizedInput.detail } : {})
    });
  }

  return resolvedInputs;
}

export function toSessionImageReferences(
  images: Array<ResolvedLocalImageInput | SessionImageReference>
): SessionImageReference[] {
  return images.map((image) => ({
    path: image.path,
    fileName: image.fileName,
    mediaType: image.mediaType,
    ...(image.detail ? { detail: image.detail } : {})
  }));
}

function inferSupportedImageMediaType(path: string): SupportedImageMediaType {
  const normalizedPath = path.toLowerCase();

  for (const [extension, mediaType] of Object.entries(
    SUPPORTED_IMAGE_MEDIA_TYPES
  )) {
    if (normalizedPath.endsWith(extension)) {
      return mediaType;
    }
  }

  throw new Error(`Unsupported image format: ${path}`);
}

function isResolvedLocalImageInput(
  value: ImageLike
): value is ResolvedLocalImageInput {
  return Boolean(
    value &&
      typeof value === "object" &&
      "dataUrl" in value &&
      typeof value.dataUrl === "string"
  );
}
