# grok-agent-kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个面向 xAI Grok 的社区版、非官方 `CLI + MCP + skills` 工具箱。

`grok-agent-kit` 把同一套 Grok 能力封装给三类使用者：

- 直接通过本地 CLI 使用的人类用户
- 通过 MCP 调用能力的编码代理
- 需要共享搜索指引与接入文档的团队

## 提供的能力

- `grok-agent-kit chat`
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
npx -y grok-agent-kit chat --prompt "Stream a quick summary" --stream
npx -y grok-agent-kit chat --session research --prompt "Summarize the latest Grok updates"
npx -y grok-agent-kit chat --session research --prompt "Turn that into a release note draft"
npx -y grok-agent-kit sessions show research
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
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js chat --prompt "Stream a local reply" --stream
node apps/cli/dist/bin.js chat --session demo --prompt "Start a local-first conversation"
node apps/cli/dist/bin.js sessions show demo
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
- 用 `x-search --session <name>` 和 `web-search --session <name>` 在同一个命名会话里继续搜索工作流。
- 用 `sessions show <name>` 打印该命名会话的本地转录记录。
- 用 `sessions list` 和 `sessions delete <name>` 管理本地会话元数据。
- MCP 客户端可在 `grok_chat`、`grok_x_search`、`grok_web_search` 中传入 `previousResponseId` 和 `store` 来显式续接上下文。

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
