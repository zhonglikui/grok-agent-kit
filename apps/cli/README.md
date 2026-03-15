# grok-agent-kit

[English docs](https://github.com/zhonglikui/grok-agent-kit#readme) | [简体中文文档](https://github.com/zhonglikui/grok-agent-kit/blob/main/README.zh-CN.md)

Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

## Install

```bash
npx -y grok-agent-kit chat --prompt "Hello from Grok"
npx -y grok-agent-kit x-search --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --prompt "Latest xAI docs"
npx -y grok-agent-kit mcp
```

## Environment

```bash
XAI_API_KEY=your_key_here
XAI_BASE_URL=https://api.x.ai/v1
GROK_AGENT_KIT_MODEL=grok-4
GROK_AGENT_KIT_TIMEOUT_MS=30000
```

## Supported surfaces

- CLI for direct usage
- MCP over `grok-agent-kit mcp`
- search guidance for Codex, Claude Code, and OpenClaw

## More docs

- [Repository README](https://github.com/zhonglikui/grok-agent-kit#readme)
- [Codex setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/codex.md)
- [Claude Code setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/claude-code.md)
- [OpenClaw setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/openclaw.md)
