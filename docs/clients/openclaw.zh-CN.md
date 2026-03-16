# OpenClaw 接入说明

[English](./openclaw.md) | [简体中文](./openclaw.zh-CN.md)

## 本地开发配置

在 OpenClaw 里添加一个 MCP server 配置，指向已经构建好的 CLI：

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "node",
      "args": [
        "/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js",
        "mcp"
      ],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## 发布后的 npm 配置

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

## 可选的本地认证管理

如果你还想在 MCP 之外运行本地认证管理命令，可额外设置：

- `XAI_MANAGEMENT_API_KEY`

这个变量是可选的，不是 OpenClaw MCP 推理流量的必需项。

## Skill 文件

`skills/openclaw/SKILL.md` 可作为面向 OpenClaw 的搜索指导文件。

## 有状态 MCP 用法

OpenClaw 可使用以下 MCP 参数与工具实现本地连续上下文：

- `previousResponseId`：继续之前的 xAI 响应链
- `store: true`：让该响应链后续还能继续续接
- `session`：传给 `grok_chat` 后自动恢复命名本地会话
- `images`：传给 `grok_chat` 后可附加本地截图或照片
- `session` 与 `resetSession`：传给 `grok_x_search` / `grok_web_search` 后可保持命名本地搜索线程
- `grok_list_sessions`、`grok_get_session`、`grok_delete_session`：管理已保存的本地会话

如果命名会话里包含图片轮次，应优先使用本地 `session` 重放流程，而不是 `previousResponseId`。
纯文本命名会话现在也可以通过同一个本地会话名在聊天与搜索工具之间流转。

## 推荐搭配的本地命令

在 MCP 之外，这些本地命令很适合和 OpenClaw 配套使用：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## 示例配置

你可以直接参考 `examples/clients/openclaw-config.json`。
