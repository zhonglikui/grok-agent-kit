# MCP command-managed clients

[English](./mcp-command-clients.md) | [简体中文](./mcp-command-clients.zh-CN.md)

This group covers clients that prefer a one-shot command to register an MCP server instead of hand-editing a config file.

## Clients in this group

- `Claude Code`
- `Gemini CLI`

## Shared setup rule

1. Set `XAI_API_KEY` in the host shell.
2. Register `grok-agent-kit mcp` with the client’s MCP add command.
3. Keep using the same published stdio transport:

```bash
npx -y grok-agent-kit mcp
```

## Published commands

### Claude Code

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

### Gemini CLI

```bash
gemini mcp add grok-agent-kit npx -y grok-agent-kit mcp
```

## Local development commands

### Claude Code

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

### Gemini CLI

```bash
gemini mcp add grok-agent-kit node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

## Notes

- `XAI_MANAGEMENT_API_KEY` is optional and only needed when you also run local auth-management commands.
- If the client stores MCP registrations internally, re-run the add command after moving the repo path.
- For skills, pair this guide with [Skill command-managed clients](./skills-command-clients.md).
