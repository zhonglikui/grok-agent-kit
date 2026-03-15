# Codex guidance

Codex does not consume Claude-style `SKILL.md` files in the same way, so the Codex path for `grok-agent-kit` is:

- configure the MCP server with `D:/work/typescript/grok-agent-kit/examples/clients/codex-config.toml`
- add a project-level `AGENTS.md` or personal prompt guidance that explains when to use:
  - `grok_x_search`
  - `grok_web_search`
  - `grok_chat`

Suggested guidance text:

> Use `grok_x_search` for live X content, `grok_web_search` for docs and web grounding, and `grok_chat` only after search when synthesis is needed. Prefer sources with citations and tighten domain/handle filters before broadening.
