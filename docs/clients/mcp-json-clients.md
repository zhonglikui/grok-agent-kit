# MCP JSON-config clients

[English](./mcp-json-clients.md) | [简体中文](./mcp-json-clients.zh-CN.md)

This group covers clients that consume JSON-shaped MCP server definitions instead of a dedicated CLI add command.

## Clients in this group

- `OpenClaw`
- `Qwen Code`
- `Trae`

## Shared stdio JSON shape

All of these clients can use the same base transport:

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "npx",
      "args": ["-y", "grok-agent-kit", "mcp"],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

For local development mode, swap the transport to:

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "node",
      "args": ["/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js", "mcp"],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## Client-specific notes

### OpenClaw

- Uses the shared `mcpServers` JSON shape directly.
- This repository ships `examples/clients/openclaw-config.json`.

### Qwen Code

- Uses `settings.json` with a top-level `mcpServers` object.
- Also supports `mcp` global controls such as allow / exclude lists.
- `qwen mcp add` can manage the same configuration for you when you prefer a command flow.

### Trae

- Supports manual JSON entry in the MCP settings UI.
- Supports project-level `.trae/mcp.json`.
- Accepts stdio servers with `command`, `args`, and `env`, and also remote HTTP variants.

## Optional extensions

Some clients in this group add extra fields beyond the shared minimum:

- `cwd`
- `timeout`
- `trust`
- `includeTools` / `excludeTools`
- remote `url` or `httpUrl`

`grok-agent-kit` does not require these fields for the standard local-first path.
