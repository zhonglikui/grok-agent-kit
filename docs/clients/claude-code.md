# Claude Code setup

[English](./claude-code.md) | [简体中文](./claude-code.zh-CN.md)

## Local development command

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

You can print the same command with:

```bash
grok-agent-kit clients claude-code --mode local --project-path /absolute/path/to/grok-agent-kit
```

Set `XAI_API_KEY` before launching Claude Code, or use the client's MCP environment configuration support.

## Published package command

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

You can also generate it with:

```bash
grok-agent-kit clients claude-code --mode published
```

## Optional local auth management

If you also want to run local auth-management commands such as `grok-agent-kit auth validate-management`, set:

- `XAI_MANAGEMENT_API_KEY`

This is optional and not required for Claude Code MCP inference traffic.

## Skill asset

Use `skills/claude-code/SKILL.md` as the installable skill content for Claude Code style workflows.

## Stateful MCP usage

Claude Code can use the same continuity controls as other MCP clients:

- `previousResponseId` to continue an earlier xAI response chain
- `store: true` to keep a response chain resumable
- `session` on `grok_chat` to resume a named local session without manual ID tracking
- `images` on `grok_chat` to attach local screenshots or photos
- `session` and `resetSession` on `grok_x_search` / `grok_web_search` to run named multi-turn search flows

For local session administration, use:

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

When a named session contains image turns, Claude Code should rely on `session` replay instead of manually threading `previousResponseId`.
Text-only named sessions can be continued across chat and search tools through the same local session name.

## Useful local CLI companions

Outside MCP, these local commands pair well with Claude Code:

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## Example config

Use `examples/clients/claude-code-config.json` as a starting point if you prefer JSON-based config management around your MCP servers.
