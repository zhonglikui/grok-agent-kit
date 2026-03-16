# grok-agent-kit Session Export and Metadata Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Local session export and richer history metadata

## Goal

Turn local session history from a minimal transcript cache into a portable research artifact.

This slice adds two user-visible capabilities:

- richer per-turn metadata in local session history
- export commands that turn saved sessions into Markdown or JSON files

The design remains local-first:

- no hosted backend
- still keyed primarily by `XAI_API_KEY`
- no new online dependency for export or session inspection

## Why this slice next

Gemini recommended transcript export and richer metadata because the project already supports local session continuity across chat, X Search, and Web Search.

Users can already accumulate useful research sessions, but they cannot yet easily preserve, share, or post-process those sessions. Export closes that gap and makes the existing session feature materially more valuable.

## Product surface

CLI additions:

- `grok-agent-kit sessions export <name> --format markdown`
- `grok-agent-kit sessions export <name> --format json`
- optional `--output <path>` for writing to a file instead of stdout

CLI improvements:

- `sessions show <name>` should include per-entry model information when available
- `sessions show <name>` should print session summary metadata such as entry count and total token count when available

Persistence improvements:

- store `model`, `citations`, and `usage` on each session history entry
- keep backward compatibility with older `sessions.json` files that only contain the old shape

## Data model

Introduce a normalized usage type shared between core and CLI history persistence.

Per-turn session history entry should store:

- `prompt`
- `responseText`
- `responseId?`
- `createdAt`
- `model?`
- `citations`
- `usage?`

`usage` should be conservative and portable, focusing on fields that xAI documents as response usage metrics:

- `promptTokens?`
- `completionTokens?`
- `totalTokens?`
- `reasoningTokens?`
- `cachedTokens?`
- `numSourcesUsed?`
- `costInUsdTicks?`

Unknown or currently-unused nested details should not be persisted wholesale into the history file. That keeps `sessions.json` compact and stable.

## Core integration

`packages/xai-client` should expose typed usage fields from the xAI response.

`packages/core` should map xAI response usage into the normalized `GrokTextUsage` type and surface it on `GrokTextResult` for chat, X Search, and Web Search equally.

This preserves one metadata path for both CLI printing and future MCP/tooling extensions.

## Export behavior

### Markdown export

Markdown export should be human-friendly and ready to paste into notes, docs, or issue trackers.

Recommended structure:

1. title with session name
2. metadata block with updated timestamp, last response id, number of turns, models used, total token count when available
3. one section per turn including:
   - timestamp
   - model if present
   - prompt
   - response
   - citations list when present
   - usage summary when present

The output should favor readability over raw completeness.

### JSON export

JSON export should preserve the normalized session structure for backups or downstream tooling.

It should emit the same in-memory `SessionRecord` shape after backward-compatible normalization.

## Backward compatibility

Older session files without metadata must still load correctly.

On read:

- missing `history` becomes `[]`
- missing `citations` becomes `[]`
- missing `model` / `usage` remains absent

On write:

- new sessions and updated sessions should use the richer schema

## Testing strategy

- add core tests proving usage is mapped from xAI responses
- add session-store tests proving older session files still normalize successfully
- add CLI tests for:
  - storing metadata in named sessions
  - `sessions show` summary output
  - `sessions export <name> --format markdown`
  - `sessions export <name> --format json`
  - not-found handling for export

## Non-goals

- remote sync of session history
- browser-based export UI
- PDF/docx export
- changing MCP tool result shapes in this slice
