# Codex guidance

The installable Codex entry point for this project is the repository root `SKILL.md`.

Use this page as the Codex-specific companion once the `grok-agent-kit` MCP is installed.

## Recommended decision rule

- Start with `grok_x_search` for live X content, handle-specific monitoring, and social reactions.
- Start with `grok_web_search` for official docs, changelogs, release notes, and broader web grounding.
- Use `grok_chat` after search when you need synthesis, structured summaries, comparison, or drafting.

## Continuity and filters

- Reuse `session` whenever the user is continuing the same thread.
- Use `resetSession` when the prior search context is no longer relevant.
- Use `allowedXHandles` when the user names a specific X account or source.
- Use `allowedWebDomains` when the user wants docs or evidence from a named site.

## Prompt patterns

- `grok_x_search`: “Find the latest X posts from xai about Grok search changes.”
- `grok_web_search`: “Search the web for official xAI docs about X Search. Prefer docs.x.ai.”
- `grok_chat`: “Summarize the X and web findings, keep citations, and list any uncertainty.”

## Practical default

Prefer search-first for fresh claims, keep citations in the result, and only broaden beyond the named handles or domains if the first pass is insufficient.
