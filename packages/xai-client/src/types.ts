export type XaiMessageRole = "system" | "user" | "assistant";

export interface XaiInputTextPart {
  type: "input_text";
  text: string;
  [key: string]: unknown;
}

export interface XaiInputImagePart {
  type: "input_image";
  image_url: string;
  detail?: "low" | "high" | "auto";
  [key: string]: unknown;
}

export type XaiInputPart = XaiInputTextPart | XaiInputImagePart;

export interface XaiInputMessage {
  role: XaiMessageRole;
  content: string | XaiInputPart[];
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
  stream?: boolean;
  [key: string]: unknown;
}

export interface XaiCitation {
  url?: string;
  [key: string]: unknown;
}

export interface XaiInputTokensDetails {
  cached_tokens?: number;
  [key: string]: unknown;
}

export interface XaiOutputTokensDetails {
  reasoning_tokens?: number;
  [key: string]: unknown;
}

export interface XaiUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  input_tokens_details?: XaiInputTokensDetails;
  output_tokens_details?: XaiOutputTokensDetails;
  num_sources_used?: number;
  cost_usd_millionths?: number;
  [key: string]: unknown;
}

export interface XaiResponse {
  id: string;
  model?: string;
  output_text?: string;
  citations?: Array<string | XaiCitation>;
  output?: unknown[];
  usage?: XaiUsage;
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

export interface XaiManagementKeyValidationResponse {
  valid: boolean;
  keyId?: string;
  teamIds?: string[];
  [key: string]: unknown;
}

export interface XaiManagementApiKey {
  apiKeyId?: string;
  name?: string;
  teamId?: string;
  acls?: string[];
  qps?: number;
  qpm?: number;
  tpm?: number | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface XaiManagementListApiKeysRequest {
  teamId: string;
  pageSize?: number;
  paginationToken?: string;
}

export interface XaiManagementListApiKeysResponse {
  apiKeys?: XaiManagementApiKey[];
  nextPageToken?: string;
  [key: string]: unknown;
}

export interface XaiManagementCreateApiKeyRequest {
  teamId: string;
  name: string;
  acls: string[];
  qps?: number;
  qpm?: number;
  tpm?: number | null;
}

export interface XaiManagementCreateApiKeyResponse {
  apiKeyId: string;
  apiKey?: string;
  [key: string]: unknown;
}

export interface XaiResponseCreateOptions {
  onTextDelta?: (chunk: string) => void | Promise<void>;
}

export interface XaiTransportLike {
  responses: {
    create(
      request: XaiResponseCreateRequest,
      options?: XaiResponseCreateOptions
    ): Promise<XaiResponse>;
  };
  models: {
    list(): Promise<XaiModelListResponse>;
  };
  management: {
    validateKey(): Promise<XaiManagementKeyValidationResponse>;
    listApiKeys(
      request: XaiManagementListApiKeysRequest
    ): Promise<XaiManagementListApiKeysResponse>;
    createApiKey(
      request: XaiManagementCreateApiKeyRequest
    ): Promise<XaiManagementCreateApiKeyResponse>;
  };
}

export interface XaiClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  headers?: Record<string, string>;
  retry?: XaiRetryOptions;
  sleep?: (ms: number) => Promise<void>;
}

export interface XaiRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableStatusCodes?: number[];
}
