# grok-agent-kit CLI Interactive Search Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Interactive REPL mode for `x-search` and `web-search`

## Goal

Extend the new terminal REPL workflow beyond plain chat so users can keep refining X-search and web-search prompts without re-running one-shot commands.

This should preserve the same local-first guarantees already shipped elsewhere:

- named local sessions
- local prompt-history persistence
- streaming terminal output
- no required backend service

## Why this slice next

The chat REPL now makes human terminal usage much smoother, but search workflows still require repetitive one-shot commands.

For public `v1`, interactive search closes another obvious CLI UX gap:

- investigate live X content over multiple turns
- refine web-grounded research in the terminal
- reuse the same named sessions and local state model across chat and search

## Product behavior

### Entry points

Add `--interactive` with alias `-i` to:

- `grok-agent-kit x-search`
- `grok-agent-kit web-search`

When enabled:

- start a persistent terminal prompt
- stream the search answer in real time
- continue until the user exits explicitly

### Session behavior

Without `--session`:

- maintain continuity in memory for the current REPL run
- still persist prompt-history for terminal UX recall

With `--session <name>`:

- load the named local session at startup
- persist every turn back to that local session
- allow one-shot and interactive search usage to continue the same named session interchangeably

### Slash commands

Support these control commands inside interactive search:

- `/reset` clears the active conversation context and deletes the named local session if one is attached
- `/exit` leaves the REPL cleanly

No `/image` support is needed for search REPLs.

### Filters

Existing one-shot filters continue to apply to every interactive turn:

- `x-search --allow-handle / --exclude-handle`
- `web-search --allow-domain / --exclude-domain`

## Architecture

### Shared search-turn helper

Create a reusable helper for search turns that handles:

- previous-response chaining
- session auto-save
- streaming output callbacks

This keeps one-shot and interactive search behavior aligned.

### Dedicated interactive search runner

Add a small search-specific REPL runner that:

- reuses the injected interactive console abstraction
- reuses the prompt-history store
- interprets `/reset` and `/exit`
- calls the shared search-turn helper for each normal prompt

## Error handling

Interactive search should fail fast for invalid startup combinations:

- `--interactive` with `--no-store`
- `--interactive` with `--json`
- `--interactive` with prompt input flags or piped stdin

Inside the loop:

- unknown slash commands should print a short help message and continue

## Non-goals

- interactive filtering commands inside the REPL
- multiline prompt editing
- a richer TUI
- image input for search modes

## Testing strategy

- add failing CLI tests for `x-search --interactive`
- add failing CLI tests for `web-search --interactive --session <name>`
- verify prompt-history load and append
- verify `/reset` and `/exit`

## Documentation

Update English and Simplified Chinese docs to show:

- `x-search --interactive`
- `web-search --interactive --session <name>`
- `/reset` and `/exit`
