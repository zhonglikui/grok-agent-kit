# 客户端接入文档

[English](./README.md) | [简体中文](./README.zh-CN.md)

这些文档把 `grok-agent-kit` 的客户端接入方式按“配置模式”分组整理，避免为每个产品单独维护一套完全不同的说明。

## 开始之前

- 把 `/absolute/path/to/grok-agent-kit` 替换成你本地仓库的真实路径
- 如果走本地开发模式，请先构建 CLI
- 在宿主环境或客户端 MCP 配置里设置 `XAI_API_KEY`
- 只有当你还要使用 `grok-agent-kit auth status` 之类的本地认证管理命令时，才需要额外设置 `XAI_MANAGEMENT_API_KEY`

## 一等支持的客户端生成器

这些客户端已经有内置的 `grok-agent-kit clients <client>` 输出：

- [Codex](./codex.zh-CN.md)
- [Claude Code](./claude-code.zh-CN.md)
- [Gemini CLI](./gemini-cli.zh-CN.md)
- [OpenClaw](./openclaw.zh-CN.md)

生成器示例：

- `grok-agent-kit clients codex --mode local --project-path /absolute/path/to/grok-agent-kit`
- `grok-agent-kit clients codex --mode published`
- `grok-agent-kit clients claude-code --mode published`
- `grok-agent-kit clients gemini-cli --mode published`
- `grok-agent-kit clients openclaw --mode local --project-path /absolute/path/to/grok-agent-kit`

## 分组 MCP 指南

- [MCP 命令式客户端](./mcp-command-clients.zh-CN.md)
- [MCP JSON 配置客户端](./mcp-json-clients.zh-CN.md)
- [MCP 图形界面与市场型客户端](./mcp-gui-clients.zh-CN.md)

## 分组 Skill 指南

- [`SKILL.md` 技能客户端](./skills-skill-md-clients.zh-CN.md)
- [命令式技能客户端](./skills-command-clients.zh-CN.md)

## 客户端矩阵

| 客户端 | MCP | Skills | 主要模式 | 当前支持级别 |
| --- | --- | --- | --- | --- |
| Codex | 是 | 是 | TOML MCP + 项目规则 | 一等支持 |
| Claude Code | 是 | 是 | 命令式 MCP + `SKILL.md` | 一等支持 |
| Gemini CLI | 是 | 是 | 命令式 MCP + 命令式 skills | 一等支持 |
| OpenClaw | 是 | 是 | `mcpServers` JSON + 仓库 skill | 一等支持 |
| Qwen Code | 是 | 是 | `settings.json` + `SKILL.md` 目录 | 分组文档 |
| Trae | 是 | 是 | `.trae/mcp.json` + `.trae/skills/` | 分组文档 |
| Cursor | 是 | 部分 / 自定义 | 图形界面 MCP 添加 | 分组文档 |
| Windsurf | 是 | 部分 / 自定义 | 图形界面 MCP 添加 | 分组文档 |
| Cherry Studio | 是 | 暂无统一共享格式 | 图形界面 MCP 添加 | 分组文档 |
| LobeHub / LobeChat | 市场 / 手动 | 部分 / 社区化 | 市场优先 | 分组文档 |
| GitHub Copilot | 是 | 是 | 封闭 / 产品特定 | 文档手动 |
| 通义灵码 | 是 | 是 | 产品特定 | 文档手动 |
| Kimi Code | 是 | 演进中 / 部分 | 产品特定 | 文档手动 |

## 推荐搭配的本地命令

这些命令不属于 MCP，但很适合和代理客户端搭配使用：

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## 流式说明

- `grok_chat`、`grok_x_search`、`grok_web_search` 支持通过 MCP 传入 `stream: true`
- 支持的客户端可请求 MCP progress 通知，并从 `notifications/progress.params.message` 读取文本增量
- 不同产品与版本对 progress 通知的展示支持程度可能不同

## 本地会话说明

- `grok_chat` 支持传入 `session`，获得类似 CLI 的命名本地会话续接能力
- `grok_chat` 支持传入 `images: ["/absolute/path/to/file.png"]`，用于本地 PNG / JPEG 图片分析
- `grok_chat`、`grok_x_search`、`grok_web_search` 支持 `previousResponseId` 与 `store`
- `grok_x_search` 与 `grok_web_search` 也支持 `session` 和 `resetSession`
- `grok_list_sessions`、`grok_get_session`、`grok_delete_session` 提供基于 MCP 的本地会话管理能力
- 带图片的命名聊天会话会从本地归档重放上下文，并以 `store: false` 运行，而不是依赖服务端历史

## 认证说明

- `XAI_API_KEY` 是 chat、search、MCP 推理能力所需的运行时凭证
- `XAI_MANAGEMENT_API_KEY` 是可选的，只在本地使用 `grok-agent-kit auth validate-management` 等 management API 命令时需要
- 当前发布的本地 CLI / MCP 路径不包含浏览器授权

## 示例配置与产物

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
- `examples/clients/gemini-cli-command.txt`
