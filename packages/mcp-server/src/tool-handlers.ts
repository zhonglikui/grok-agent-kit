import type {
  ChatOptions,
  GrokModelsResult,
  GrokTextResult,
  WebSearchOptions,
  XSearchOptions
} from "@grok-agent-kit/core";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ProgressNotification,
  ServerNotification,
  ServerRequest
} from "@modelcontextprotocol/sdk/types.js";

type McpChatInput = ChatOptions & {
  stream?: boolean;
};

type ToolHandlerExtra = Pick<
  RequestHandlerExtra<ServerRequest, ServerNotification>,
  "_meta" | "sendNotification"
>;

function renderTextResult(result: GrokTextResult): string {
  const lines = [result.text];

  if (result.citations.length > 0) {
    lines.push("");
    lines.push("Sources:");

    for (const citation of result.citations) {
      lines.push(`- ${citation.url ?? JSON.stringify(citation)}`);
    }
  }

  return lines.join("\n");
}

function renderModelsResult(result: GrokModelsResult): string {
  return result.models.map((model) => `${model.id} (${model.object})`).join("\n");
}

export function createToolHandlers(service: {
  chat: (input: ChatOptions) => Promise<GrokTextResult>;
  xSearch: (input: XSearchOptions) => Promise<GrokTextResult>;
  webSearch: (input: WebSearchOptions) => Promise<GrokTextResult>;
  models: (includeRaw?: boolean) => Promise<GrokModelsResult>;
}) {
  return {
    async grok_chat(input: McpChatInput, extra?: ToolHandlerExtra) {
      const { stream, ...serviceInput } = input;
      const progressToken = extra?._meta?.progressToken;
      const sendNotification = extra?.sendNotification;

      if (!stream || progressToken === undefined || sendNotification === undefined) {
        return runTextTool(() => service.chat(serviceInput));
      }

      let progress = 0;

      return runTextTool(() =>
        service.chat({
          ...serviceInput,
          onTextDelta: async (chunk) => {
            progress += 1;
            await sendNotification({
              method: "notifications/progress",
              params: {
                progressToken,
                progress,
                message: chunk
              }
            } satisfies ProgressNotification);
          }
        })
      );
    },

    async grok_x_search(input: XSearchOptions) {
      return runTextTool(() => service.xSearch(input));
    },

    async grok_web_search(input: WebSearchOptions) {
      return runTextTool(() => service.webSearch(input));
    },

    async grok_models(_input: Record<string, unknown>) {
      try {
        const result = await service.models(true);
        const structuredContent: Record<string, unknown> = {
          models: result.models,
          ...(result.raw !== undefined ? { raw: result.raw } : {})
        };

        return {
          content: [
            {
              type: "text" as const,
              text: renderModelsResult(result)
            }
          ],
          structuredContent
        };
      } catch (error) {
        return createErrorResult(error);
      }
    }
  };
}

async function runTextTool(
  loader: () => Promise<GrokTextResult>
) {
  try {
    const result = await loader();
    const structuredContent: Record<string, unknown> = {
      text: result.text,
      citations: result.citations,
      ...(result.responseId ? { responseId: result.responseId } : {}),
      ...(result.model ? { model: result.model } : {}),
      ...(result.raw !== undefined ? { raw: result.raw } : {})
    };

    return {
      content: [
        {
          type: "text" as const,
          text: renderTextResult(result)
        }
      ],
      structuredContent
    };
  } catch (error) {
    return createErrorResult(error);
  }
}

function createErrorResult(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown MCP tool error";
  const name = error instanceof Error ? error.name : "Error";

  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`
      }
    ],
    structuredContent: {
      error: {
        name,
        message
      }
    }
  };
}
