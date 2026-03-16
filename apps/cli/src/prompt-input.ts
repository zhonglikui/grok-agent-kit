import { readFile } from "node:fs/promises";

export async function resolvePromptInput(options: {
  prompt?: string;
  promptFile?: string;
  stdinText?: string;
}): Promise<string> {
  const directPrompt = await resolveOptionalTextInput({
    value: options.prompt,
    filePath: options.promptFile,
    valueFlag: "--prompt",
    fileFlag: "--prompt-file",
    label: "prompt"
  });

  const parts = [directPrompt, normalizeText(options.stdinText)].filter(
    (value): value is string => Boolean(value)
  );

  if (parts.length === 0) {
    throw new Error("Provide --prompt, --prompt-file, or piped stdin input.");
  }

  return parts.join("\n\n");
}

export async function resolveOptionalTextInput(options: {
  value?: string;
  filePath?: string;
  valueFlag: string;
  fileFlag: string;
  label: string;
}): Promise<string | undefined> {
  if (options.value && options.filePath) {
    throw new Error(
      `${options.valueFlag} and ${options.fileFlag} cannot be used together`
    );
  }

  if (options.filePath) {
    try {
      return await readFile(options.filePath, "utf8");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown file read error";
      throw new Error(`Unable to read ${options.label} file ${options.filePath}: ${detail}`);
    }
  }

  return normalizeText(options.value);
}

export async function readPipedStdin(options?: {
  stdinIsTTY?: () => boolean;
  readStdin?: () => Promise<string>;
}): Promise<string | undefined> {
  const stdinIsTTY = options?.stdinIsTTY ?? (() => process.stdin.isTTY ?? true);
  if (stdinIsTTY()) {
    return undefined;
  }

  const readStdin = options?.readStdin ?? readProcessStdin;
  return normalizeText(await readStdin());
}

async function readProcessStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    process.stdin.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    process.stdin.on("end", () => resolve());
    process.stdin.on("error", reject);
  });

  return Buffer.concat(chunks).toString("utf8");
}

function normalizeText(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value.length > 0 ? value : undefined;
}
