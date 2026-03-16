# grok-agent-kit Prompt File, STDIN, and Doctor Connectivity Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Prompt-file workflows, STDIN piping, and doctor API connectivity

## Goal

Make the CLI friendlier for real shell workflows by allowing prompts to come from files and pipes, while strengthening `doctor` so it can verify actual xAI connectivity.

This slice stays local-first:

- no hosted backend
- still uses direct xAI APIs
- works in normal shell pipelines on the user's machine

## Why this slice next

Gemini recommended this slice because the current CLI is already useful for short prompts, but power users often need to pass large context files, logs, or generated shell output into Grok.

Adding prompt-file and STDIN support makes the CLI much more composable, and pairing it with a live API connectivity check makes troubleshooting much clearer when those new workflows fail.

## Product surface

New CLI input options:

- `chat --prompt-file <path>`
- `chat --system-file <path>`
- `x-search --prompt-file <path>`
- `web-search --prompt-file <path>`

STDIN behavior:

- if stdin is piped, append it to the resolved prompt input
- allow stdin-only usage when no `--prompt` or `--prompt-file` is supplied
- reject `--prompt` + `--prompt-file` together for the same command
- reject `--system` + `--system-file` together for chat

Prompt persistence:

- session history should store the fully resolved prompt content, not just the original flag value
- this ensures exports and future debugging reflect what was actually sent to xAI

Doctor behavior:

- keep existing local config and filesystem checks
- add a live connectivity check that pings xAI through the existing service layer
- if prerequisites like `XAI_API_KEY` or `XAI_BASE_URL` are invalid, skip the live ping with a warning rather than producing a second misleading failure

## Input resolution rules

Prompt resolution priority:

1. direct `--prompt` text, if provided
2. `--prompt-file` contents, if provided
3. stdin content, if piped

Combination rules:

- `--prompt` and `--prompt-file` are mutually exclusive
- resolved prompt may combine a direct/file prompt with piped stdin using a blank-line separator
- stdin-only input is valid when data is piped and neither prompt flag is present
- empty final prompt should fail fast with a clear error

System resolution rules for chat:

- `--system` and `--system-file` are mutually exclusive
- no stdin merging for system prompts in this slice

## Implementation shape

Add a focused CLI helper that handles:

- reading utf-8 prompt files
- detecting whether stdin is interactive
- reading piped stdin once
- combining prompt sources consistently across chat, X Search, and Web Search

This avoids duplicating parsing and error handling across three command files.

## Testing strategy

- add helper tests for prompt-file, stdin-only, prompt-plus-stdin, and invalid combinations
- add CLI tests that verify resolved prompt text reaches the service and named session history
- add doctor tests for:
  - successful API connectivity
  - failed connectivity
  - skipped connectivity when prerequisites are invalid

## Non-goals

- binary file ingestion
- prompt templating
- recursive directory ingestion
- MCP request schema changes in this slice
