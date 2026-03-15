import type {
  XaiClientOptions,
  XaiModelListResponse,
  XaiRetryOptions,
  XaiResponse,
  XaiResponseCreateOptions,
  XaiResponseCreateRequest,
  XaiTransportLike
} from "./types.js";

export const DEFAULT_RETRYABLE_STATUS_CODES = [
  408,
  409,
  425,
  429,
  500,
  502,
  503,
  504
] as const;

export const DEFAULT_XAI_RETRY_OPTIONS: Required<XaiRetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 4000,
  retryableStatusCodes: [
    ...DEFAULT_RETRYABLE_STATUS_CODES
  ]
};

export class XaiApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  public constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "XaiApiError";
    this.status = status;
    this.body = body;
  }
}

export class XaiClient implements XaiTransportLike {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs?: number;
  private readonly headers?: Record<string, string>;
  private readonly sleepImpl: (ms: number) => Promise<void>;
  private readonly retry: Required<XaiRetryOptions>;

  public readonly responses: XaiTransportLike["responses"];
  public readonly models: XaiTransportLike["models"];

  public constructor(options: XaiClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.x.ai/v1").replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs;
    this.headers = options.headers;
    this.sleepImpl = options.sleep ?? defaultSleep;
    this.retry = {
      maxAttempts: Math.max(
        options.retry?.maxAttempts ?? DEFAULT_XAI_RETRY_OPTIONS.maxAttempts,
        1
      ),
      baseDelayMs: Math.max(
        options.retry?.baseDelayMs ?? DEFAULT_XAI_RETRY_OPTIONS.baseDelayMs,
        0
      ),
      maxDelayMs: Math.max(
        options.retry?.maxDelayMs ?? DEFAULT_XAI_RETRY_OPTIONS.maxDelayMs,
        0
      ),
      retryableStatusCodes:
        options.retry?.retryableStatusCodes ??
        DEFAULT_XAI_RETRY_OPTIONS.retryableStatusCodes
    };

    this.responses = {
      create: async (request, options) =>
        this.request<XaiResponse>("POST", "/responses", request, options)
    };
    this.models = {
      list: async () => this.request<XaiModelListResponse>("GET", "/models")
    };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    options?: XaiResponseCreateOptions
  ): Promise<T> {
    const isStreamingRequest = Boolean(options?.onTextDelta);

    for (let attempt = 1; attempt <= this.retry.maxAttempts; attempt += 1) {
      const controller =
        this.timeoutMs !== undefined ? new AbortController() : undefined;
      const timeout =
        controller && this.timeoutMs !== undefined
          ? setTimeout(() => controller.abort(), this.timeoutMs)
          : undefined;

      try {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          method,
          headers: {
            authorization: `Bearer ${this.apiKey}`,
            accept: isStreamingRequest ? "text/event-stream" : "application/json",
            ...(body === undefined ? {} : { "content-type": "application/json" }),
            ...this.headers
          },
          body:
            body === undefined
              ? undefined
              : JSON.stringify(
                  isStreamingRequest &&
                    method === "POST" &&
                    path === "/responses" &&
                    body &&
                    typeof body === "object"
                    ? {
                        ...(body as Record<string, unknown>),
                        stream: true
                      }
                    : body
                ),
          signal: controller?.signal
        });

        if (!response.ok) {
          const rawText = await response.text();
          const parsedBody = rawText.length > 0 ? JSON.parse(rawText) : {};

          if (
            attempt < this.retry.maxAttempts &&
            this.isRetryableStatus(response.status)
          ) {
            await this.sleepImpl(this.getRetryDelayMs(attempt, response));
            continue;
          }

          throw new XaiApiError(
            `xAI API request failed with status ${response.status}`,
            response.status,
            parsedBody
          );
        }

        if (isStreamingRequest && options?.onTextDelta) {
          return (await this.readStreamingResponse(
            response,
            options.onTextDelta
          )) as T;
        }

        const rawText = await response.text();
        const parsedBody = rawText.length > 0 ? JSON.parse(rawText) : {};
        return parsedBody as T;
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new XaiApiError("xAI API returned invalid JSON", 502, undefined);
        }

        if (
          attempt < this.retry.maxAttempts &&
          this.isRetryableError(error)
        ) {
          await this.sleepImpl(this.computeBackoffDelayMs(attempt));
          continue;
        }

        if (error instanceof XaiApiError) {
          throw error;
        }

        throw error;
      } finally {
        if (timeout) {
          clearTimeout(timeout);
        }
      }
    }

    throw new Error("xAI API request exhausted all retry attempts");
  }

  private isRetryableStatus(status: number): boolean {
    return this.retry.retryableStatusCodes.includes(status);
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof XaiApiError) {
      return this.isRetryableStatus(error.status);
    }

    if (error instanceof Error) {
      return error.name === "AbortError" || error instanceof TypeError;
    }

    return false;
  }

  private getRetryDelayMs(attempt: number, response: Response): number {
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterMs = this.parseRetryAfterMs(retryAfterHeader);
    return retryAfterMs ?? this.computeBackoffDelayMs(attempt);
  }

  private parseRetryAfterMs(value: string | null): number | undefined {
    if (!value) {
      return undefined;
    }

    const numericSeconds = Number(value);
    if (Number.isFinite(numericSeconds) && numericSeconds >= 0) {
      return numericSeconds * 1000;
    }

    const retryAt = Date.parse(value);
    if (Number.isNaN(retryAt)) {
      return undefined;
    }

    return Math.max(retryAt - Date.now(), 0);
  }

  private computeBackoffDelayMs(attempt: number): number {
    const exponentialDelay =
      this.retry.baseDelayMs * 2 ** Math.max(attempt - 1, 0);
    return Math.min(exponentialDelay, this.retry.maxDelayMs);
  }

  private async readStreamingResponse(
    response: Response,
    onTextDelta: NonNullable<XaiResponseCreateOptions["onTextDelta"]>
  ): Promise<XaiResponse> {
    if (!response.body) {
      throw new XaiApiError("xAI API returned an empty streaming body", 502, undefined);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";
    let finalResponse: XaiResponse | undefined;
    let lastPayload: Record<string, unknown> | undefined;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      while (buffer.includes("\n\n")) {
        const separatorIndex = buffer.indexOf("\n\n");
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);

        const handledEvent = await this.parseSseEvent(rawEvent, onTextDelta);
        if (!handledEvent) {
          continue;
        }

        if (handledEvent.done) {
          continue;
        }

        if (handledEvent.deltaText) {
          accumulatedText += handledEvent.deltaText;
        }

        if (handledEvent.payload) {
          lastPayload = handledEvent.payload;
        }

        if (handledEvent.finalResponse) {
          finalResponse = handledEvent.finalResponse;
        }
      }
    }

    buffer += decoder.decode().replace(/\r\n/g, "\n");

    if (buffer.trim().length > 0) {
      const handledEvent = await this.parseSseEvent(buffer, onTextDelta);
      if (handledEvent?.deltaText) {
        accumulatedText += handledEvent.deltaText;
      }
      if (handledEvent?.payload) {
        lastPayload = handledEvent.payload;
      }
      if (handledEvent?.finalResponse) {
        finalResponse = handledEvent.finalResponse;
      }
    }

    if (finalResponse) {
      return {
        ...finalResponse,
        output_text: finalResponse.output_text ?? accumulatedText
      };
    }

    return {
      id:
        typeof lastPayload?.id === "string"
          ? lastPayload.id
          : "stream_response",
      model: typeof lastPayload?.model === "string" ? lastPayload.model : undefined,
      output_text: accumulatedText,
      citations: Array.isArray(lastPayload?.citations)
        ? (lastPayload.citations as XaiResponse["citations"])
        : undefined,
      output: Array.isArray(lastPayload?.output)
        ? (lastPayload.output as unknown[])
        : undefined
    };
  }

  private async parseSseEvent(
    rawEvent: string,
    onTextDelta: NonNullable<XaiResponseCreateOptions["onTextDelta"]>
  ): Promise<
    | {
        done?: boolean;
        deltaText?: string;
        payload?: Record<string, unknown>;
        finalResponse?: XaiResponse;
      }
    | undefined
  > {
    const dataLines = rawEvent
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());

    if (dataLines.length === 0) {
      return undefined;
    }

    const data = dataLines.join("\n");

    if (data === "[DONE]") {
      return {
        done: true
      };
    }

    const payload = JSON.parse(data) as Record<string, unknown>;
    const deltaText = this.extractStreamingTextDelta(payload);

    if (deltaText) {
      await onTextDelta(deltaText);
    }

    return {
      deltaText,
      payload,
      finalResponse: this.extractFinalStreamingResponse(payload)
    };
  }

  private extractStreamingTextDelta(payload: Record<string, unknown>): string | undefined {
    const directDelta = this.extractTextFragment(payload.delta);
    if (directDelta) {
      return directDelta;
    }

    const choiceDelta = this.extractTextFragment(payload.choices);
    if (choiceDelta) {
      return choiceDelta;
    }

    const contentDelta = this.extractTextFragment(payload.content);
    return contentDelta || undefined;
  }

  private extractTextFragment(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => this.extractTextFragment(item))
        .filter((item) => item.length > 0)
        .join("");
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;

      if (typeof record.text === "string") {
        return record.text;
      }

      if (typeof record.content === "string") {
        return record.content;
      }

      if (Array.isArray(record.content)) {
        return this.extractTextFragment(record.content);
      }
    }

    return "";
  }

  private extractFinalStreamingResponse(
    payload: Record<string, unknown>
  ): XaiResponse | undefined {
    const nestedResponse = payload.response;
    if (nestedResponse && this.isResponseLike(nestedResponse)) {
      return nestedResponse;
    }

    if (this.isResponseLike(payload)) {
      return payload;
    }

    return undefined;
  }

  private isResponseLike(value: unknown): value is XaiResponse {
    return Boolean(
      value &&
        typeof value === "object" &&
        typeof (value as Record<string, unknown>).id === "string"
    );
  }
}

async function defaultSleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
