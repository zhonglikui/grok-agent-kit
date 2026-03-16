---
name: grok-search
description: Use Grok MCP tools from Gemini CLI when the user needs live X updates, broader web grounding, or xAI-based synthesis.
---

# Grok Search

Use the `grok-agent-kit` MCP server when Gemini CLI needs fresh xAI-backed search and synthesis.

## Tool selection

- Use `grok_x_search` for recent X posts, creator commentary, and social signal.
- Use `grok_web_search` for official docs, changelogs, and broader web evidence.
- Use `grok_chat` after search when the user needs synthesis, comparison, drafting, or explanation.
- Use `grok_models` only when model selection matters.

## Working style

- Prefer search-first when freshness matters.
- Keep citations in the final answer whenever the client surfaces them.
- Use `session` for multi-turn continuity.
- Use `resetSession` when an old named thread should start over.
- Install or link this skill with `gemini skills install` or `gemini skills link`.

## Example prompts

- "Find the latest X posts from xAI about Grok search."
- "Search the web for official xAI docs on X Search."
- "Summarize the findings with sources and note any uncertainty."
