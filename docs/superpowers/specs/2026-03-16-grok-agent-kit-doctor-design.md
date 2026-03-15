# grok-agent-kit Doctor Command Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** CLI doctor command

## Goal

Add a local-first `doctor` command that helps users quickly diagnose common setup problems before they try chat, search, or MCP flows.

This slice should stay lightweight:

- no network calls
- no server dependency
- no requirement to have saved sessions already

## Why this slice next

Gemini recommended `doctor` because the product now has enough surface area that setup friction matters more.

A good first-run diagnostic improves adoption for Codex, Claude Code, and OpenClaw users by answering the basic question: “Is my local environment configured correctly?”

## Product surface

Add a new command:

```bash
grok-agent-kit doctor
```

The MVP should check:

- Node.js major version is supported (`>=20`)
- `XAI_API_KEY` is present and non-empty
- `XAI_BASE_URL` is either absent (default) or a valid absolute URL
- `GROK_AGENT_KIT_MODEL` is either absent (default) or non-empty
- the local state directory `~/.grok-agent-kit` is readable or can be created later
- `sessions.json` is either absent (acceptable for first run) or readable valid JSON

## Output design

Print simple diagnostic lines using three statuses:

- `PASS`
- `WARN`
- `FAIL`

At the end, print a short summary with failure and warning counts.

Warnings should not prevent normal usage. Failures indicate configuration that should be fixed first.

## Non-goals

- live xAI API requests
- MCP client-specific config validation
- automatic repair actions
- Windows/Linux/macOS shell-specific export commands in this slice

## Testing strategy

- CLI test for missing `XAI_API_KEY`
- CLI test for a healthy configuration using stubbed env values
- keep the rest of the CLI suite green
