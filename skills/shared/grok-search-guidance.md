# Grok search guidance

Use Grok in a layered way:

1. `grok_x_search` for live social and creator signals on X
2. `grok_web_search` for docs, articles, and broader web evidence
3. `grok_chat` for synthesis, explanation, and final drafting
4. prefer `session` when the workflow needs continuity across multiple MCP turns

Prefer explicit prompts such as:

- "Find the latest X posts about ..."
- "Search the web for official xAI docs about ..."
- "Summarize these findings and identify uncertainty"

When precision matters:

- restrict X Search with `allowedXHandles`
- restrict Web Search with `allowedWebDomains`
- use `resetSession` when a named search thread has drifted too far
- keep citations in the result whenever possible
