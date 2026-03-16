# grok-agent-kit Client Docs Alignment Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Align client docs and skill guidance with shipped REPL and auth features

## Goal

Bring the client-facing docs and skill guidance up to date with what the product now actually ships.

## Why this slice next

Several product slices have already landed:

- interactive chat REPL
- interactive x-search and web-search REPL
- auth management commands
- management-aware doctor diagnostics

The remaining gap is that client docs and skill guidance still describe an older feature surface.

## Product behavior

This slice does not change runtime code. It changes the user-facing guidance so it consistently documents:

- `XAI_API_KEY` as the required MCP runtime credential
- `XAI_MANAGEMENT_API_KEY` as optional local auth-management support
- `chat --interactive`
- `x-search --interactive`
- `web-search --interactive`
- `session` / `resetSession` guidance for multi-turn MCP workflows

## Documentation scope

Update:

- `docs/clients/README.md`
- `docs/clients/README.zh-CN.md`
- `docs/clients/codex.md`
- `docs/clients/codex.zh-CN.md`
- `docs/clients/claude-code.md`
- `docs/clients/claude-code.zh-CN.md`
- `docs/clients/openclaw.md`
- `docs/clients/openclaw.zh-CN.md`
- `skills/shared/grok-search-guidance.md`
- `skills/claude-code/SKILL.md`
- `skills/openclaw/SKILL.md`
- `skills/codex/README.md`

## Non-goals

- new runtime functionality
- changing MCP schemas
- browser auth support

## Testing strategy

- add a docs alignment test that checks English and Simplified Chinese client docs for auth and interactive workflow coverage

