# grok-agent-kit CLI Streaming Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Minimal CLI chat streaming

## Goal

Add a minimal, local-first streaming path for the CLI `chat` command so users can see response text as it arrives instead of waiting for the full response.

This slice should remain incremental:

- no server dependency
- no browser dependency
- no MCP protocol changes yet
- no breaking change to current non-streaming output

## Why this slice next

Gemini recommended streaming as the next milestone because it improves the day-to-day feel of the product for Codex, Claude Code, and OpenClaw users.

The smallest useful step is CLI streaming for `chat`:

- it directly improves interactive terminal usage
- it is easier to verify than cross-surface streaming
- it creates the transport primitives needed for later MCP/search streaming

## Source constraints

Official xAI docs currently state:

- `POST /responses` supports `stream: true`
- streaming uses SSE
- streamed events expose incremental content deltas

That is sufficient for a local CLI-first MVP.

## Product surface

Add a new CLI option:

```bash
grok-agent-kit chat --prompt "..." --stream
```

Behavior:

1. the CLI writes text deltas to stdout as they arrive
2. once streaming completes, it prints citations if present
3. session persistence still stores the final accumulated text and response ID
4. `--json` remains non-streaming for this slice

## API design

Add an optional streaming callback to shared chat options and results plumbing, without changing existing callers.

Suggested shape:

- `onTextDelta?: (chunk: string) => void | Promise<void>` on prompt options

The core service should pass `stream: true` to the xAI client when a delta callback is present.
The xAI client should expose a streaming responses path that:

- sends `Accept: text/event-stream`
- parses SSE lines
- forwards text deltas to the callback
- accumulates the final response object for existing result normalization

## Event handling scope

Keep the parser intentionally narrow for MVP:

- accept `data: ...` SSE messages
- ignore keepalive/blank lines
- stop on `[DONE]`
- read text from `event.delta.content` when present
- treat a completed `response.completed` payload as the final response object when present
- fall back to accumulated text plus final metadata if the terminal event shape is slightly different

## Non-goals

- MCP streaming
- streaming for `x-search` or `web-search`
- verbose reasoning/tool-call streaming
- structured output streaming

## Testing strategy

- xAI client test for SSE parsing and final response reconstruction
- core service test that enables streaming mode when `onTextDelta` is provided
- CLI test for `chat --stream` writing incremental output
- keep existing non-streaming tests green
