# Claude Code 接入说明

[English](./claude-code.md) | [简体中文](./claude-code.zh-CN.md)

## 本地开发命令

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

你也可以通过下面的命令直接生成同样的接入命令：

```bash
grok-agent-kit clients claude-code --mode local --project-path /absolute/path/to/grok-agent-kit
```

启动 Claude Code 前请先设置 `XAI_API_KEY`，或者使用客户端自身的 MCP 环境变量配置能力。

## 发布后的 npm 命令

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

或者直接生成：

```bash
grok-agent-kit clients claude-code --mode published
```

## 可选的本地认证管理

如果你还想在本地运行 `grok-agent-kit auth validate-management` 之类的认证管理命令，可额外设置：

- `XAI_MANAGEMENT_API_KEY`

这个变量是可选的，不是 Claude Code MCP 推理流量的必需项。

## Skill 文件

`skills/claude-code/SKILL.md` 可作为 Claude Code 风格工作流中的安装型 skill 内容。

## 有状态 MCP 用法

Claude Code 与其他 MCP 客户端一样，可以使用以下连续上下文参数：

- `previousResponseId`：继续之前的 xAI 响应链
- `store: true`：让这条响应链后续还可继续续接
- `session`：传给 `grok_chat` 后，可直接恢复命名本地会话，无需手动维护 ID
- `images`：传给 `grok_chat` 后，可附加本地截图或照片
- `session` 与 `resetSession`：传给 `grok_x_search` / `grok_web_search` 后，可运行命名的多轮搜索流程

如需管理本地会话，可使用：

- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

如果命名会话里包含图片轮次，Claude Code 应优先依赖 `session` 的本地重放，而不是手动维护 `previousResponseId`。
纯文本命名会话现在也可以通过同一个本地会话名在聊天与搜索工具之间继续。

## 推荐搭配的本地命令

在 MCP 之外，这些本地命令很适合和 Claude Code 配套使用：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## 示例配置

如果你更习惯用 JSON 方式管理 MCP 配置，可以从 `examples/clients/claude-code-config.json` 开始。
