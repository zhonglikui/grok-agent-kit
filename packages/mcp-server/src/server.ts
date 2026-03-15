import type { GrokService } from "@grok-agent-kit/core";
import { createDefaultGrokService } from "@grok-agent-kit/core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { createToolHandlers } from "./tool-handlers.js";

export async function startStdioMcpServer(options?: {
  service?: GrokService;
  version?: string;
}) {
  const service = options?.service ?? createDefaultGrokService();
  const handlers = createToolHandlers(service);
  const server = new McpServer({
    name: "grok-agent-kit",
    version: options?.version ?? "0.1.0"
  });

  server.registerTool(
    "grok_chat",
    {
      title: "Grok Chat",
      description: "Send a chat prompt to xAI Grok.",
      inputSchema: {
        prompt: z.string(),
        system: z.string().optional(),
        model: z.string().optional(),
        previousResponseId: z.string().optional(),
        store: z.boolean().optional(),
        stream: z.boolean().optional(),
        includeRaw: z.boolean().optional()
      }
    },
    async (args, extra) => handlers.grok_chat(args, extra)
  );

  server.registerTool(
    "grok_x_search",
    {
      title: "Grok X Search",
      description: "Answer a prompt using xAI X Search.",
      inputSchema: {
        prompt: z.string(),
        model: z.string().optional(),
        previousResponseId: z.string().optional(),
        store: z.boolean().optional(),
        stream: z.boolean().optional(),
        allowedXHandles: z.array(z.string()).optional(),
        excludedXHandles: z.array(z.string()).optional(),
        includeRaw: z.boolean().optional(),
        toolOverrides: z.record(z.string(), z.unknown()).optional(),
        responseOverrides: z.record(z.string(), z.unknown()).optional()
      }
    },
    async (args, extra) => handlers.grok_x_search(args, extra)
  );

  server.registerTool(
    "grok_web_search",
    {
      title: "Grok Web Search",
      description: "Answer a prompt using xAI Web Search.",
      inputSchema: {
        prompt: z.string(),
        model: z.string().optional(),
        previousResponseId: z.string().optional(),
        store: z.boolean().optional(),
        stream: z.boolean().optional(),
        allowedWebDomains: z.array(z.string()).optional(),
        excludedWebDomains: z.array(z.string()).optional(),
        includeRaw: z.boolean().optional(),
        toolOverrides: z.record(z.string(), z.unknown()).optional(),
        responseOverrides: z.record(z.string(), z.unknown()).optional()
      }
    },
    async (args, extra) => handlers.grok_web_search(args, extra)
  );

  server.registerTool(
    "grok_models",
    {
      title: "Grok Models",
      description: "List available xAI models.",
      inputSchema: {}
    },
    async () => handlers.grok_models({})
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  return {
    server,
    transport
  };
}
