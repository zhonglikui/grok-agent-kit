# Codex setup

[English](./codex.md) | [简体中文](./codex.zh-CN.md)

## Local development config

Build the CLI, then point Codex at your local clone:

```toml
[mcp_servers.grok-agent-kit]
command = "node"
args = ["/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

You can adapt `examples/clients/codex-config.toml` directly.

## Published package config

After npm publication:

```toml
[mcp_servers.grok-agent-kit]
command = "npx"
args = ["-y", "grok-agent-kit", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

## Optional local auth management

If you want to run local auth-management commands outside MCP, also set:

- `XAI_MANAGEMENT_API_KEY`

This is optional and not required for Codex MCP inference traffic.

## Suggested Codex guidance

Codex does not consume Claude-style `SKILL.md` files directly, so add guidance to your project `AGENTS.md` or personal prompt instructions:

> Use `grok_x_search` for live X content, `grok_web_search` for docs and web grounding, and `grok_chat` only after search when synthesis is needed. Prefer `session` for continuity, preserve citations, and tighten domain or handle filters before broadening.

## Stateful MCP usage

When Codex needs continuity across tool calls, pass:

- `previousResponseId` to continue an earlier xAI response chain
- `store: true` when the follow-up should remain resumable
- `session` on `grok_chat` when you want local named-session auto-resume without manually threading IDs
- `images` on `grok_chat` when you want local screenshot or photo analysis
- `session` and `resetSession` on `grok_x_search` / `grok_web_search` when you want multi-turn search workflows without manual response-id tracking

Codex can also inspect or clean up saved local state through:

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

If a named session includes image turns, `grok_chat` replays the local transcript with `store: false` instead of using `previousResponseId`.
Text-only named sessions can move between `grok_chat`, `grok_x_search`, and `grok_web_search` through the same local session name.

## Useful local CLI companions

Outside MCP, these local commands pair well with Codex:

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`
