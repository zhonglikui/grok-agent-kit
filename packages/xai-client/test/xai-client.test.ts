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
});
