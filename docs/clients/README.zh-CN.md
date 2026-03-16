# 客户端接入文档

[English](./README.md) | [简体中文](./README.zh-CN.md)

使用这些文档把 `grok-agent-kit` 接入到支持的代理客户端里。

## 开始之前

- 把 `/absolute/path/to/grok-agent-kit` 替换成你本地仓库的实际路径
- 如果走本地开发模式，请先构建 CLI
- 在宿主环境或客户端 MCP 配置里设置 `XAI_API_KEY`
- 只有当你还想在本地使用 `grok-agent-kit auth status` 这类认证管理命令时，才需要额外设置 `XAI_MANAGEMENT_API_KEY`

## 指南

- [Codex](./codex.zh-CN.md)
- [Claude Code](./claude-code.zh-CN.md)
- [OpenClaw](./openclaw.zh-CN.md)

## 用 CLI 生成接入片段

如果你不想手工复制示例配置，可以直接用内置生成器输出可粘贴的客户端配置：

- `grok-agent-kit clients codex --mode local --project-path /absolute/path/to/grok-agent-kit`
- `grok-agent-kit clients codex --mode published`
- `grok-agent-kit clients claude-code --mode published`
- `grok-agent-kit clients openclaw --mode local --project-path /absolute/path/to/grok-agent-kit`

## 推荐搭配的本地命令

这些命令不属于 MCP，但很适合和代理客户端配套使用：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## 流式说明

- `grok_chat`、`grok_x_search`、`grok_web_search` 支持通过 MCP 传入 `stream: true`
- 兼容的客户端可请求 MCP progress 通知，并从 `notifications/progress.params.message` 读取文本增量
- 不同产品和版本对 progress 通知的渲染支持程度可能不同

## 本地会话说明

- `grok_chat` 支持传入 `session`，获得类似 CLI 的命名本地会话续接能力
- `grok_chat` 支持传入 `images: ["/absolute/path/to/file.png"]`，用于本地 PNG / JPEG 图片分析
- `grok_chat`、`grok_x_search`、`grok_web_search` 支持 `previousResponseId` 与 `store`，用于显式响应链续接
- `grok_x_search` 与 `grok_web_search` 也支持 `session` 和 `resetSession`，用于命名本地搜索工作流
- `grok_list_sessions`、`grok_get_session`、`grok_delete_session` 提供基于 MCP 的本地会话管理能力
- 带图片的命名聊天会话会从本地归档重放上下文，并以 `store: false` 运行，而不是依赖服务端历史

## 认证说明

- `XAI_API_KEY` 是 chat、search、MCP 推理能力所需的运行时凭证
- `XAI_MANAGEMENT_API_KEY` 是可选的，只在本地使用 `grok-agent-kit auth validate-management` 等 management API 命令时需要
- 当前发布的本地 CLI / MCP 路径不包含浏览器授权

## 示例配置

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
