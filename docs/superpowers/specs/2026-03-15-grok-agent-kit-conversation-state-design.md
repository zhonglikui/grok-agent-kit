# grok-agent-kit Conversation State Design

**Date:** 2026-03-15  
**Project:** `grok-agent-kit`  
**Feature:** Local conversation persistence and response chaining

## Goal

Add a local-first way to continue Grok conversations across CLI invocations and MCP tool calls without requiring any self-hosted server.

The design uses xAI Responses API stateful conversation support via `previous_response_id` and pairs it with a lightweight local session store for named CLI sessions.

## Why this feature next

`grok-agent-kit` already supports one-shot local CLI and MCP usage. The biggest missing local-first workflow is continuity:

- users lose chat state between CLI invocations
- agents cannot explicitly continue an earlier response chain through MCP
- there is no local session abstraction for repeat usage

This feature improves day-to-day usefulness for Codex, Claude Code, and OpenClaw users without introducing any hosted backend.

## Official references

This design is based on xAI’s official Responses API docs:

- the Responses API supports optional stateful interactions and keeps responses for 30 days
- a follow-up request can continue a conversation by sending `previous_response_id`
- the `store` flag controls whether a response should be stored for later retrieval

References used:

- [Generate Text](https://docs.x.ai/developers/model-capabilities/text/generate-text)
- [Inference API Chat Reference](https://docs.x.ai/developers/rest-api-reference/inference/chat)

## Product surface

### CLI

Enhance `grok-agent-kit chat` with:

- `--session <name>` to continue or create a named local session
- `--reset-session` to clear an existing local session before sending the new prompt
- `--previous-response-id <id>` to continue a conversation without using a named local session
- `--no-store` to opt out of xAI server-side response storage when not using session continuation

Add a new command:

- `grok-agent-kit sessions`

Subcommands:

- `grok-agent-kit sessions list`
- `grok-agent-kit sessions delete <name>`

### MCP

Enhance `grok_chat`, `grok_x_search`, and `grok_web_search` with optional:

- `previousResponseId`
- `store`

This allows external agents to chain state themselves even when they do not use the CLI session store.

## Architecture

### Shared domain layer

`packages/core` gains transport-level fields that are valid across chat and search requests:

- `previousResponseId?: string`
- `store?: boolean`

`GrokService` passes them through to the xAI Responses API request body and returns the resulting `responseId`.

### CLI-only session storage

Local session persistence belongs in `apps/cli`, not in shared domain packages, because:

- it is a local UX concern, not an xAI API concern
- MCP clients may want to manage their own state externally
- it should not complicate the core service interface more than necessary

A small file-backed session store will live under the user home directory:

- base directory: `~/.grok-agent-kit/`
- file: `sessions.json`

Stored data per session:

- session name
- latest response ID
- last updated timestamp

### Command flow

For `chat --session <name>`:

1. load the session store
2. optionally clear state if `--reset-session` is present
3. if the session exists, pass its saved response ID as `previousResponseId`
4. force `store: true` because continuation depends on server-side stored responses
5. save the returned `responseId` back into the session store

For `chat --previous-response-id <id>`:

- pass `previousResponseId: id`
- do not modify local session store unless `--session` is also set

## Error handling

The CLI should reject invalid combinations:

- `--session` with `--no-store`
- `--previous-response-id` with `--reset-session` but no `--session`

If a session exists but has no valid response ID, treat it as a fresh conversation.

## Testing strategy

Follow TDD:

- service tests for `previous_response_id`, `store`, and `responseId`
- CLI tests for session-aware chat dispatch
- session store unit tests for list/save/delete behavior
- MCP tool handler tests for passing through stateful fields and returning `responseId`

## Non-goals for this slice

- full local transcript storage
- session branching and history browsing
- automatic retrieval of old response content
- search-specific named session UX in the CLI

Those can be layered on later if the local-first workflow proves valuable.
