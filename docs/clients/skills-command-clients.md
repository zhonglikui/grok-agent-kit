# Skill command-managed clients

[English](./skills-command-clients.md) | [简体中文](./skills-command-clients.zh-CN.md)

This group covers clients that manage skills primarily through their own CLI commands instead of direct file placement as the main workflow.

## Clients in this group

- `Gemini CLI`

## Recommended flow

Use a live local link while iterating:

```bash
gemini skills link /absolute/path/to/grok-agent-kit/skills/gemini-cli
gemini skills list
```

When you want a copied install instead, use:

```bash
gemini skills install /absolute/path/to/grok-agent-kit/skills/gemini-cli
```

## Why this group is separate

- the skill payload is still a `SKILL.md` directory
- but the primary install / enable / disable flow is handled by `gemini skills ...`
- this makes it easier to document a stable user flow than asking people to place files manually

## Good companion commands

- `gemini skills list`
- `gemini skills enable <name>`
- `gemini skills disable <name>`
- `gemini skills uninstall <name>`

## `grok-agent-kit` asset

Use:

- `skills/gemini-cli/SKILL.md`

That asset is intentionally aligned with the same search-first routing rules as the Codex and Claude Code variants.
