# grok-agent-kit MCP Search Streaming Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** MCP X Search and Web Search streaming via progress notifications

## Goal

Add minimal streaming support for MCP `grok_x_search` and `grok_web_search` so compatible clients can receive progress updates while search requests are still running.

This slice keeps the existing local-first and MCP-friendly design:

- no hosted backend
- keep final MCP tool result structure unchanged
- reuse MCP `notifications/progress`
- reuse the already-shipped xAI streaming callback path in core

## Why this slice next

Gemini recommended MCP search streaming as the next delivery round because search is one of the most distinctive Grok capabilities and also one of the longest-running tool paths.

CLI search streaming already exists, but MCP clients like Codex, Claude Code, and OpenClaw still wait for the final response. Extending progress notifications to search closes that UX gap without changing the core public API shape.

## Protocol approach

For both search tools:

1. add `stream?: boolean` to the MCP tool input schema
2. check for `_meta.progressToken` on the incoming request
3. when both `stream: true` and a progress token are present, forward each text delta as `notifications/progress`
4. still return the normal final tool result with full text, citations, response ID, model, and optional raw payload

This mirrors the already-shipped `grok_chat` streaming behavior so MCP clients only need one integration pattern.

## Product surface

Affected MCP tools:

- `grok_x_search`
- `grok_web_search`

Client behavior:

- clients opt in by setting `stream: true`
- clients that include a progress token can render incremental search output from `params.message`
- clients without progress token support continue to get the existing non-streaming final result

## Non-goals

- custom MCP notification event types
- replacing final tool responses with streaming-only output
- hosted auth or server-side session coordination
- new search parameters beyond streaming opt-in

## Testing strategy

- add failing MCP tool-handler tests for streamed X Search notifications
- add failing MCP tool-handler tests for streamed Web Search notifications
- assert that `previousResponseId` and other existing search inputs still reach the service while streaming is enabled
- keep existing MCP chat streaming and error-wrapping tests green
