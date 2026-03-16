# grok-agent-kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

`grok-agent-kit` packages the same Grok-powered capability surface for three audiences:

- humans using a local CLI
- coding agents using MCP
- teams sharing search guidance through reusable skills

## What it ships

- `grok-agent-kit chat`
- `grok-agent-kit auth`
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
- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

## Requirements

- Node.js `20+`
- an `XAI_API_KEY`

## Environment

Set these variables before running the CLI or MCP server:

```bash
XAI_API_KEY=your_key_here
XAI_BASE_URL=https://api.x.ai/v1
XAI_MANAGEMENT_API_KEY=your_management_key_here
XAI_MANAGEMENT_BASE_URL=https://management-api.x.ai
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
npx -y grok-agent-kit auth status
npx -y grok-agent-kit auth validate-management
npx -y grok-agent-kit auth list-api-keys --team team_123
npx -y grok-agent-kit auth create-api-key --team team_123 --name "Codex local key"
npx -y grok-agent-kit doctor
npx -y grok-agent-kit chat --prompt "Stream a quick summary" --stream
npx -y grok-agent-kit chat --prompt-file ./context.txt
npx -y grok-agent-kit chat --prompt "Describe this screenshot" --image ./screen.png
npx -y grok-agent-kit chat --prompt "Analyze these logs:" < ./logs.txt
npx -y grok-agent-kit chat --interactive
npx -y grok-agent-kit chat --interactive --session research
npx -y grok-agent-kit chat --session research --prompt "Summarize the latest Grok updates"
npx -y grok-agent-kit chat --session research --prompt "Turn that into a release note draft"
npx -y grok-agent-kit chat --session vision --prompt "Describe this screenshot" --image ./screen.png
npx -y grok-agent-kit chat --session vision --prompt "What changed after that?"
npx -y grok-agent-kit sessions show research
npx -y grok-agent-kit sessions export research --format markdown
npx -y grok-agent-kit x-search --prompt "Latest xAI posts" --stream
npx -y grok-agent-kit web-search --prompt "Latest xAI docs" --stream
npx -y grok-agent-kit x-search --interactive --allow-handle xai
npx -y grok-agent-kit web-search --interactive --session research --allow-domain docs.x.ai
npx -y grok-agent-kit x-search --session research --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --session research --prompt "Latest xAI docs"
npx -y grok-agent-kit sessions list
npx -y grok-agent-kit sessions list --search "auth|login" --model grok-4 --limit 5
npx -y grok-agent-kit models
npx -y grok-agent-kit mcp
```

For local development:

```bash
npm install
npm test
npm run build
node apps/cli/dist/bin.js doctor
node apps/cli/dist/bin.js auth status
node apps/cli/dist/bin.js auth validate-management
node apps/cli/dist/bin.js auth list-api-keys --team team_123
node apps/cli/dist/bin.js auth create-api-key --team team_123 --name "Codex local key"
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js chat --prompt "Stream a local reply" --stream
node apps/cli/dist/bin.js chat --prompt-file ./context.txt
node apps/cli/dist/bin.js chat --prompt "Describe this screenshot" --image ./screen.png
Get-Content ./logs.txt | node apps/cli/dist/bin.js chat --prompt "Analyze these logs:"
node apps/cli/dist/bin.js chat --interactive
node apps/cli/dist/bin.js chat --interactive --session demo
node apps/cli/dist/bin.js chat --session demo --prompt "Start a local-first conversation"
node apps/cli/dist/bin.js chat --session vision --prompt "Describe this screenshot" --image ./screen.png
node apps/cli/dist/bin.js chat --session vision --prompt "What changed after that?"
node apps/cli/dist/bin.js sessions show demo
node apps/cli/dist/bin.js sessions export demo --format markdown --output ./demo-session.md
node apps/cli/dist/bin.js x-search --prompt "Find recent xAI posts" --stream
node apps/cli/dist/bin.js web-search --prompt "Find updated xAI docs" --stream
node apps/cli/dist/bin.js x-search --interactive --allow-handle xai
node apps/cli/dist/bin.js web-search --interactive --session demo --allow-domain docs.x.ai
node apps/cli/dist/bin.js x-search --session demo --prompt "Find recent xAI posts"
node apps/cli/dist/bin.js web-search --session demo --prompt "Find updated xAI docs"
node apps/cli/dist/bin.js sessions list
node apps/cli/dist/bin.js sessions list --search "release|launch" --model grok-4 --limit 3
node apps/cli/dist/bin.js mcp
```

## Conversation continuity

`grok-agent-kit` now supports local conversation persistence for the CLI and explicit response chaining for MCP clients.

- Use `chat --session <name>` to continue a named local session across invocations.
- Use `chat --interactive` or `chat -i` for a local REPL that streams each reply turn by turn.
- Use `chat --interactive --session <name>` to resume and auto-save the same named local session from a terminal REPL.
- Use `chat --reset-session --session <name>` to start that named session over.
- Use `chat --image <path>` one or more times to attach local PNG or JPEG files.
- Inside interactive chat, use `/image <path>` to queue a local PNG or JPEG for the next user message only.
- Inside interactive chat, use `/reset` to clear the active conversation and delete the named local session when one is attached.
- Inside interactive chat, use `/exit` to leave the REPL cleanly.
- Use `chat --stream` to print chat text incrementally as xAI sends deltas.
- Use `x-search --stream` and `web-search --stream` to stream search text incrementally.
- Use `x-search --interactive` and `web-search --interactive` for live search REPL loops in the terminal.
- Use `/reset` and `/exit` inside interactive search to clear the active search context or leave the REPL.
- Use `x-search --session <name>` and `web-search --session <name>` to continue search workflows in the same named session.
- Use `sessions show <name>` to print the saved local transcript for that named session, including models and token totals when available.
- Use `sessions list --search <pattern> --model <model> --limit <n>` to filter larger local session archives.
- Use `sessions delete <name>` to remove local session metadata.
- Use `sessions export <name> --format markdown|json` to export a saved session for sharing, backup, or downstream tooling.
- MCP clients can pass `previousResponseId` and `store` to `grok_chat`, `grok_x_search`, and `grok_web_search` when they want explicit continuity.
- MCP clients can pass `images: ["/absolute/path/to/screenshot.png"]` to `grok_chat` for local multimodal analysis.
- MCP clients can also use `grok_list_sessions`, `grok_get_session`, and `grok_delete_session` for local session management.
- MCP clients can pass `session` to `grok_chat` for CLI-style named local session continuation.
- MCP clients can also pass `session` and `resetSession` to `grok_x_search` and `grok_web_search` for CLI-style named search continuity.
- Image-backed named sessions replay from the local session archive with `store: false` instead of depending on server-side response history.
- MCP clients can pass `stream: true` to `grok_chat`, `grok_x_search`, and `grok_web_search`, then request MCP progress notifications to receive text deltas in `notifications/progress.params.message`.

## Exporting sessions

- `sessions export <name> --format markdown` prints a human-friendly research transcript with timestamps, models, citations, and usage summaries.
- `sessions export <name> --format json` prints normalized session JSON for backups or programmatic reuse.
- Add `--output <path>` to write the export directly to a file.

## Piping and file workflows

- Use `--prompt-file <path>` with `chat`, `x-search`, and `web-search` to load a prompt from a UTF-8 text file.
- Use `--image <path>` with `chat` to attach local PNG or JPEG files alongside the text prompt.
- Use `--system-file <path>` with `chat` for reusable long-form system prompts.
- Pipe stdin into any prompt command; piped content is appended after `--prompt` / `--prompt-file` with a blank line separator.
- Stdin-only usage also works when you omit `--prompt` entirely and pipe the full prompt content in.
- Interactive chat requires a TTY and does not combine with `--prompt`, `--prompt-file`, or piped stdin.
- Interactive `x-search` and `web-search` also require a TTY and do not combine with prompt flags, piped stdin, `--json`, or `--no-store`.

## Diagnostics

Use `grok-agent-kit doctor` to validate the local setup before using chat, search, or MCP.

It currently checks:

- supported Node.js version
- `XAI_API_KEY` presence
- `XAI_BASE_URL` validity
- `XAI_MANAGEMENT_API_KEY` presence
- `XAI_MANAGEMENT_BASE_URL` validity
- `GROK_AGENT_KIT_MODEL` fallback or value
- live xAI API connectivity through the models endpoint when local prerequisites are valid
- live xAI management API connectivity through management-key validation when local prerequisites are valid
- local state directory and `sessions.json` readability

## Auth management

- Use `grok-agent-kit auth status` to see which local auth paths are configured.
- Use `grok-agent-kit auth validate-management` to validate `XAI_MANAGEMENT_API_KEY` against the xAI management API.
- Use `grok-agent-kit auth list-api-keys --team <teamId>` to inspect team API keys.
- Use `grok-agent-kit auth create-api-key --team <teamId> --name <name>` to mint a team API key locally without adding any backend service.
- `XAI_API_KEY` remains the default runtime auth for chat, search, and MCP inference traffic.
- `XAI_MANAGEMENT_API_KEY` is optional and only used for management API operations.
- Browser auth is not part of the current local CLI/MCP flow; use xAI API keys instead.

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
