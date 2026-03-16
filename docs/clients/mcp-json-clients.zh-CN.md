# MCP JSON 配置客户端

[English](./mcp-json-clients.md) | [简体中文](./mcp-json-clients.zh-CN.md)

这组客户端通过 JSON 结构定义 MCP 服务，而不是单独的添加命令。

## 本组客户端

- `OpenClaw`
- `Qwen Code`
- `Trae`

## 共享的 stdio JSON 结构

这些客户端都可以使用同一份基础传输结构：

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

如果是本地开发模式，把传输改成：

```json
{
  "mcpServers": {
    "grok-agent-kit": {
      "command": "node",
      "args": ["/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js", "mcp"],
      "env": {
        "XAI_API_KEY": "YOUR_XAI_API_KEY"
      }
    }
  }
}
```

## 各客户端补充说明

### OpenClaw

- 直接使用共享的 `mcpServers` JSON 结构
- 本仓库已提供 `examples/clients/openclaw-config.json`

### Qwen Code

- 使用 `settings.json` 顶层的 `mcpServers`
- 还支持 `mcp` 级别的 allow / exclude 等全局设置
- 如果你更喜欢命令流，也可以使用 `qwen mcp add`

### Trae

- 支持在 MCP 设置界面中手动粘贴 JSON
- 支持项目级 `.trae/mcp.json`
- 同时支持 `command` / `args` / `env` 的 stdio 服务，以及远程 HTTP 变体

## 可选扩展字段

这组客户端里有些产品支持比最小结构更多的字段：

- `cwd`
- `timeout`
- `trust`
- `includeTools` / `excludeTools`
- 远程 `url` 或 `httpUrl`

对于 `grok-agent-kit` 的标准本地优先用法，不需要这些扩展字段。
