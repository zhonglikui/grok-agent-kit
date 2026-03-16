---
name: grok-agent-kit
description: Use when Codex has the grok-agent-kit MCP available and needs live X content, broader web grounding, or Grok synthesis across one or more related turns.
---

# grok-agent-kit

Use this skill when `Codex` already has access to the `grok-agent-kit` MCP tools and needs help choosing the right Grok surface.

## Tool choice
- Use `grok_x_search` for live X posts, creator or company updates, and social signal.
- Use `grok_web_search` for docs, articles, release notes, and broader web evidence.
- Use `grok_chat` after search when synthesis, comparison, drafting, or explanation is needed.

## Operating pattern
1. Search first when freshness matters.
2. Reuse `session` when the user says “continue”, “compare”, “refine”, or “build on that”.
3. Use `resetSession` when an old search thread has drifted too far.
4. Tighten scope with `allowedXHandles` or `allowedWebDomains` before broadening.
5. Preserve citations and call out uncertainty instead of over-claiming.

## Good defaults
- Ask `grok_x_search` for “latest X posts”, “what people on X are saying”, or named handle updates.
- Ask `grok_web_search` for official docs, announcements, or site-specific evidence.
- Ask `grok_chat` to summarize findings only after the relevant search results exist.

## Avoid
- Starting with `grok_chat` for real-time claims that need fresh evidence.
- Running broad search when the user already named a handle or domain.
- Dropping continuity when the user is clearly extending the same research thread.

See also:
- `skills/shared/grok-search-guidance.md`
- `skills/codex/README.md`
