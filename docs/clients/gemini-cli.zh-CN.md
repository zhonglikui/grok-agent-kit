# Gemini CLI 接入

[English](./gemini-cli.md) | [简体中文](./gemini-cli.zh-CN.md)

## 已发布 npm 包的接入命令

先在同一个 shell 中设置 `XAI_API_KEY`，再添加 MCP 服务：

```bash
grok-agent-kit clients gemini-cli --mode published
gemini mcp add grok-agent-kit npx -y grok-agent-kit mcp
```

仓库里也提供了现成示例：

- `examples/clients/gemini-cli-command.txt`

## 本地开发模式命令

先构建 CLI，再让 Gemini CLI 指向你的本地仓库：

```bash
grok-agent-kit clients gemini-cli --mode local --project-path /absolute/path/to/grok-agent-kit
gemini mcp add grok-agent-kit node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

## 环境变量

Gemini CLI 通过命令来管理 MCP 服务，因此最稳妥的方式是在启动 Gemini CLI 之前就把凭证放进宿主 shell：

```bash
export XAI_API_KEY=your_key_here
export XAI_MANAGEMENT_API_KEY=your_management_key_here
gemini
```

`XAI_MANAGEMENT_API_KEY` 可选，仅在你需要运行本地 management 命令时才需要。

## Skill 资产

使用本仓库提供的 Gemini 专用 skill 目录：

```bash
gemini skills link /absolute/path/to/grok-agent-kit/skills/gemini-cli
gemini skills list
```

如果你不想使用实时联动的 link，也可以用 `gemini skills install <source>` 进行复制安装。

## 有状态的 MCP 用法

Gemini CLI 与其他 MCP 客户端一样，可以使用这些连续性参数：

- `previousResponseId`：延续上一次 xAI 响应链
- `store: true`：让响应链可以继续恢复
- `grok_chat` 的 `session`：恢复命名本地会话
- `grok_chat` 的 `images`：附加本地截图或照片
- `grok_x_search` / `grok_web_search` 的 `session` 与 `resetSession`：运行命名的多轮搜索流
- `grok_list_sessions`、`grok_get_session`、`grok_delete_session`：管理本地会话

## 推荐搭配的本地命令

在 MCP 之外，这些本地命令与 Gemini CLI 很搭：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`
