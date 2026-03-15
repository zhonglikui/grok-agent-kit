---
name: grok-search
description: Use Grok MCP tools to search X, search the web, and synthesize results through xAI Grok. Trigger when the user asks about recent X posts, Grok-grounded synthesis, or xAI web-backed research.
---

# Grok Search

Use the `grok-agent-kit` MCP server when you need xAI Grok-backed search and synthesis.

## Tool selection

- Use `grok_x_search` for X/Twitter content, live reactions, and creator commentary.
- Use `grok_web_search` for official docs, articles, and web evidence.
- Use `grok_chat` after search when the user wants synthesis, comparison, or drafting.
- Use `grok_models` only when model availability matters.

## Working style

- Prefer one search tool at a time before synthesizing.
- Preserve citations when summarizing.
- If a result looks weak or partial, run a second search with tighter domain or handle filters.

## Example prompts

- "Find recent X posts from xAI about Grok search features."
- "Search the web for the latest xAI docs on X Search."
- "Summarize what changed and list the sources."
