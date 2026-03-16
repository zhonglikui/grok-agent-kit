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

## Skill 文件

`skills/openclaw/SKILL.md` 可作为面向 OpenClaw 的搜索指导文件。

## 有状态 MCP 用法

OpenClaw 可使用以下 MCP 参数与工具实现本地连续上下文：

- `previousResponseId`：继续之前的 xAI 响应链
- `store: true`：让该响应链后续还能继续续接
- `session`：传给 `grok_chat` 后自动恢复命名本地会话
- `images`：传给 `grok_chat` 后可附加本地截图或照片
- `grok_list_sessions`、`grok_get_session`、`grok_delete_session`：管理已保存的本地会话

如果命名会话里包含图片轮次，应优先使用本地 `session` 重放流程，而不是 `previousResponseId`。

## 示例配置

你可以直接参考 `examples/clients/openclaw-config.json`。
