import type {
  XaiCitation,
  XaiResponse,
  XaiResponseCreateOptions,
  XaiResponseCreateRequest,
  XaiToolDefinition
} from "@grok-agent-kit/xai-client";

import type {
  BasePromptOptions,
  ChatOptions,
  GrokModelsResult,
  GrokServiceOptions,
  GrokTextResult,
  WebSearchOptions,
  XSearchOptions
} from "./types.js";

export class GrokService {
  private readonly client: GrokServiceOptions["client"];
  private readonly defaultModel: string;

  public constructor(options: GrokServiceOptions) {
    this.client = options.client;
    this.defaultModel = options.defaultModel ?? "grok-4";
  }

  public async chat(options: ChatOptions): Promise<GrokTextResult> {
    if (options.xSearch) {
      this.assertExclusiveFilters(
        options.xSearch.allowedXHandles,
        options.xSearch.excludedXHandles,
        "Choose either allowedXHandles or excludedXHandles"
      );
    }

    if (options.webSearch) {
      this.assertExclusiveFilters(
        options.webSearch.allowedWebDomains,
        options.webSearch.excludedWebDomains,
        "Choose either allowedWebDomains or excludedWebDomains"
      );
    }

    const tools: XaiToolDefinition[] = [];

    if (options.xSearch) {
      tools.push(this.buildXSearchTool(options.xSearch));
    }

    if (options.webSearch) {
      tools.push(this.buildWebSearchTool(options.webSearch));
    }

    const request = this.buildResponseRequest(options, tools);
    const createOptions = this.buildResponseCreateOptions(options);
    const response = createOptions
      ? await this.client.responses.create(request, createOptions)
      : await this.client.responses.create(request);

    return this.toTextResult(response, options.includeRaw);
  }

  public async xSearch(options: XSearchOptions): Promise<GrokTextResult> {
    this.assertExclusiveFilters(
      options.allowedXHandles,
      options.excludedXHandles,
      "Choose either allowedXHandles or excludedXHandles"
    );

    const request = this.buildResponseRequest(options, [this.buildXSearchTool(options)]);
    const createOptions = this.buildResponseCreateOptions(options);
    const response = createOptions
      ? await this.client.responses.create(request, createOptions)
      : await this.client.responses.create(request);

    return this.toTextResult(response, options.includeRaw);
  }

  public async webSearch(options: WebSearchOptions): Promise<GrokTextResult> {
    this.assertExclusiveFilters(
      options.allowedWebDomains,
      options.excludedWebDomains,
      "Choose either allowedWebDomains or excludedWebDomains"
    );

    const request = this.buildResponseRequest(options, [this.buildWebSearchTool(options)]);
    const createOptions = this.buildResponseCreateOptions(options);
    const response = createOptions
      ? await this.client.responses.create(request, createOptions)
      : await this.client.responses.create(request);

    return this.toTextResult(response, options.includeRaw);
  }

  public async models(includeRaw = false): Promise<GrokModelsResult> {
    const response = await this.client.models.list();

    return {
      models: response.data,
      ...(includeRaw ? { raw: response } : {})
    };
  }

  private buildResponseRequest(
    options: BasePromptOptions,
    tools: XaiToolDefinition[]
  ): XaiResponseCreateRequest {
    return {
      model: options.model ?? this.defaultModel,
      input: this.buildInput(options.prompt, options.system),
      ...(options.include ? { include: options.include } : {}),
      ...(options.maxOutputTokens !== undefined
        ? { max_output_tokens: options.maxOutputTokens }
        : {}),
      ...(options.temperature !== undefined
        ? { temperature: options.temperature }
        : {}),
      ...(options.previousResponseId
        ? { previous_response_id: options.previousResponseId }
        : {}),
      ...(options.store !== undefined ? { store: options.store } : {}),
      ...(options.onTextDelta ? { stream: true } : {}),
      ...(tools.length > 0 ? { tools } : {}),
      ...(options.responseOverrides ?? {})
    };
  }

  private buildResponseCreateOptions(
    options: BasePromptOptions
  ): XaiResponseCreateOptions | undefined {
    return options.onTextDelta
      ? {
          onTextDelta: options.onTextDelta
        }
      : undefined;
  }

  private buildInput(prompt: string, system?: string) {
    const messages = [];

    if (system) {
      messages.push({
        role: "system" as const,
        content: [
          {
            type: "input_text",
            text: system
          }
        ]
      });
    }

    messages.push({
      role: "user" as const,
      content: [
        {
          type: "input_text",
          text: prompt
        }
      ]
    });

    return messages;
  }

  private buildXSearchTool(
    options: Pick<XSearchOptions, "allowedXHandles" | "excludedXHandles" | "toolOverrides">
  ): XaiToolDefinition {
    return {
      type: "x_search",
      ...(options.allowedXHandles
        ? { allowed_x_handles: options.allowedXHandles }
        : {}),
      ...(options.excludedXHandles
        ? { excluded_x_handles: options.excludedXHandles }
        : {}),
      ...(options.toolOverrides ?? {})
    };
  }

  private buildWebSearchTool(
    options: Pick<
      WebSearchOptions,
      "allowedWebDomains" | "excludedWebDomains" | "toolOverrides"
    >
  ): XaiToolDefinition {
    return {
      type: "web_search",
      ...(options.allowedWebDomains
        ? { allowed_web_domains: options.allowedWebDomains }
        : {}),
      ...(options.excludedWebDomains
        ? { excluded_web_domains: options.excludedWebDomains }
        : {}),
      ...(options.toolOverrides ?? {})
    };
  }

  private assertExclusiveFilters(
    allowed?: string[],
    excluded?: string[],
    message?: string
  ) {
    if ((allowed?.length ?? 0) > 0 && (excluded?.length ?? 0) > 0) {
      throw new Error(message ?? "Allowed and excluded filters are mutually exclusive");
    }
  }

  private toTextResult(response: XaiResponse, includeRaw = false): GrokTextResult {
    return {
      text: this.extractText(response),
      responseId: response.id,
      model: response.model,
      citations: this.normalizeCitations(response.citations),
      ...(includeRaw ? { raw: response } : {})
    };
  }

  private extractText(response: XaiResponse): string {
    if (response.output_text) {
      return response.output_text;
    }

    const nestedText = this.collectNestedText(response.output);
    return nestedText.length > 0 ? nestedText.join("\n") : "";
  }

  private collectNestedText(value: unknown): string[] {
    if (typeof value === "string") {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectNestedText(item));
    }

    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      const textValues = [];

      if (typeof record.text === "string") {
        textValues.push(record.text);
      }

      for (const nestedValue of Object.values(record)) {
        textValues.push(...this.collectNestedText(nestedValue));
      }

      return textValues;
    }

    return [];
  }

  private normalizeCitations(citations?: Array<string | XaiCitation>): XaiCitation[] {
    if (!citations) {
      return [];
    }

    return citations.map((citation) =>
      typeof citation === "string" ? { url: citation } : citation
    );
  }
}
