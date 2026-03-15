# grok-agent-kit

Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

`grok-agent-kit` packages the same Grok-powered capability surface for three audiences:

- humans using a local CLI
- coding agents using MCP
- teams sharing search guidance through skills and client docs

## What it ships

- `grok-agent-kit chat`
- `grok-agent-kit x-search`
- `grok-agent-kit web-search`
- `grok-agent-kit models`
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
```

`XAI_BASE_URL` is optional and defaults to the official xAI inference base URL.

## Local development

```bash
npm install
npm run test
npm run build
```

Then run the built CLI:

```bash
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js x-search --prompt "Latest xAI posts"
node apps/cli/dist/bin.js web-search --prompt "Latest xAI docs"
node apps/cli/dist/bin.js models
node apps/cli/dist/bin.js mcp
```

## Planned published usage

After publishing to npm, the intended install path is:

```bash
npx grok-agent-kit chat --prompt "Hello"
npx grok-agent-kit x-search --prompt "Latest xAI posts"
npx grok-agent-kit web-search --prompt "Latest xAI docs"
npx grok-agent-kit mcp
```

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

## Client docs

- `D:/work/typescript/grok-agent-kit/docs/clients/codex.md`
- `D:/work/typescript/grok-agent-kit/docs/clients/claude-code.md`
- `D:/work/typescript/grok-agent-kit/docs/clients/openclaw.md`

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
- client docs and skill assets for the first release structure
