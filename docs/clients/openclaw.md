# OpenClaw setup

## Local development config

Add an MCP server entry that launches the built CLI:

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "node",
      "args": [
        "D:\\work\\typescript\\grok-agent-kit\\apps\\cli\\dist\\bin.js",
        "mcp"
      ],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## Intended published config

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "npx",
      "args": ["-y", "grok-agent-kit", "mcp"],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## Skill asset

Use `D:/work/typescript/grok-agent-kit/skills/openclaw/SKILL.md` for OpenClaw-oriented search guidance.
