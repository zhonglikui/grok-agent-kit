import type {
  XaiInputImagePart,
  XaiInputMessage,
  XaiInputTextPart,
  XaiCitation,
  XaiResponse,
  XaiResponseCreateOptions,
  XaiResponseCreateRequest,
  XaiToolDefinition
} from "@grok-agent-kit/xai-client";

import { resolveLocalImageInputs } from "./image-input.js";
import type {
  BasePromptOptions,
  ChatOptions,
  ChatHistoryEntry,
  GrokModelsResult,
  GrokServiceOptions,
  GrokTextResult,
  GrokTextUsage,
  ResolvedLocalImageInput,
  SessionImageReference,
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

    const request = await this.buildResponseRequest(options, tools);
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

    const request = await this.buildResponseRequest(options, [this.buildXSearchTool(options)]);
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

    const request = await this.buildResponseRequest(options, [this.buildWebSearchTool(options)]);
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

  private async buildResponseRequest(
    options: BasePromptOptions | ChatOptions,
    tools: XaiToolDefinition[]
  ): Promise<XaiResponseCreateRequest> {
    const usesImageReplay = this.usesImageReplay(options);

    return {
      model: options.model ?? this.defaultModel,
      input: await this.buildInput(options),
      ...(options.include ? { include: options.include } : {}),
      ...(options.maxOutputTokens !== undefined
        ? { max_output_tokens: options.maxOutputTokens }
        : {}),
      ...(options.temperature !== undefined
        ? { temperature: options.temperature }
        : {}),
      ...(options.previousResponseId && !usesImageReplay
        ? { previous_response_id: options.previousResponseId }
        : {}),
      ...(usesImageReplay
        ? { store: false }
        : options.store !== undefined
          ? { store: options.store }
          : {}),
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

  private async buildInput(
    options: BasePromptOptions | ChatOptions
  ): Promise<XaiInputMessage[]> {
    const messages: XaiInputMessage[] = [];

    if (options.system) {
      messages.push({
        role: "system" as const,
        content: [
          this.createTextPart(options.system)
        ]
      });
    }

    if (this.hasReplayHistory(options)) {
      for (const entry of options.history ?? []) {
        messages.push(
          await this.createUserMessage(entry.prompt, entry.images)
        );
        messages.push({
          role: "assistant" as const,
          content: [
            this.createTextPart(entry.responseText)
          ]
        });
      }
    }

    const currentImages = this.isChatOptions(options) ? options.images : undefined;
    messages.push({
      role: "user" as const,
      content: await this.createUserContent(options.prompt, currentImages)
    });

    return messages;
  }

  private async createUserMessage(
    prompt: string,
    images?: SessionImageReference[] | ResolvedLocalImageInput[]
  ): Promise<XaiInputMessage> {
    return {
      role: "user",
      content: await this.createUserContent(prompt, images)
    };
  }

  private async createUserContent(
    prompt: string,
    images?: SessionImageReference[] | ResolvedLocalImageInput[]
  ): Promise<Array<XaiInputTextPart | XaiInputImagePart>> {
    const content: Array<XaiInputTextPart | XaiInputImagePart> = [
      this.createTextPart(prompt)
    ];

    if ((images?.length ?? 0) > 0) {
      const resolvedImages = await resolveLocalImageInputs(
        images as Array<SessionImageReference | ResolvedLocalImageInput>
      );
      content.push(...resolvedImages.map((image) => this.createImagePart(image)));
    }

    return content;
  }

  private createTextPart(text: string): XaiInputTextPart {
    return {
      type: "input_text",
      text
    };
  }

  private createImagePart(image: ResolvedLocalImageInput): XaiInputImagePart {
    return {
      type: "input_image",
      image_url: image.dataUrl,
      ...(image.detail ? { detail: image.detail } : {})
    };
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
      usage: this.normalizeUsage(response.usage),
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

  private normalizeUsage(usage?: XaiResponse["usage"]): GrokTextUsage | undefined {
    if (!usage) {
      return undefined;
    }

    const normalizedUsage: GrokTextUsage = {
      ...(usage.input_tokens !== undefined
        ? { promptTokens: usage.input_tokens }
        : {}),
      ...(usage.output_tokens !== undefined
        ? { completionTokens: usage.output_tokens }
        : {}),
      ...(usage.total_tokens !== undefined
        ? { totalTokens: usage.total_tokens }
        : {}),
      ...(usage.input_tokens_details?.cached_tokens !== undefined
        ? { cachedTokens: usage.input_tokens_details.cached_tokens }
        : {}),
      ...(usage.output_tokens_details?.reasoning_tokens !== undefined
        ? { reasoningTokens: usage.output_tokens_details.reasoning_tokens }
        : {}),
      ...(usage.num_sources_used !== undefined
        ? { numSourcesUsed: usage.num_sources_used }
        : {}),
      ...(usage.cost_usd_millionths !== undefined
        ? { costUsdMillionths: usage.cost_usd_millionths }
        : {})
    };

    return Object.keys(normalizedUsage).length > 0 ? normalizedUsage : undefined;
  }

  private isChatOptions(
    options: BasePromptOptions | ChatOptions
  ): options is ChatOptions {
    return (
      "images" in options ||
      "history" in options ||
      "xSearch" in options ||
      "webSearch" in options
    );
  }

  private hasReplayHistory(
    options: BasePromptOptions | ChatOptions
  ): options is ChatOptions & { history: ChatHistoryEntry[] } {
    return this.isChatOptions(options) && (options.history?.length ?? 0) > 0;
  }

  private usesImageReplay(options: BasePromptOptions | ChatOptions): boolean {
    if (!this.isChatOptions(options)) {
      return false;
    }

    return (
      (options.images?.length ?? 0) > 0 ||
      (options.history?.some((entry) => (entry.images?.length ?? 0) > 0) ?? false)
    );
  }
}
