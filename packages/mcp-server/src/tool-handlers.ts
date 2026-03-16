import type {
  ChatOptions,
  GrokModelsResult,
  GrokTextResult,
  SessionHistoryEntry,
  SessionRecord,
  SessionStore,
  WebSearchOptions,
  XSearchOptions
} from "@grok-agent-kit/core";
import {
  createSessionHistoryEntry,
  resolveLocalImageInputs,
  toSessionImageReferences
} from "@grok-agent-kit/core";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  ProgressNotification,
  ServerNotification,
  ServerRequest
} from "@modelcontextprotocol/sdk/types.js";

type McpChatInput = Omit<ChatOptions, "images"> & {
  images?: string[];
  session?: string;
  stream?: boolean;
};

type McpXSearchInput = XSearchOptions & {
  stream?: boolean;
};

type McpWebSearchInput = WebSearchOptions & {
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
}, sessionStore: SessionStore = createNoopSessionStore()) {
  return {
    async grok_chat(input: McpChatInput, extra?: ToolHandlerExtra) {
      const existingSession = input.session
        ? await sessionStore.get(input.session)
        : undefined;
      const resolvedImages = await resolveLocalImageInputs(input.images ?? []);
      const shouldReplayLocally =
        resolvedImages.length > 0 || hasImageHistory(existingSession);

      if (input.session && input.store === false && !shouldReplayLocally) {
        return createErrorResult(
          new Error("session cannot be used with store=false")
        );
      }

      if (input.previousResponseId && shouldReplayLocally) {
        return createErrorResult(
          new Error(
            "previousResponseId cannot be used with image-backed chats; use session replay instead"
          )
        );
      }

      const { session, images: _images, ...chatInput } = input;

      return runStreamableTextTool(
        {
          ...chatInput,
          ...(resolvedImages.length > 0 ? { images: resolvedImages } : {}),
          ...(shouldReplayLocally && existingSession?.history
            ? { history: existingSession.history }
            : {}),
          ...(session && !shouldReplayLocally && !chatInput.previousResponseId
            ? { previousResponseId: existingSession?.responseId }
            : {}),
          ...(shouldReplayLocally
            ? { store: false }
            : session
              ? { store: true }
              : {})
        },
        extra,
        (serviceInput) => service.chat(serviceInput),
        async (result) => {
          if (!session) {
            return;
          }

          const nextResponseId = result.responseId ?? existingSession?.responseId;
          if (!nextResponseId) {
            return;
          }

          const timestamp = new Date().toISOString();
          await sessionStore.set(session, {
            responseId: nextResponseId,
            updatedAt: timestamp,
            history: [
              ...(existingSession?.history ?? []),
              createSessionHistoryEntry(
                chatInput.prompt,
                result,
                timestamp,
                toSessionImageReferences(resolvedImages)
              )
            ]
          });
        }
      );
    },

    async grok_x_search(input: McpXSearchInput, extra?: ToolHandlerExtra) {
      return runStreamableTextTool(input, extra, (serviceInput) =>
        service.xSearch(serviceInput)
      );
    },

    async grok_web_search(input: McpWebSearchInput, extra?: ToolHandlerExtra) {
      return runStreamableTextTool(input, extra, (serviceInput) =>
        service.webSearch(serviceInput)
      );
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
    },

    async grok_list_sessions(input: {
      search?: string;
      model?: string;
      limit?: number;
    }) {
      try {
        const sessions = filterSessions(await sessionStore.list(), input);

        return {
          content: [
            {
              type: "text" as const,
              text: renderSessionList(sessions)
            }
          ],
          structuredContent: {
            sessions
          }
        };
      } catch (error) {
        return createErrorResult(error);
      }
    },

    async grok_get_session(input: {
      name: string;
    }) {
      try {
        const session = await sessionStore.get(input.name);

        if (!session) {
          return createErrorResult(new Error(`Session ${input.name} not found.`));
        }

        return {
          content: [
            {
              type: "text" as const,
              text: renderSessionTranscript(session)
            }
          ],
          structuredContent: {
            session
          }
        };
      } catch (error) {
        return createErrorResult(error);
      }
    },

    async grok_delete_session(input: {
      name: string;
    }) {
      try {
        await sessionStore.delete(input.name);

        return {
          content: [
            {
              type: "text" as const,
              text: `Deleted session ${input.name}`
            }
          ],
          structuredContent: {
            deleted: true,
            name: input.name
          }
        };
      } catch (error) {
        return createErrorResult(error);
      }
    }
  };
}

async function runStreamableTextTool<TInput extends ChatOptions | XSearchOptions | WebSearchOptions>(
  input: TInput & { stream?: boolean },
  extra: ToolHandlerExtra | undefined,
  loader: (input: TInput) => Promise<GrokTextResult>,
  onResult?: (result: GrokTextResult) => Promise<void>
) {
  const { stream, ...serviceInput } = input;
  const onTextDelta = createProgressNotifier(stream, extra);

  return runTextTool(async () => {
    const result = await loader({
      ...(serviceInput as TInput),
      ...(onTextDelta ? { onTextDelta } : {})
    });

    await onResult?.(result);

    return result;
  });
}

function createProgressNotifier(
  stream: boolean | undefined,
  extra: ToolHandlerExtra | undefined
) {
  const progressToken = extra?._meta?.progressToken;
  const sendNotification = extra?.sendNotification;

  if (!stream || progressToken === undefined || sendNotification === undefined) {
    return undefined;
  }

  let progress = 0;

  return async (chunk: string) => {
    progress += 1;
    await sendNotification({
      method: "notifications/progress",
      params: {
        progressToken,
        progress,
        message: chunk
      }
    } satisfies ProgressNotification);
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

function createNoopSessionStore(): SessionStore {
  return {
    async get() {
      return undefined;
    },
    async list() {
      return [];
    },
    async set() {},
    async delete() {}
  };
}

function renderSessionList(sessions: SessionRecord[]): string {
  if (sessions.length === 0) {
    return "No sessions found.";
  }

  return sessions
    .map((session) => `${session.name}\t${session.responseId}\t${session.updatedAt}`)
    .join("\n");
}

function renderSessionTranscript(session: SessionRecord): string {
  const transcript = session.history
    .map((entry) => renderSessionHistoryEntry(entry))
    .join("\n\n");

  return [
    session.name,
    `Last response: ${session.responseId}`,
    `Updated: ${session.updatedAt}`,
    "",
    transcript
  ].join("\n");
}

function renderSessionHistoryEntry(entry: SessionHistoryEntry): string {
  return [
    `[${entry.createdAt}]${entry.model ? ` (${entry.model})` : ""}`,
    `User: ${entry.prompt}`,
    `Assistant: ${entry.responseText}`,
    ...(entry.responseId ? [`Response ID: ${entry.responseId}`] : [])
  ].join("\n");
}

function filterSessions(
  sessions: SessionRecord[],
  options: {
    search?: string;
    model?: string;
    limit?: number;
  }
) {
  let filteredSessions = sessions;

  if (options.search) {
    const expression = new RegExp(options.search, "i");
    filteredSessions = filteredSessions.filter((session) =>
      expression.test(
        [
          session.name,
          ...session.history.flatMap((entry) => [entry.prompt, entry.responseText])
        ].join("\n")
      )
    );
  }

  if (options.model) {
    filteredSessions = filteredSessions.filter((session) =>
      session.history.some((entry) => entry.model === options.model)
    );
  }

  if (options.limit !== undefined) {
    filteredSessions = filteredSessions.slice(0, options.limit);
  }

  return filteredSessions;
}

function hasImageHistory(session: SessionRecord | undefined): boolean {
  return session?.history.some((entry) => (entry.images?.length ?? 0) > 0) ?? false;
}
