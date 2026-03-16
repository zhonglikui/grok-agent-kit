# 社区上架文案模板

当你准备把 `grok-agent-kit` 发布到 npm、MCP 社区或 skills 社区时，可以直接复用这些文案。

## 副标题

`CLI + MCP + skills for xAI Grok`

## 一句话描述

`grok-agent-kit` 是一个 local-first 工具包，让 Codex、Claude Code、OpenClaw 和终端用户共享同一套基于 Grok 的聊天与搜索能力。

## 核心卖点

- 提供 local-first CLI 和 stdio MCP server
- 以 `XAI_API_KEY` 作为主要运行时认证方式
- 可选使用 `XAI_MANAGEMENT_API_KEY` 做本地团队 API key 管理
- 面向 Codex、Claude Code、OpenClaw 提供统一接入指导
- 同时维护英文与简体中文文档

## npm 文案

适合用于 npm 页面描述或 README 摘要：

> Community-built, unofficial CLI + MCP + skills toolkit for xAI Grok. Use it directly from the terminal, wire it into MCP clients, or share search guidance with coding agents.

## MCP 社区文案

适合用于 MCP registry 或精选列表：

> `grok-agent-kit mcp` exposes Grok chat, X search, web search, model listing, and local session management for agent clients such as Codex, Claude Code, and OpenClaw.

## skills 社区文案

适合用于发布可复用的搜索指导资源：

> The bundled skills help agents choose between Grok chat, X search, and web search while preserving citations and local-first workflows.

## 建议标签

- Grok
- xAI
- MCP
- CLI
- Codex
- Claude Code
- OpenClaw
- search
- local-first

## 建议安装片段

```bash
npx -y grok-agent-kit mcp
```

## 建议配置片段提示

可以引导社区用户直接运行：

- `grok-agent-kit clients codex --mode published`
- `grok-agent-kit clients claude-code --mode published`
- `grok-agent-kit clients openclaw --mode published`
