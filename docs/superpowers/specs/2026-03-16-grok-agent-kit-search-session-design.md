# grok-agent-kit Search Session Continuity Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Named-session continuity for CLI search commands

## Goal

Extend the existing local session workflow from `chat` to `x-search` and `web-search` so users can continue search-oriented workflows across invocations.

This slice should stay local-first:

- no server dependency
- reuse the existing `sessions.json`
- keep `XAI_API_KEY` as the primary auth path

## Why this slice next

Gemini recommended search-session continuity after chat streaming because it compounds the value of the local session system that already exists.

Users working through Codex, Claude Code, and OpenClaw often alternate between search prompts over multiple invocations. Reusing named sessions for search commands gives them:

- response-chain continuity through `previous_response_id`
- local transcript continuity through saved history
- a consistent CLI mental model across chat and search commands

## Product surface

Add the same session controls from `chat` to both commands:

```bash
grok-agent-kit x-search --session research --prompt "..."
grok-agent-kit web-search --session docs --prompt "..."
```

Supported options for both commands:

- `--session <name>`
- `--reset-session`
- `--previous-response-id <id>`
- `--no-store`

Behavior:

1. load a named session when present
2. use its saved response ID unless the user passes `--previous-response-id`
3. store the new response ID after a successful search response
4. append the local transcript entry to session history

## Storage design

Reuse the existing session record shape unchanged.

Each search invocation appends the same history fields already used by `chat`:

- prompt
- responseText
- responseId
- createdAt

This keeps the slice incremental and compatible with earlier session files.

## Error handling

Mirror the `chat` command rules:

- `--session` cannot be combined with `--no-store`
- `--reset-session` requires `--session`

## Non-goals

- separate history schemas for chat vs search
- per-command session namespaces
- search streaming in this slice
- MCP search-session behavior changes

## Testing strategy

- CLI test for `x-search --session` continuing from stored response IDs
- CLI test for `web-search --session` continuing from stored response IDs
- CLI test coverage that history entries are appended for both search commands
