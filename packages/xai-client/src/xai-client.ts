import type {
  XaiClientOptions,
  XaiModelListResponse,
  XaiRetryOptions,
  XaiResponse,
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
            "content-type": "application/json",
            ...this.headers
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller?.signal
        });

        const rawText = await response.text();
        const parsedBody = rawText.length > 0 ? JSON.parse(rawText) : {};

        if (!response.ok) {
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
}

async function defaultSleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
