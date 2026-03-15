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

## 示例配置

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
