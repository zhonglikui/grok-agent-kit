# grok-agent-kit CLI Interactive Chat Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Interactive chat mode for the CLI

## Goal

Add a persistent REPL-style interactive mode to `grok-agent-kit chat` so developers can hold multi-turn Grok conversations directly in the terminal without repeatedly re-running one-shot commands.

This slice should unify several already-shipped foundations:

- streaming chat output
- named local sessions
- local image input
- local-first session persistence

## Why this slice next

Gemini recommended an interactive chat mode because it turns the CLI from a set of useful single-shot commands into a real daily-driver terminal interface.

This is especially valuable now that the product already supports:

- named sessions
- vision input
- MCP parity for search and chat

The missing piece is a direct human-facing conversational loop.

## Product behavior

### Entry point

Add `--interactive` with alias `-i` to `grok-agent-kit chat`.

When enabled:

- start a persistent terminal prompt
- accept one prompt per line
- stream Grok’s response in real time
- continue until the user exits explicitly

### Session behavior

Without `--session`:

- maintain conversation continuity in memory for the current REPL run
- keep local command-history persistence for future REPL launches

With `--session <name>`:

- load the named local session before the loop starts
- persist every turn back to the same local session
- allow chat sessions started in one-shot mode to continue in interactive mode and vice versa

### Slash commands

Support these control commands inside the REPL:

- `/image <path>` queues a local PNG or JPEG file for the next user turn
- `/reset` clears the active conversation context; if a named session is active, delete it from the local session store first
- `/exit` closes the loop cleanly

Queued images apply only to the next normal prompt, then clear automatically.

### Local command history

Persist a terminal prompt history file so up-arrow recall works across REPL launches.

This history is distinct from chat session transcripts:

- prompt history is for terminal UX recall
- session transcripts remain the source of conversational state

## Architecture

### New CLI runtime helper

Create a dedicated interactive-chat runner instead of embedding the full REPL loop into `commands/chat.ts`.

Responsibilities:

- initialize the interactive console
- load prompt-history entries
- interpret slash commands
- send each normal turn through the same chat-turn logic used by one-shot mode
- persist prompt-history entries after each submitted user turn

### Shared chat-turn helper

Refactor the chat command’s per-turn send logic into a reusable helper so one-shot and interactive chat stay behaviorally aligned.

This helper should decide:

- whether to use `previousResponseId`
- whether to replay locally because of image turns
- how to update in-memory or named-session state after a response

### Console abstraction

Add a small injected interactive-console interface for testing instead of coupling tests directly to Node’s readline implementation.

Production mode can still use Node’s `readline`, but tests should drive the loop through a deterministic mock console.

## Error handling

Interactive mode should fail fast for invalid startup combinations that do not make sense in a REPL, such as:

- `--interactive` with `--no-store`
- `--interactive` with one-shot prompt input sources if the implementation chooses to keep startup behavior simple

Inside the loop:

- invalid slash command usage should print a short guidance message and continue
- image validation errors should report the local file problem and keep the loop alive

## Non-goals

- interactive REPL mode for `x-search` or `web-search`
- advanced TUI features like panes, scrolling widgets, or colored layouts
- multiline editor behavior
- shell-like command completion

## Testing strategy

- add CLI tests for launching interactive mode through the real command parser
- add tests for named-session resume and persistence across turns
- add tests for prompt-history loading and append behavior
- add tests for `/image`, `/reset`, and `/exit`

## Documentation

Update:

- root README in English and Simplified Chinese
- client docs only if interactive mode meaningfully changes the recommended local workflow

Show examples for:

- plain `chat --interactive`
- `chat --interactive --session <name>`
- `/image`, `/reset`, `/exit`
