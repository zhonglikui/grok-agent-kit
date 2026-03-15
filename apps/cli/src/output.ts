import type { GrokModelsResult, GrokTextResult } from "@grok-agent-kit/core";

export function renderTextResult(
  result: GrokTextResult,
  json: boolean,
  writeStdout: (value: string) => void
) {
  if (json) {
    writeStdout(JSON.stringify(result, null, 2));
    return;
  }

  const lines = [result.text];

  if (result.citations.length > 0) {
    lines.push("");
    lines.push("Sources:");

    for (const citation of result.citations) {
      lines.push(`- ${citation.url ?? JSON.stringify(citation)}`);
    }
  }

  writeStdout(lines.join("\n"));
}

export function renderModelsResult(
  result: GrokModelsResult,
  json: boolean,
  writeStdout: (value: string) => void
) {
  if (json) {
    writeStdout(JSON.stringify(result, null, 2));
    return;
  }

  writeStdout(
    result.models.map((model) => `${model.id} (${model.object})`).join("\n")
  );
}
