import { XaiClient } from "@grok-agent-kit/xai-client";
import type {
  XaiManagementCreateApiKeyRequest,
  XaiManagementCreateApiKeyResponse,
  XaiManagementKeyValidationResponse,
  XaiManagementListApiKeysRequest,
  XaiManagementListApiKeysResponse
} from "@grok-agent-kit/xai-client";

import type { CliAuthService } from "./types.js";

const DEFAULT_MANAGEMENT_BASE_URL = "https://management-api.x.ai";

export function createDefaultCliAuthService(
  env: NodeJS.ProcessEnv = process.env
): CliAuthService {
  let client: XaiClient | undefined;

  const getClient = () => {
    const managementApiKey = env.XAI_MANAGEMENT_API_KEY;
    if (!managementApiKey || managementApiKey.trim().length === 0) {
      throw new Error("XAI_MANAGEMENT_API_KEY is required for management API commands");
    }

    client ??= new XaiClient({
      apiKey: managementApiKey,
      baseUrl: env.XAI_MANAGEMENT_BASE_URL ?? DEFAULT_MANAGEMENT_BASE_URL
    });

    return client;
  };

  return {
    validateManagementKey: async (): Promise<XaiManagementKeyValidationResponse> =>
      getClient().management.validateKey(),
    listApiKeys: async (
      input: XaiManagementListApiKeysRequest
    ): Promise<XaiManagementListApiKeysResponse> =>
      getClient().management.listApiKeys(input),
    createApiKey: async (
      input: XaiManagementCreateApiKeyRequest
    ): Promise<XaiManagementCreateApiKeyResponse> =>
      getClient().management.createApiKey(input)
  };
}
