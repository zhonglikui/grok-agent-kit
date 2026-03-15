# Client setup docs

[English](./README.md) | [简体中文](./README.zh-CN.md)

Use these guides to connect `grok-agent-kit` to supported agent clients.

## Before you start

- replace `/absolute/path/to/grok-agent-kit` with your own clone path
- build the local CLI first when using local development mode
- set `XAI_API_KEY` in the host environment or client-specific MCP env config

## Guides

- [Codex](./codex.md)
- [Claude Code](./claude-code.md)
- [OpenClaw](./openclaw.md)

## Streaming note

- `grok_chat` now supports `stream: true` over MCP.
- Compatible clients can request MCP progress notifications and read delta text from `notifications/progress.params.message`.
- Client support for rendering progress notifications varies by product and version.

## Example configs

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
