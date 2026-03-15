# grok-agent-kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

`grok-agent-kit` packages the same Grok-powered capability surface for three audiences:

- humans using a local CLI
- coding agents using MCP
- teams sharing search guidance through reusable skills

## What it ships

- `grok-agent-kit chat`
- `grok-agent-kit doctor`
- `grok-agent-kit x-search`
- `grok-agent-kit web-search`
- `grok-agent-kit models`
- `grok-agent-kit sessions`
- `grok-agent-kit mcp`

The MCP server exposes:

- `grok_chat`
- `grok_x_search`
- `grok_web_search`
- `grok_models`

## Requirements

- Node.js `20+`
- an `XAI_API_KEY`

## Environment

Set these variables before running the CLI or MCP server:

```bash
XAI_API_KEY=your_key_here
XAI_BASE_URL=https://api.x.ai/v1
GROK_AGENT_KIT_MODEL=grok-4
GROK_AGENT_KIT_TIMEOUT_MS=30000
GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS=3
GROK_AGENT_KIT_RETRY_BASE_DELAY_MS=250
GROK_AGENT_KIT_RETRY_MAX_DELAY_MS=4000
```

`XAI_BASE_URL` is optional and defaults to the official xAI inference base URL.
`grok-agent-kit` now retries transient rate-limit, timeout, and `5xx` failures by default to make long-running agent workflows more reliable.

## Quick start

Run directly from npm after publication:

```bash
npx -y grok-agent-kit chat --prompt "Hello from Grok"
npx -y grok-agent-kit doctor
npx -y grok-agent-kit chat --prompt "Stream a quick summary" --stream
npx -y grok-agent-kit chat --session research --prompt "Summarize the latest Grok updates"
npx -y grok-agent-kit chat --session research --prompt "Turn that into a release note draft"
npx -y grok-agent-kit sessions show research
npx -y grok-agent-kit x-search --prompt "Latest xAI posts" --stream
npx -y grok-agent-kit web-search --prompt "Latest xAI docs" --stream
npx -y grok-agent-kit x-search --session research --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --session research --prompt "Latest xAI docs"
npx -y grok-agent-kit x-search --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --prompt "Latest xAI docs"
npx -y grok-agent-kit sessions list
npx -y grok-agent-kit models
npx -y grok-agent-kit mcp
```

For local development:

```bash
npm install
npm test
npm run build
node apps/cli/dist/bin.js doctor
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js chat --prompt "Stream a local reply" --stream
node apps/cli/dist/bin.js chat --session demo --prompt "Start a local-first conversation"
node apps/cli/dist/bin.js sessions show demo
node apps/cli/dist/bin.js x-search --prompt "Find recent xAI posts" --stream
node apps/cli/dist/bin.js web-search --prompt "Find updated xAI docs" --stream
node apps/cli/dist/bin.js x-search --session demo --prompt "Find recent xAI posts"
node apps/cli/dist/bin.js web-search --session demo --prompt "Find updated xAI docs"
node apps/cli/dist/bin.js sessions list
node apps/cli/dist/bin.js mcp
```

## Conversation continuity

`grok-agent-kit` now supports local conversation persistence for the CLI and explicit response chaining for MCP clients.

- Use `chat --session <name>` to continue a named local session across invocations.
- Use `chat --reset-session --session <name>` to start that named session over.
- Use `chat --stream` to print chat text incrementally as xAI sends deltas.
- Use `x-search --stream` and `web-search --stream` to stream search text incrementally.
- Use `x-search --session <name>` and `web-search --session <name>` to continue search workflows in the same named session.
- Use `sessions show <name>` to print the saved local transcript for that named session.
- Use `sessions list` and `sessions delete <name>` to manage local session metadata.
- MCP clients can pass `previousResponseId` and `store` to `grok_chat`, `grok_x_search`, and `grok_web_search` when they want explicit continuity.
- MCP clients can pass `stream: true` to `grok_chat` and request MCP progress notifications to receive text deltas in `notifications/progress.params.message`.

## Diagnostics

Use `grok-agent-kit doctor` to validate the local setup before using chat, search, or MCP.

It currently checks:

- supported Node.js version
- `XAI_API_KEY` presence
- `XAI_BASE_URL` validity
- `GROK_AGENT_KIT_MODEL` fallback or value
- local state directory and `sessions.json` readability

## Client setup docs

- [Client docs index](./docs/clients/README.md)
- [Codex](./docs/clients/codex.md)
- [Claude Code](./docs/clients/claude-code.md)
- [OpenClaw](./docs/clients/openclaw.md)

Simplified Chinese:

- [客户端文档索引](./docs/clients/README.zh-CN.md)
- [Codex（中文）](./docs/clients/codex.zh-CN.md)
- [Claude Code（中文）](./docs/clients/claude-code.zh-CN.md)
- [OpenClaw（中文）](./docs/clients/openclaw.zh-CN.md)

## Community and release

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR
- Report vulnerabilities through [SECURITY.md](./SECURITY.md)
- Review behavior expectations in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Publish from GitHub Actions with `.github/workflows/publish.yml` after setting the `NPM_TOKEN` repository secret

## Repository layout

```text
apps/cli               Public npm package and command entrypoint
packages/xai-client    Direct xAI REST client
packages/core          Shared domain logic for CLI and MCP
packages/mcp-server    MCP tool registration and stdio server
packages/skill-utils   Future helpers for packaging skill assets
skills/                Shared and client-specific skill content
examples/clients       Ready-to-adapt config examples
docs/clients           Client installation notes
```

## Official references used

- [xAI Quickstart](https://docs.x.ai/developers/quickstart)
- [xAI REST Inference API](https://docs.x.ai/developers/rest-api-reference/inference)
- [xAI Web Search](https://docs.x.ai/developers/tools/web-search)
- [xAI X Search](https://docs.x.ai/developers/tools/x-search)
- [xAI Models API](https://docs.x.ai/developers/rest-api-reference/inference/models)
- [MCP SDK](https://modelcontextprotocol.io/docs/sdk)

## Current status

This repository already contains:

- a working TypeScript monorepo layout
- tested xAI REST client, core service, CLI dispatch, and MCP handlers
- a publishable CLI packaging path for npm
- bilingual setup docs for supported clients
- community health files and release workflow scaffolding
