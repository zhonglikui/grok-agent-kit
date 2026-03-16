# Skill `SKILL.md` clients

[English](./skills-skill-md-clients.md) | [简体中文](./skills-skill-md-clients.zh-CN.md)

This group covers clients that use a directory containing a `SKILL.md` file as the primary skill unit.

## Clients in this group

- `Codex`
- `Claude Code`
- `Qwen Code`
- `Trae`

## Shared skill structure

```text
skill-name/
├── SKILL.md
├── examples/
├── templates/
└── resources/
```

`SKILL.md` should contain YAML frontmatter plus Markdown instructions. Supporting files are optional.

## Repository assets

- Codex: root `SKILL.md` plus `skills/codex/README.md`
- Claude Code: `skills/claude-code/SKILL.md`
- Gemini CLI: `skills/gemini-cli/SKILL.md` (command-managed install flow, see the separate guide)
- OpenClaw: `skills/openclaw/SKILL.md`

## Client-specific notes

### Codex

- Use the repository root `SKILL.md` as the installable guidance asset.
- Pair it with the Codex MCP config from `docs/clients/codex.md`.

### Claude Code

- Use `skills/claude-code/SKILL.md`.
- Keep the MCP server installed first so the skill has tools to call.

### Qwen Code

- Personal skills live under `~/.qwen/skills/<skill-name>/SKILL.md`.
- Project skills live under `.qwen/skills/<skill-name>/SKILL.md`.
- Qwen Code also supports extra files next to `SKILL.md`.

### Trae

- Project skills live under `.trae/skills/<skill-name>/SKILL.md`.
- Global skills live under `~/.trae-cn/skills/<skill-name>/SKILL.md` on the Chinese desktop build.
- Trae can also import a `SKILL.md` directory or ZIP from its UI.

## Recommended `grok-agent-kit` pattern

Keep the skill focused on routing:

- `grok_x_search` for X / Twitter freshness
- `grok_web_search` for docs and broader web grounding
- `grok_chat` after search for synthesis
- `session` / `resetSession` for continuity

Avoid burying client-specific install steps inside the skill itself; keep install steps in the client docs.
