# grok-agent-kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个面向 xAI Grok 的社区版、非官方 `CLI + MCP + skills` 工具箱。

`grok-agent-kit` 把同一套 Grok 能力封装给三类使用者：

- 直接通过本地 CLI 使用的人类用户
- 通过 MCP 调用能力的编码代理
- 需要共享搜索指引与接入文档的团队

## 提供的能力

- `grok-agent-kit chat`
- `grok-agent-kit doctor`
- `grok-agent-kit x-search`
- `grok-agent-kit web-search`
- `grok-agent-kit models`
- `grok-agent-kit sessions`
- `grok-agent-kit mcp`

MCP 服务端暴露以下工具：

- `grok_chat`
- `grok_x_search`
- `grok_web_search`
- `grok_models`

## 运行要求

- Node.js `20+`
- 一个可用的 `XAI_API_KEY`

## 环境变量

在运行 CLI 或 MCP 服务前，先设置这些变量：

```bash
XAI_API_KEY=your_key_here
XAI_BASE_URL=https://api.x.ai/v1
GROK_AGENT_KIT_MODEL=grok-4
GROK_AGENT_KIT_TIMEOUT_MS=30000
GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS=3
GROK_AGENT_KIT_RETRY_BASE_DELAY_MS=250
GROK_AGENT_KIT_RETRY_MAX_DELAY_MS=4000
```

`XAI_BASE_URL` 可选，默认值为官方 xAI inference base URL。

## 快速开始

发布到 npm 后，可以直接这样运行：

```bash
npx -y grok-agent-kit chat --prompt "Hello from Grok"
npx -y grok-agent-kit doctor
npx -y grok-agent-kit chat --prompt "Stream a quick summary" --stream
npx -y grok-agent-kit chat --prompt-file ./context.txt
npx -y grok-agent-kit chat --prompt "Analyze these logs:" < ./logs.txt
npx -y grok-agent-kit chat --session research --prompt "Summarize the latest Grok updates"
npx -y grok-agent-kit chat --session research --prompt "Turn that into a release note draft"
npx -y grok-agent-kit sessions show research
npx -y grok-agent-kit sessions export research --format markdown
npx -y grok-agent-kit x-search --prompt "Latest xAI posts" --stream
npx -y grok-agent-kit web-search --prompt "Latest xAI docs" --stream
npx -y grok-agent-kit x-search --session research --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --session research --prompt "Latest xAI docs"
npx -y grok-agent-kit x-search --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --prompt "Latest xAI docs"
npx -y grok-agent-kit sessions list
npx -y grok-agent-kit models
npx -y grok-agent-kit mcp
```

本地开发方式：

```bash
npm install
npm test
npm run build
node apps/cli/dist/bin.js doctor
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js chat --prompt "Stream a local reply" --stream
node apps/cli/dist/bin.js chat --prompt-file ./context.txt
Get-Content ./logs.txt | node apps/cli/dist/bin.js chat --prompt "Analyze these logs:"
node apps/cli/dist/bin.js chat --session demo --prompt "Start a local-first conversation"
node apps/cli/dist/bin.js sessions show demo
node apps/cli/dist/bin.js sessions export demo --format markdown --output ./demo-session.md
node apps/cli/dist/bin.js x-search --prompt "Find recent xAI posts" --stream
node apps/cli/dist/bin.js web-search --prompt "Find updated xAI docs" --stream
node apps/cli/dist/bin.js x-search --session demo --prompt "Find recent xAI posts"
node apps/cli/dist/bin.js web-search --session demo --prompt "Find updated xAI docs"
node apps/cli/dist/bin.js sessions list
node apps/cli/dist/bin.js mcp
```

## 会话连续性

`grok-agent-kit` 现在支持 CLI 的本地会话持久化，以及 MCP 客户端显式传入响应链路状态。

- 用 `chat --session <name>` 在多次调用之间继续同一个本地命名会话。
- 用 `chat --reset-session --session <name>` 重置并重新开始该命名会话。
- 用 `chat --stream` 在 xAI 逐步返回内容时直接输出文本增量。
- 用 `x-search --stream` 和 `web-search --stream` 流式输出搜索文本结果。
- 用 `x-search --session <name>` 和 `web-search --session <name>` 在同一个命名会话里继续搜索工作流。
- 用 `sessions show <name>` 打印该命名会话的本地转录记录；如果有数据，也会显示模型和 token 汇总。
- 用 `sessions list` 和 `sessions delete <name>` 管理本地会话元数据。
- 用 `sessions export <name> --format markdown|json` 导出保存好的会话，便于分享、备份或后续处理。
- MCP 客户端可在 `grok_chat`、`grok_x_search`、`grok_web_search` 中传入 `previousResponseId` 和 `store` 来显式续接上下文。
- MCP 客户端可对 `grok_chat`、`grok_x_search`、`grok_web_search` 传入 `stream: true`，并请求 MCP progress 通知，以便从 `notifications/progress.params.message` 接收文本增量。

## 导出会话

- `sessions export <name> --format markdown` 会输出适合阅读的 Markdown 研究记录，包含时间、模型、引用来源和 usage 摘要。
- `sessions export <name> --format json` 会输出规范化后的 JSON，便于备份或程序继续处理。
- 加上 `--output <path>` 可以直接把导出结果写入文件。

## 管道与文件输入

- `chat`、`x-search`、`web-search` 都支持 `--prompt-file <path>`，可直接读取 UTF-8 文本文件作为 prompt。
- `chat --system-file <path>` 可从文件读取较长的 system prompt，便于复用。
- 如果命令接收到管道 stdin，会把管道内容追加到 `--prompt` 或 `--prompt-file` 之后，并用一个空行分隔。
- 也可以只使用管道 stdin，不传 `--prompt`，直接把完整 prompt 内容通过管道送入。

## 诊断

可先运行 `grok-agent-kit doctor` 检查本地环境，再使用 chat、search 或 MCP。

当前会检查：

- 是否使用受支持的 Node.js 版本
- `XAI_API_KEY` 是否存在
- `XAI_BASE_URL` 是否为有效 URL
- `GROK_AGENT_KIT_MODEL` 是否为空或将回退默认值
- 在本地前置条件有效时，通过 models endpoint 做一次真实的 xAI API 连通性检查
- 本地状态目录与 `sessions.json` 是否可读

## 客户端接入文档

- [客户端文档索引](./docs/clients/README.zh-CN.md)
- [Codex](./docs/clients/codex.zh-CN.md)
- [Claude Code](./docs/clients/claude-code.zh-CN.md)
- [OpenClaw](./docs/clients/openclaw.zh-CN.md)

英文版：

- [Client docs index](./docs/clients/README.md)
- [Codex](./docs/clients/codex.md)
- [Claude Code](./docs/clients/claude-code.md)
- [OpenClaw](./docs/clients/openclaw.md)

## 社区与发布

- 提交 PR 前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 漏洞反馈请查看 [SECURITY.md](./SECURITY.md)
- 社区协作行为规范见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- 配置仓库密钥 `NPM_TOKEN` 后，可通过 `.github/workflows/publish.yml` 在 GitHub Actions 中发布

## 仓库结构

```text
apps/cli               面向用户发布的 npm CLI 包
packages/xai-client    直接调用 xAI REST API 的轻量客户端
packages/core          CLI 与 MCP 共用的领域逻辑
packages/mcp-server    MCP 工具注册与 stdio 服务启动
packages/skill-utils   后续 skill 打包与同步辅助工具
skills/                通用与客户端专用 skill 内容
examples/clients       可直接改造的客户端示例配置
docs/clients           客户端安装与接入说明
```

## 使用到的官方参考

- [xAI Quickstart](https://docs.x.ai/developers/quickstart)
- [xAI REST Inference API](https://docs.x.ai/developers/rest-api-reference/inference)
- [xAI Web Search](https://docs.x.ai/developers/tools/web-search)
- [xAI X Search](https://docs.x.ai/developers/tools/x-search)
- [xAI Models API](https://docs.x.ai/developers/rest-api-reference/inference/models)
- [MCP SDK](https://modelcontextprotocol.io/docs/sdk)

## 当前状态

当前仓库已经具备：

- 可工作的 TypeScript 单仓多包结构
- 已测试的 xAI REST client、core service、CLI 分发和 MCP handlers
- 可直接面向 npm 发布的 CLI 打包路径
- 面向支持客户端的中英文接入文档
- GitHub 社区治理文件与发布工作流脚手架
