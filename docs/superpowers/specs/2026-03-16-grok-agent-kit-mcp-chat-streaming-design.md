# grok-agent-kit MCP Chat Streaming Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** MCP chat streaming via progress notifications

## Goal

Add a minimal streaming path for the MCP `grok_chat` tool so compatible clients can receive incremental text updates while the tool is still running.

This slice should remain local-first and protocol-compatible:

- no server dependency
- keep the final MCP tool result shape unchanged
- use MCP's existing out-of-band progress notification channel

## Why this slice next

Gemini recommended MCP chat streaming after CLI streaming shipped successfully across chat and search commands.

For Codex, Claude Code, and OpenClaw users, MCP is the shared integration surface. Bringing streaming there makes the product feel more responsive inside agent clients, not just the standalone CLI.

## Protocol approach

The MCP SDK supports request-scoped notifications and the MCP spec defines `notifications/progress` with:

- `progressToken`
- `progress`
- `message`

For this MVP, `grok_chat` will:

1. accept `stream?: boolean`
2. check whether the incoming MCP request includes `_meta.progressToken`
3. if both are present, send each text delta as a `notifications/progress` event using the delta string in `message`
4. still return the normal final tool result with full text and citations

## Product surface

MCP input addition for `grok_chat`:

- `stream?: boolean`

Client behavior:

- clients opt in by setting `stream: true`
- clients that also request progress notifications can render delta chunks from `message`
- clients without a progress token fall back to the existing non-streaming final response behavior

## Non-goals

- MCP streaming for `grok_x_search` or `grok_web_search`
- replacing the final result with a streaming-only protocol
- custom MCP notification types beyond `notifications/progress`

## Testing strategy

- tool-handler test that verifies `grok_chat` forwards deltas through `sendNotification`
- keep existing structured output and error wrapping tests green
