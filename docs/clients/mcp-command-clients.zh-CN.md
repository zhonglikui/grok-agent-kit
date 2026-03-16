# MCP 命令式客户端

[English](./mcp-command-clients.md) | [简体中文](./mcp-command-clients.zh-CN.md)

这组客户端更偏向于使用一条命令注册 MCP 服务，而不是手工编辑配置文件。

## 本组客户端

- `Claude Code`
- `Gemini CLI`

## 共同接入规则

1. 先在宿主 shell 中设置 `XAI_API_KEY`
2. 使用客户端自带的 MCP 添加命令注册 `grok-agent-kit mcp`
3. 标准发布传输统一使用：

```bash
npx -y grok-agent-kit mcp
```

## 已发布 npm 包命令

### Claude Code

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

### Gemini CLI

```bash
gemini mcp add grok-agent-kit npx -y grok-agent-kit mcp
```

## 本地开发模式命令

### Claude Code

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

### Gemini CLI

```bash
gemini mcp add grok-agent-kit node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

## 说明

- `XAI_MANAGEMENT_API_KEY` 是可选的，只在你还需要运行本地认证管理命令时才需要
- 如果你移动了仓库路径，请重新执行一次添加命令
- 如果你还需要 skills，请同时参考 [命令式技能客户端](./skills-command-clients.zh-CN.md)
