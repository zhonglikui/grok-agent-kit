import type {
  XaiClientOptions,
  XaiModelListResponse,
  XaiResponse,
  XaiResponseCreateRequest,
  XaiTransportLike
} from "./types.js";

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

  public readonly responses: XaiTransportLike["responses"];
  public readonly models: XaiTransportLike["models"];

  public constructor(options: XaiClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.x.ai/v1").replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs;
    this.headers = options.headers;

    this.responses = {
      create: async (request) =>
        this.request<XaiResponse>("POST", "/responses", request)
    };
    this.models = {
      list: async () => this.request<XaiModelListResponse>("GET", "/models")
    };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<T> {
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
          "content-type": "application/json",
          ...this.headers
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller?.signal
      });

      const rawText = await response.text();
      const parsedBody = rawText.length > 0 ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new XaiApiError(
          `xAI API request failed with status ${response.status}`,
          response.status,
          parsedBody
        );
      }

      return parsedBody as T;
    } catch (error) {
      if (error instanceof XaiApiError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new XaiApiError("xAI API returned invalid JSON", 502, undefined);
      }

      throw error;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}
