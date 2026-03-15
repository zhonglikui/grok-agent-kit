import { describe, expect, it, vi } from "vitest";

import { XaiApiError, XaiClient } from "../src/index.js";

describe("XaiClient", () => {
  it("posts responses payloads to the xAI REST API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_1",
          model: "grok-4",
          output_text: "Hello from Grok"
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock
    });

    const response = await client.responses.create({
      model: "grok-4",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Hello"
            }
          ]
        }
      ]
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.x.ai/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "content-type": "application/json",
          authorization: "Bearer test-key"
        })
      })
    );
    expect(response.output_text).toBe("Hello from Grok");
  });

  it("lists models from the xAI REST API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          object: "list",
          data: [
            {
              id: "grok-4",
              object: "model"
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock
    });

    const models = await client.models.list();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.x.ai/v1/models",
      expect.objectContaining({
        method: "GET"
      })
    );
    expect(models.data).toEqual([
      {
        id: "grok-4",
        object: "model"
      }
    ]);
  });

  it("throws a typed error for non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "bad request" } }), {
        status: 400,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock
    });

    await expect(
      client.responses.create({
        model: "grok-4",
        input: "Hello"
      })
    ).rejects.toBeInstanceOf(XaiApiError);
  });

  it("retries retryable HTTP responses and respects Retry-After when present", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "rate limited" } }), {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": "2"
          }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "resp_retry",
            model: "grok-4",
            output_text: "Recovered after retry"
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        )
      );
    const sleepMock = vi.fn().mockResolvedValue(undefined);

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock,
      sleep: sleepMock
    });

    const response = await client.responses.create({
      model: "grok-4",
      input: "Retry me"
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledWith(2000);
    expect(response.output_text).toBe("Recovered after retry");
  });

  it("retries transient network failures with exponential backoff", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "resp_network",
            model: "grok-4",
            output_text: "Recovered after network retry"
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        )
      );
    const sleepMock = vi.fn().mockResolvedValue(undefined);

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock,
      sleep: sleepMock,
      retry: {
        maxAttempts: 3,
        baseDelayMs: 150,
        maxDelayMs: 1000
      }
    });

    const response = await client.responses.create({
      model: "grok-4",
      input: "Retry network"
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledWith(150);
    expect(response.output_text).toBe("Recovered after network retry");
  });

  it("streams response text deltas from SSE and returns the final response", async () => {
    const encoder = new TextEncoder();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                'data: {"type":"response.output_text.delta","delta":"Hello"}\n\n'
              )
            );
            controller.enqueue(
              encoder.encode(
                'data: {"type":"response.output_text.delta","delta":" world"}\n\n'
              )
            );
            controller.enqueue(
              encoder.encode(
                'data: {"type":"response.completed","response":{"id":"resp_stream","model":"grok-4","output_text":"Hello world","citations":[]}}\n\n'
              )
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        }),
        {
          status: 200,
          headers: {
            "content-type": "text/event-stream"
          }
        }
      )
    );
    const deltas: string[] = [];

    const client = new XaiClient({
      apiKey: "test-key",
      baseUrl: "https://api.x.ai/v1",
      fetch: fetchMock
    });

    const response = await client.responses.create(
      {
        model: "grok-4",
        input: "Stream please",
        stream: true
      },
      {
        onTextDelta: async (chunk) => {
          deltas.push(chunk);
        }
      }
    );

    expect(deltas).toEqual([
      "Hello",
      " world"
    ]);
    expect(response).toEqual(
      expect.objectContaining({
        id: "resp_stream",
        model: "grok-4",
        output_text: "Hello world"
      })
    );
  });
});
