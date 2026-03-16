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

## 建议补充给 Codex 的指导语

Codex 不会像 Claude Code 那样直接消费 `SKILL.md`，因此建议把下面这类说明写进项目 `AGENTS.md` 或你的个人提示词里：

> Use `grok_x_search` for live X content, `grok_web_search` for docs and web grounding, and `grok_chat` only after search when synthesis is needed. Prefer sources with citations and tighten domain or handle filters before broadening.

## 有状态 MCP 用法

当 Codex 需要跨多次工具调用保留连续上下文时，可以传：

- `previousResponseId`：继续之前的 xAI 响应链
- `store: true`：让当前这次响应后续还能继续被续接
- `session`：传给 `grok_chat` 后，可不手动维护响应 ID，直接使用命名本地会话自动续接

Codex 也可以通过以下工具查看或清理本地会话状态：

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

如果是在本地终端直接使用而不是通过 MCP，优先用 `grok-agent-kit chat --session <name>`。
