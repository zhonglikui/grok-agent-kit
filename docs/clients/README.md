# Client setup docs

[English](./README.md) | [简体中文](./README.zh-CN.md)

Use these guides to connect `grok-agent-kit` to supported agent clients.

## Before you start

- replace `/absolute/path/to/grok-agent-kit` with your own clone path
- build the local CLI first when using local development mode
- set `XAI_API_KEY` in the host environment or client-specific MCP env config
- set `XAI_MANAGEMENT_API_KEY` only if you also plan to use local auth-management commands such as `grok-agent-kit auth status`

## Guides

- [Codex](./codex.md)
- [Claude Code](./claude-code.md)
- [OpenClaw](./openclaw.md)

## Recommended local companion commands

These are optional local terminal workflows outside MCP, but they pair well with agent clients:

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## Streaming note

- `grok_chat`, `grok_x_search`, and `grok_web_search` support `stream: true` over MCP.
- Compatible clients can request MCP progress notifications and read delta text from `notifications/progress.params.message`.
- Client support for rendering progress notifications varies by product and version.

## Local session note

- `grok_chat` accepts `session` for CLI-style named local session continuation.
- `grok_chat` accepts `images: ["/absolute/path/to/file.png"]` for local PNG/JPEG analysis.
- `grok_chat`, `grok_x_search`, and `grok_web_search` accept `previousResponseId` and `store` for explicit response chaining.
- `grok_x_search` and `grok_web_search` also accept `session` and `resetSession` for named local search workflows.
- `grok_list_sessions`, `grok_get_session`, and `grok_delete_session` provide local session management over MCP.
- Image-backed named chat sessions replay from the local archive with `store: false` instead of relying on server-side history.

## Auth note

- `XAI_API_KEY` is the required runtime credential for chat, search, and MCP inference.
- `XAI_MANAGEMENT_API_KEY` is optional and only needed for local management API commands such as `grok-agent-kit auth validate-management`.
- Browser auth is not part of the shipped local CLI/MCP path.

## Example configs

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
