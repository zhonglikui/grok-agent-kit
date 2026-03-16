import { describe, expect, it, vi } from "vitest";

import { GrokService } from "../src/index.js";

describe("GrokService", () => {
  it("builds a plain chat request without search tools", async () => {
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_chat",
          model: "grok-4",
          output_text: "chat reply",
          citations: []
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.chat({
      prompt: "Explain MCP"
    });

    expect(client.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "grok-4",
        input: expect.any(Array)
      })
    );
    expect(result.text).toBe("chat reply");
  });

  it("passes through stateful response fields and returns responseId", async () => {
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_followup",
          model: "grok-4",
          output_text: "continued reply",
          citations: []
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.chat({
      prompt: "Continue the thread",
      previousResponseId: "resp_prior",
      store: true
    });

    expect(client.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        previous_response_id: "resp_prior",
        store: true
      })
    );
    expect(result.responseId).toBe("resp_followup");
  });

  it("enables streaming requests when a text-delta callback is provided", async () => {
    const onTextDelta = vi.fn();
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_stream",
          model: "grok-4",
          output_text: "Hello world",
          citations: []
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.chat({
      prompt: "Stream this",
      onTextDelta
    });

    expect(client.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "grok-4",
        stream: true
      }),
      {
        onTextDelta
      }
    );
    expect(result.text).toBe("Hello world");
  });

  it("builds an X Search tool payload with handle filters", async () => {
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_x",
          model: "grok-4",
          output_text: "x search reply",
          citations: [
            {
              url: "https://x.com/xai/status/1"
            }
          ]
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.xSearch({
      prompt: "Latest xAI launch posts",
      allowedXHandles: [
        "xai"
      ]
    });

    expect(client.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: [
          expect.objectContaining({
            type: "x_search",
            allowed_x_handles: [
              "xai"
            ]
          })
        ]
      })
    );
    expect(result.citations).toHaveLength(1);
  });

  it("rejects conflicting X Search handle filters", async () => {
    const service = new GrokService({
      client: {
        responses: {
          create: vi.fn()
        },
        models: {
          list: vi.fn()
        }
      },
      defaultModel: "grok-4"
    });

    await expect(
      service.xSearch({
        prompt: "Conflict",
        allowedXHandles: [
          "xai"
        ],
        excludedXHandles: [
          "competitor"
        ]
      })
    ).rejects.toThrow("Choose either allowedXHandles or excludedXHandles");
  });

  it("builds a Web Search tool payload with domain filters", async () => {
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_web",
          model: "grok-4",
          output_text: "web search reply",
          citations: [
            {
              url: "https://docs.x.ai"
            }
          ]
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.webSearch({
      prompt: "Search xAI docs",
      allowedWebDomains: [
        "docs.x.ai"
      ]
    });

    expect(client.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: [
          expect.objectContaining({
            type: "web_search",
            allowed_web_domains: [
              "docs.x.ai"
            ]
          })
        ]
      })
    );
    expect(result.text).toBe("web search reply");
  });

  it("maps model list responses into a simplified result", async () => {
    const client = {
      responses: {
        create: vi.fn()
      },
      models: {
        list: vi.fn().mockResolvedValue({
          data: [
            {
              id: "grok-4",
              object: "model",
              created: 123
            }
          ]
        })
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.models();

    expect(result.models).toEqual([
      {
        id: "grok-4",
        object: "model",
        created: 123
      }
    ]);
  });

  it("maps normalized usage metadata from xAI responses", async () => {
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          id: "resp_usage",
          model: "grok-4",
          output_text: "usage reply",
          citations: [],
          usage: {
            input_tokens: 12,
            output_tokens: 34,
            total_tokens: 46,
            input_tokens_details: {
              cached_tokens: 3
            },
            output_tokens_details: {
              reasoning_tokens: 5
            },
            num_sources_used: 2,
            cost_usd_millionths: 120
          }
        })
      },
      models: {
        list: vi.fn()
      }
    };

    const service = new GrokService({
      client,
      defaultModel: "grok-4"
    });

    const result = await service.chat({
      prompt: "Show usage"
    });

    expect(result.usage).toEqual({
      promptTokens: 12,
      completionTokens: 34,
      totalTokens: 46,
      cachedTokens: 3,
      reasoningTokens: 5,
      numSourcesUsed: 2,
      costUsdMillionths: 120
    });
  });
});
