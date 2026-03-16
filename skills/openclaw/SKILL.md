---
name: grok-search
description: Use Grok MCP tools for X search, web search, and synthesis when the user needs xAI-grounded live information.
---

# Grok Search

## Preferred tool order

1. `grok_x_search` for recent X posts and threads
2. `grok_web_search` for docs and article evidence
3. `grok_chat` for summarization or synthesis

## Rules

- Use handle filters before broad prompt rewriting for X-specific research.
- Use domain filters for official web research.
- Keep source links in the final answer when relevant.
- Use `session` for multi-turn continuity and `resetSession` when a named search thread needs a fresh start.

## Good fits

- "What are people on X saying about ..."
- "What do the latest xAI docs say about ..."
- "Combine the X view and the web view into one answer"
