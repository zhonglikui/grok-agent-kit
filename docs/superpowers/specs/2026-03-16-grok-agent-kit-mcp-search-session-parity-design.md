# grok-agent-kit MCP Search Session Parity Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Named local session parity for MCP X Search and Web Search

## Goal

Bring `grok_x_search` and `grok_web_search` up to the same named-session behavior already available in:

- CLI `x-search --session`
- CLI `web-search --session`
- MCP `grok_chat` with `session`

This slice should let MCP clients run multi-turn search investigations without manually threading `previousResponseId`.

## Why this slice next

Gemini recommended MCP search session parity because it closes one of the last obvious product gaps between CLI and MCP for the core Grok workflows.

Agent users in Codex, Claude Code, and OpenClaw often need iterative search loops. Right now they must track `previousResponseId` themselves for search tools, even though chat already supports named local sessions.

## Product behavior

### MCP `grok_x_search`

Add:

- `session?: string`
- `resetSession?: boolean`

Behavior rules:

- if `session` is set and `previousResponseId` is omitted, load the last response id from the local named session
- if `resetSession` is true, delete the named session before the request runs
- if `session` is set and `store === false`, reject the request because xAI continuation depends on persisted responses for search tools
- after success, append the search turn to the local session history

### MCP `grok_web_search`

Match the same rules and field names as `grok_x_search`.

### Shared sessions across tools

All tools continue to use the same local file-backed session store. That means:

- search sessions appear in `grok_list_sessions`
- `grok_get_session` shows the search transcript and citations
- `grok_chat` can continue a named session last updated by a search tool

## Architecture

Reuse the existing shared `SessionStore` in `@grok-agent-kit/core`.

Avoid introducing a second search-specific session format. Search turns should keep using the existing `createSessionHistoryEntry()` helper so that:

- citations
- usage metadata
- response ids

remain consistent with chat history entries.

Inside the MCP server, prefer a small shared helper for session-aware text tools so `grok_chat`, `grok_x_search`, and `grok_web_search` do not drift further apart.

## Non-goals

- adding image or multimodal support to search tools
- recording unnamed MCP search sessions automatically
- changing CLI search-session behavior
- adding new MCP tools for exporting sessions

## Testing strategy

- add MCP tests for `grok_x_search` named-session resume and persistence
- add MCP tests for `grok_web_search` named-session resume and persistence
- add MCP tests for `resetSession`
- keep existing chat session tests green to ensure shared logic does not regress

## Documentation

Update:

- root README in English and Simplified Chinese
- client docs index in both languages
- Codex, Claude Code, and OpenClaw setup docs

Document that MCP search tools now accept `session` and `resetSession`, and that they share the same local session archive as `grok_chat`.
