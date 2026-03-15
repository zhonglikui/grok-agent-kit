# 客户端接入文档

[English](./README.md) | [简体中文](./README.zh-CN.md)

使用这些文档把 `grok-agent-kit` 接入到支持的代理客户端里。

## 开始之前

- 把 `/absolute/path/to/grok-agent-kit` 替换成你本地仓库的实际路径
- 如果走本地开发模式，请先构建 CLI
- 在宿主环境或客户端 MCP 配置里设置 `XAI_API_KEY`

## 指南

- [Codex](./codex.zh-CN.md)
- [Claude Code](./claude-code.zh-CN.md)
- [OpenClaw](./openclaw.zh-CN.md)

## 流式说明

- `grok_chat`、`grok_x_search`、`grok_web_search` 现在都支持通过 MCP 传入 `stream: true`。
- 兼容的客户端可请求 MCP progress 通知，并从 `notifications/progress.params.message` 读取文本增量。
- 不同产品和版本对 progress 通知的渲染支持程度可能不同。

## 示例配置

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
