# Claude Code setup

[English](./claude-code.md) | [简体中文](./claude-code.zh-CN.md)

## Local development command

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

Set `XAI_API_KEY` before launching Claude Code, or use the client's MCP environment configuration support.

## Published package command

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

## Skill asset

Use `skills/claude-code/SKILL.md` as the installable skill content for Claude Code style workflows.

## Stateful MCP usage

Claude Code can use the same continuity controls as other MCP clients:

- `previousResponseId` to continue an earlier xAI response chain
- `store: true` to keep a response chain resumable
- `session` on `grok_chat` to resume a named local session without manual ID tracking
- `images` on `grok_chat` to attach local screenshots or photos

For local session administration, use:

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

When a named session contains image turns, Claude Code should rely on `session` replay instead of manually threading `previousResponseId`.

## Example config

Use `examples/clients/claude-code-config.json` as a starting point if you prefer JSON-based config management around your MCP servers.
