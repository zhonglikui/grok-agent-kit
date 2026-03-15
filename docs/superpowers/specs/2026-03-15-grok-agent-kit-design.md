# grok-agent-kit Design

**Date:** 2026-03-15  
**Project:** `grok-agent-kit`  
**Subtitle:** CLI + MCP + skills for xAI Grok

## Goal

Build a TypeScript-first toolkit that exposes xAI Grok capabilities through three delivery surfaces:

- a local CLI for direct human use
- a local MCP server for coding agents
- reusable skill artifacts and client examples for `Codex`, `Claude Code`, and `OpenClaw`

The first release should prioritize installability, clear packaging, and low-friction community adoption over breadth of features.

## Product Surface

### CLI

The npm package `grok-agent-kit` exposes these commands:

- `grok-agent-kit chat`
- `grok-agent-kit x-search`
- `grok-agent-kit web-search`
- `grok-agent-kit models`
- `grok-agent-kit mcp`

### MCP

The stdio MCP server exposes these tools:

- `grok_chat`
- `grok_x_search`
- `grok_web_search`
- `grok_models`

### Skills

The repository ships:

- shared skill guidance for search-heavy Grok usage
- Claude Code skill assets
- OpenClaw skill assets
- Codex-oriented setup guidance and config examples

## Architecture

The project uses a monorepo with one public app package and several focused internal packages:

- `apps/cli`: public npm entrypoint and command orchestration
- `packages/xai-client`: direct xAI REST client
- `packages/core`: business-level operations shared by CLI and MCP
- `packages/mcp-server`: MCP server bootstrap and tool registration
- `packages/skill-utils`: templates and helper utilities for generated or synchronized skill assets

This keeps transport-specific behavior out of the domain layer and allows CLI and MCP to share the same request construction, defaults, and result shaping.

## API Strategy

`grok-agent-kit` targets the xAI inference REST API at `https://api.x.ai/v1`.

Primary official references used for the design:

- xAI inference REST base URL: `https://docs.x.ai/developers/rest-api-reference/inference`
- xAI quickstart and Responses examples: `https://docs.x.ai/developers/quickstart`
- xAI Web Search tool: `https://docs.x.ai/developers/tools/web-search`
- xAI X Search tool: `https://docs.x.ai/developers/tools/x-search`
- xAI models endpoints: `https://docs.x.ai/developers/rest-api-reference/inference/models`
- xAI citations behavior: `https://docs.x.ai/developers/tools/citations`
- MCP SDK overview: `https://modelcontextprotocol.io/docs/sdk`

Instead of depending on a higher-level xAI SDK for `v1`, the project will call the REST API directly using `fetch`. This keeps the runtime light, reduces dependency surface, and makes it easy to pass through new API fields when xAI adds them.

## Feature Scope for v1

### Included

- text chat through `/responses`
- X Search tool usage through `/responses` with `type: "x_search"`
- Web Search tool usage through `/responses` with `type: "web_search"`
- model listing through `/models`
- citations returned in CLI JSON mode and MCP structured output
- configurable `apiKey`, `baseUrl`, and default `model`
- `stdio` MCP transport for local agent clients

### Deferred

- hosted remote MCP
- OAuth or browser-based login
- image/video generation
- streaming output in CLI
- retries with advanced backoff policies
- conversation persistence across CLI invocations

## Defaults and Configuration

The toolkit reads configuration from environment variables:

- `XAI_API_KEY` (required)
- `XAI_BASE_URL` (optional, default `https://api.x.ai/v1`)
- `GROK_AGENT_KIT_MODEL` (optional, default `grok-4`)
- `GROK_AGENT_KIT_TIMEOUT_MS` (optional)

CLI flags can override defaults per invocation.

## Data Flow

1. CLI or MCP receives a user request.
2. Input is validated with Zod.
3. `packages/core` maps the request into a responses/models API payload.
4. `packages/xai-client` performs the HTTP request to xAI.
5. The raw response is normalized into:
   - text output
   - citations
   - model metadata
   - raw payload when requested
6. CLI prints human-readable or JSON output; MCP returns both `content` and `structuredContent`.

## Error Handling

Errors are grouped into:

- configuration errors: missing API key, invalid base URL, conflicting filters
- transport errors: non-2xx HTTP responses, timeouts, invalid JSON
- usage errors: invalid combinations such as `allowed_domains` with `excluded_domains`, or `allowed_x_handles` with `excluded_x_handles`

CLI should print concise human messages by default and full structured errors in `--json` mode. MCP tools should return `isError: true` with structured error details.

## Testing Strategy

The project follows TDD for implementation code:

- unit tests for payload builders and result normalization
- unit tests for CLI command dispatch
- unit tests for MCP tool handlers
- no live xAI integration test in `v1`; use mocked fetch and deterministic fixtures

## Repository Layout

```text
grok-agent-kit/
  apps/
    cli/
  packages/
    core/
    mcp-server/
    skill-utils/
    xai-client/
  skills/
    shared/
    claude-code/
    codex/
    openclaw/
  examples/
    clients/
  docs/
    architecture/
    clients/
    superpowers/
      specs/
      plans/
```

## Packaging and Distribution

- publish the CLI package as `grok-agent-kit`
- the CLI binary name is also `grok-agent-kit`
- the MCP server is started through `grok-agent-kit mcp`
- examples are provided for `Codex`, `Claude Code`, and `OpenClaw`
- community release docs should present install snippets first, internal architecture second

## Release Positioning

The repository should describe itself as:

> Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

That keeps the branding strong while avoiding confusion with an official xAI release.
