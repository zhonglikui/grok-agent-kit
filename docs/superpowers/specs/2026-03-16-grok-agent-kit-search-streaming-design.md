# grok-agent-kit Search Streaming Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Streaming output for CLI search commands

## Goal

Extend the new CLI streaming path from `chat` to `x-search` and `web-search`.

This slice should remain incremental:

- no server dependency
- reuse the existing xAI SSE support already added for `chat`
- keep current non-streaming behavior unchanged
- preserve local named-session persistence when streaming is used together with `--session`

## Why this slice next

Gemini recommended this immediately after `chat --stream` because it compounds the same local-first UX improvement across the most important search workflows.

This is a strong fit for Codex, Claude Code, and OpenClaw users because search prompts are often exploratory and benefit from faster perceived latency.

## Product surface

Add the same streaming flag to both commands:

```bash
grok-agent-kit x-search --prompt "..." --stream
grok-agent-kit web-search --prompt "..." --stream
```

Behavior:

1. text deltas print to stdout as they arrive
2. citations print after the streamed text completes
3. `--stream` cannot be combined with `--json`
4. when `--session <name>` is used, the final accumulated response still updates local session history

## Implementation approach

The transport and core layers already support streaming through `onTextDelta`.

This slice only needs CLI wiring:

- add `--stream` to `x-search` and `web-search`
- pass `onTextDelta` callbacks into the service call
- reuse `renderStreamResult`
- keep session persistence logic based on the final `result.text`

## Non-goals

- MCP search streaming
- search streaming docs for external clients yet
- refactoring the shared session logic in this slice

## Testing strategy

- CLI test for `x-search --stream` incremental output
- CLI test for `web-search --stream` incremental output
- keep existing search-session tests green
