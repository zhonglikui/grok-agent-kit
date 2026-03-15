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

## Example config

Use `examples/clients/claude-code-config.json` as a starting point if you prefer JSON-based config management around your MCP servers.
