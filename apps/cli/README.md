# grok-agent-kit

[English docs](https://github.com/zhonglikui/grok-agent-kit#readme) | [简体中文文档](https://github.com/zhonglikui/grok-agent-kit/blob/main/README.zh-CN.md)

Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok.

## Install

```bash
npx -y grok-agent-kit chat --prompt "Hello from Grok"
npx -y grok-agent-kit chat --session notes --prompt "Start a persistent CLI session"
npx -y grok-agent-kit chat --session notes --prompt "Continue that session"
npx -y grok-agent-kit sessions show notes
npx -y grok-agent-kit sessions list
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
GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS=3
GROK_AGENT_KIT_RETRY_BASE_DELAY_MS=250
GROK_AGENT_KIT_RETRY_MAX_DELAY_MS=4000
```

The CLI retries transient rate-limit, timeout, and `5xx` failures by default so long-running MCP agent sessions are less likely to fail on a single flaky request.

## Local sessions

- `chat --session <name>` continues a named local session
- `chat --reset-session --session <name>` resets that session before sending the new prompt
- `chat --previous-response-id <id>` continues from a raw xAI response id
- `sessions show <name>` prints the saved local transcript for a session
- `sessions list` shows saved sessions
- `sessions delete <name>` removes a saved session record

## Supported surfaces

- CLI for direct usage
- MCP over `grok-agent-kit mcp`
- search guidance for Codex, Claude Code, and OpenClaw

## More docs

- [Repository README](https://github.com/zhonglikui/grok-agent-kit#readme)
- [Codex setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/codex.md)
- [Claude Code setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/claude-code.md)
- [OpenClaw setup](https://github.com/zhonglikui/grok-agent-kit/blob/main/docs/clients/openclaw.md)
