# Claude Code setup

## Local development command

```bash
claude mcp add grok-agent-kit --scope user node D:\work\typescript\grok-agent-kit\apps\cli\dist\bin.js mcp
```

Set `XAI_API_KEY` in the environment before launching Claude Code, or use the host's MCP env configuration support.

## Intended published command

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

## Skill asset

Use `D:/work/typescript/grok-agent-kit/skills/claude-code/SKILL.md` as the installable skill content for Claude Code style workflows.
