export type XaiMessageRole = "system" | "user" | "assistant";

export interface XaiTextPart {
  type: string;
  text: string;
  [key: string]: unknown;
}

export interface XaiInputMessage {
  role: XaiMessageRole;
  content: string | XaiTextPart[];
}

export type XaiResponseInput = string | XaiInputMessage[];

export interface XaiToolDefinition {
  type: string;
  [key: string]: unknown;
}

export interface XaiResponseCreateRequest {
  model: string;
  input: XaiResponseInput;
  instructions?: string;
  tools?: XaiToolDefinition[];
  include?: string[];
  max_output_tokens?: number;
  temperature?: number;
  [key: string]: unknown;
}

export interface XaiCitation {
  url?: string;
  [key: string]: unknown;
}

export interface XaiResponse {
  id: string;
  model?: string;
  output_text?: string;
  citations?: Array<string | XaiCitation>;
  output?: unknown[];
  [key: string]: unknown;
}

export interface XaiModel {
  id: string;
  object: string;
  created?: number;
  [key: string]: unknown;
}

export interface XaiModelListResponse {
  object?: string;
  data: XaiModel[];
  [key: string]: unknown;
}

export interface XaiTransportLike {
  responses: {
    create(request: XaiResponseCreateRequest): Promise<XaiResponse>;
  };
  models: {
    list(): Promise<XaiModelListResponse>;
  };
}

export interface XaiClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  headers?: Record<string, string>;
}
