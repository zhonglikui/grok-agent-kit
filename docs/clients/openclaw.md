# OpenClaw setup

[English](./openclaw.md) | [简体中文](./openclaw.zh-CN.md)

## Local development config

Add an MCP server entry that launches the built CLI:

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "node",
      "args": [
        "/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js",
        "mcp"
      ],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## Published package config

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

## Skill asset

Use `skills/openclaw/SKILL.md` for OpenClaw-oriented search guidance.

## Stateful MCP usage

OpenClaw can use these MCP parameters and tools for local continuity:

- `previousResponseId` to continue an earlier xAI response chain
- `store: true` to keep a response chain resumable
- `session` on `grok_chat` to auto-resume a named local session
- `images` on `grok_chat` to attach local screenshots or photos
- `session` and `resetSession` on `grok_x_search` / `grok_web_search` to keep named local search threads
- `grok_list_sessions`, `grok_get_session`, and `grok_delete_session` to manage saved local sessions

If a named session includes image turns, rely on the local `session` replay flow rather than `previousResponseId`.
Text-only named sessions can also move between chat and search tools through the same local session name.

## Example config

You can adapt `examples/clients/openclaw-config.json` directly.
