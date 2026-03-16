# grok-agent-kit Session Search and MCP Session Parity Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Local session search plus MCP session management parity

## Goal

Make local Grok sessions easier to discover and manage across both CLI and MCP clients.

This slice should improve two user stories:

- CLI power users need to filter large local session histories quickly
- MCP clients need basic access to the same local session store so agents can inspect, resume, and clean up sessions without dropping to the shell

## Why this slice next

Gemini recommended session search and MCP management parity because local sessions have become a meaningful product feature after history persistence, export, richer metadata, and prompt-file workflows shipped.

Right now, session management is CLI-centric. Adding lightweight MCP parity makes the local knowledge base reusable inside Codex, Claude Code, and OpenClaw.

## Architecture

Move the file-backed session store implementation into `@grok-agent-kit/core` so both CLI and MCP packages can use the same local session model.

Keep the surface area small:

- shared file-backed session store and types in core
- CLI list filtering built on top of the same `list()` output
- MCP session tools that read and mutate the same store
- local named-session continuation for `grok_chat` in MCP only for this slice

## Product surface

### CLI

Enhance `sessions list` with:

- `--search <pattern>` to filter by session name or transcript content
- `--model <model>` to filter sessions by any matching recorded model in their history
- `--limit <number>` to cap the number of displayed sessions after filtering

Search semantics:

- treat `--search` as a JavaScript regular expression pattern
- compile with case-insensitive matching
- if the pattern is invalid, fail fast with a clear error

### MCP

Add tools:

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

Add `session?: string` to `grok_chat` so MCP clients can opt into the same local named-session auto-resume behavior as the CLI.

Behavior rules for MCP `grok_chat` session mode:

- if `session` is set and `previousResponseId` is omitted, load the stored response id from the named session
- if `session` is set and `store === false`, reject the request because continuation depends on persisted xAI responses
- after a successful response, write the updated session record with full history metadata

## Non-goals

- moving CLI transcript formatting into core
- MCP session support for `grok_x_search` and `grok_web_search` in this slice
- full-text indexing or fuzzy search libraries
- remote or multi-user session synchronization

## Testing strategy

- keep current session-store tests green through the core re-export path
- add CLI tests for list filtering by regex, model, and limit
- add MCP tool-handler tests for list/get/delete session tools
- add MCP chat tests for named-session resume and persistence

## Documentation

Update:

- root README for CLI session filtering examples
- client docs index for MCP local session parity note
- Codex and Claude Code setup docs with a short note that local session tools are available over MCP
