# Codex 接入说明

[English](./codex.md) | [简体中文](./codex.zh-CN.md)

## 本地开发配置

先构建 CLI，再让 Codex 指向你本地仓库中的可执行文件：

```toml
[mcp_servers.grok-agent-kit]
command = "node"
args = ["/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

你可以直接从 `examples/clients/codex-config.toml` 改起。

## 发布后的 npm 配置

发布到 npm 后可以改成：

```toml
[mcp_servers.grok-agent-kit]
command = "npx"
args = ["-y", "grok-agent-kit", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

## 可选的本地认证管理

如果你还想在 MCP 之外运行本地认证管理命令，可额外设置：

- `XAI_MANAGEMENT_API_KEY`

这个变量是可选的，不是 Codex MCP 推理流量的必需项。

## 建议补充给 Codex 的指导语

Codex 不会像 Claude Code 那样直接消费 `SKILL.md`，因此建议把下面这类说明写进项目 `AGENTS.md` 或你的个人提示词里：

> Use `grok_x_search` for live X content, `grok_web_search` for docs and web grounding, and `grok_chat` only after search when synthesis is needed. Prefer `session` for continuity, preserve citations, and tighten domain or handle filters before broadening.

## 有状态 MCP 用法

当 Codex 需要跨多次工具调用保留连续上下文时，可以传：

- `previousResponseId`：继续之前的 xAI 响应链
- `store: true`：让当前这次响应后续还能继续被续接
- `session`：传给 `grok_chat` 后，可不手动维护响应 ID，直接使用命名本地会话自动续接
- `images`：传给 `grok_chat` 后，可分析本地截图或照片
- `session` 与 `resetSession`：传给 `grok_x_search` / `grok_web_search` 后，可运行多轮命名搜索工作流，无需手动维护响应 ID

Codex 也可以通过以下工具查看或清理本地会话状态：

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

如果命名会话里包含图片轮次，`grok_chat` 会以 `store: false` 重放本地转录，而不是使用 `previousResponseId`。
纯文本命名会话现在也可以在 `grok_chat`、`grok_x_search` 与 `grok_web_search` 之间共用同一个本地会话名。

## 推荐搭配的本地命令

在 MCP 之外，这些本地命令很适合和 Codex 配套使用：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`
