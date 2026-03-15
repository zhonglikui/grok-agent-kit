# grok-agent-kit Local History Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Local chat history for named sessions

## Goal

Extend the new local session workflow so named CLI sessions preserve a lightweight local transcript, not just the latest `responseId`.

This should stay fully local-first:

- no self-hosted server
- no database
- no dependency on xAI retrieval APIs

## Why this feature next

The project already supports named sessions and `previous_response_id` continuation, but users still cannot inspect what happened in those local sessions without remembering prior terminal output.

That leaves an obvious local-first gap:

- continuity exists
- observability of the local conversation does not

Adding lightweight local history makes named sessions actually useful for repeated terminal workflows.

## Product surface

### CLI behavior

When a user runs:

```bash
grok-agent-kit chat --session notes --prompt "..."
```

the session record should now append a local history entry containing:

- prompt text
- response text
- response ID when present
- timestamp

Add a new subcommand:

```bash
grok-agent-kit sessions show <name>
```

This prints a readable local transcript for that session.

Optional JSON mode can be added later; this slice only needs a readable text view.

## Storage design

Reuse the existing `sessions.json` file and extend each session record with:

- `history: SessionHistoryEntry[]`

Each history entry contains:

- `prompt`
- `responseText`
- `responseId?`
- `createdAt`

This keeps the implementation incremental and avoids a second local file format.

## Migration behavior

Existing sessions without `history` should still load correctly.

Rules:

- treat missing `history` as `[]`
- do not break `sessions list`
- preserve existing `responseId` continuation behavior

## Command flow

For `chat --session <name>`:

1. load existing session record if present
2. continue with `previousResponseId` as before
3. after a successful response, append a new history entry
4. write back the updated session record

For `sessions show <name>`:

1. load the session record
2. print an error-friendly message if the session does not exist
3. render history entries in chronological order

## Non-goals

- full transcript editing
- transcript export files
- transcript search
- history for anonymous non-session chats

## Testing strategy

- session store tests for persisted history and backward-compatible loading
- CLI tests for `sessions show`
- CLI tests for session chat saving a history entry
