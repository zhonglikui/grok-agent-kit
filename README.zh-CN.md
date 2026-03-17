# grok-agent-kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

一个面向 xAI Grok 的社区版、非官方 `CLI + MCP + skills` 工具箱。

`grok-agent-kit` 把同一套 Grok 能力封装给三类使用者：

- 直接通过本地 CLI 使用的人类用户
- 通过 MCP 调用能力的编码代理
- 需要共享搜索指引与接入文档的团队

## 提供的能力

- `grok-agent-kit chat`
- `grok-agent-kit auth`
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
- `grok_list_sessions`
- `grok_get_session`
- `grok_delete_session`

## 运行要求

- Node.js `22+`
- 一个可用的 `XAI_API_KEY`

## 环境变量

在运行 CLI 或 MCP 服务前，先设置这些变量：

```bash
XAI_API_KEY=your_key_here
XAI_BASE_URL=https://api.x.ai/v1
XAI_MANAGEMENT_API_KEY=your_management_key_here
XAI_MANAGEMENT_BASE_URL=https://management-api.x.ai
GROK_AGENT_KIT_MODEL=grok-4
GROK_AGENT_KIT_TIMEOUT_MS=30000
GROK_AGENT_KIT_RETRY_MAX_ATTEMPTS=3
GROK_AGENT_KIT_RETRY_BASE_DELAY_MS=250
GROK_AGENT_KIT_RETRY_MAX_DELAY_MS=4000
```

`XAI_BASE_URL` 可选，默认值为官方 xAI inference base URL。
当前 npm 已发布包官方支持 Node.js `22+`，GitHub Actions 的 CI 与 Trusted Publishing 发布工作流也统一运行在 Node.js 22 上，以保证发布环境与文档基线一致。由于 npm Trusted Publishing 当前要求 npm `11.5.1` 及以上版本，发布工作流会在 Node.js 22 环境内额外升级 npm。

## 快速开始

发布到 npm 后，可以直接这样运行：

```bash
npx -y grok-agent-kit chat --prompt "Hello from Grok"
npx -y grok-agent-kit auth status
npx -y grok-agent-kit auth validate-management
npx -y grok-agent-kit auth list-api-keys --team team_123
npx -y grok-agent-kit auth create-api-key --team team_123 --name "Codex local key"
npx -y grok-agent-kit doctor
npx -y grok-agent-kit chat --prompt "Stream a quick summary" --stream
npx -y grok-agent-kit chat --prompt-file ./context.txt
npx -y grok-agent-kit chat --prompt "Describe this screenshot" --image ./screen.png
npx -y grok-agent-kit chat --prompt "Analyze these logs:" < ./logs.txt
npx -y grok-agent-kit chat --interactive
npx -y grok-agent-kit chat --interactive --session research
npx -y grok-agent-kit chat --session research --prompt "Summarize the latest Grok updates"
npx -y grok-agent-kit chat --session research --prompt "Turn that into a release note draft"
npx -y grok-agent-kit chat --session vision --prompt "Describe this screenshot" --image ./screen.png
npx -y grok-agent-kit chat --session vision --prompt "What changed after that?"
npx -y grok-agent-kit sessions show research
npx -y grok-agent-kit sessions export research --format markdown
npx -y grok-agent-kit x-search --prompt "Latest xAI posts" --stream
npx -y grok-agent-kit web-search --prompt "Latest xAI docs" --stream
npx -y grok-agent-kit x-search --interactive --allow-handle xai
npx -y grok-agent-kit web-search --interactive --session research --allow-domain docs.x.ai
npx -y grok-agent-kit x-search --session research --prompt "Latest xAI posts"
npx -y grok-agent-kit web-search --session research --prompt "Latest xAI docs"
npx -y grok-agent-kit clients codex --mode published
npx -y grok-agent-kit clients claude-code --mode published
npx -y grok-agent-kit clients openclaw --mode local --project-path /absolute/path/to/grok-agent-kit
npx -y grok-agent-kit sessions list
npx -y grok-agent-kit sessions list --search "auth|login" --model grok-4 --limit 5
npx -y grok-agent-kit models
npx -y grok-agent-kit mcp
```

如果你更喜欢先全局安装，也可以这样：

```bash
npm install -g grok-agent-kit
grok-agent-kit doctor
grok-agent-kit chat --prompt "Hello from Grok"
```

本地开发方式：

```bash
npm install
npm test
npm run build
node apps/cli/dist/bin.js doctor
node apps/cli/dist/bin.js auth status
node apps/cli/dist/bin.js auth validate-management
node apps/cli/dist/bin.js auth list-api-keys --team team_123
node apps/cli/dist/bin.js auth create-api-key --team team_123 --name "Codex local key"
node apps/cli/dist/bin.js chat --prompt "Summarize Grok search"
node apps/cli/dist/bin.js chat --prompt "Stream a local reply" --stream
node apps/cli/dist/bin.js chat --prompt-file ./context.txt
node apps/cli/dist/bin.js chat --prompt "Describe this screenshot" --image ./screen.png
Get-Content ./logs.txt | node apps/cli/dist/bin.js chat --prompt "Analyze these logs:"
node apps/cli/dist/bin.js chat --interactive
node apps/cli/dist/bin.js chat --interactive --session demo
node apps/cli/dist/bin.js chat --session demo --prompt "Start a local-first conversation"
node apps/cli/dist/bin.js chat --session vision --prompt "Describe this screenshot" --image ./screen.png
node apps/cli/dist/bin.js chat --session vision --prompt "What changed after that?"
node apps/cli/dist/bin.js sessions show demo
node apps/cli/dist/bin.js sessions export demo --format markdown --output ./demo-session.md
node apps/cli/dist/bin.js x-search --prompt "Find recent xAI posts" --stream
node apps/cli/dist/bin.js web-search --prompt "Find updated xAI docs" --stream
node apps/cli/dist/bin.js x-search --interactive --allow-handle xai
node apps/cli/dist/bin.js web-search --interactive --session demo --allow-domain docs.x.ai
node apps/cli/dist/bin.js x-search --session demo --prompt "Find recent xAI posts"
node apps/cli/dist/bin.js web-search --session demo --prompt "Find updated xAI docs"
node apps/cli/dist/bin.js clients codex --mode local --project-path /absolute/path/to/grok-agent-kit
node apps/cli/dist/bin.js clients claude-code --mode published
node apps/cli/dist/bin.js clients openclaw --mode published
node apps/cli/dist/bin.js sessions list
node apps/cli/dist/bin.js sessions list --search "release|launch" --model grok-4 --limit 3
node apps/cli/dist/bin.js mcp
```

## 客户端配置生成器

当你想快速拿到可直接粘贴的客户端接入片段时，可以使用 `grok-agent-kit clients <client>`：

- `grok-agent-kit clients codex --mode local --project-path /absolute/path/to/grok-agent-kit`
- `grok-agent-kit clients codex --mode published`
- `grok-agent-kit clients claude-code --mode published`
- `grok-agent-kit clients gemini-cli --mode published`
- `grok-agent-kit clients openclaw --mode local --project-path /absolute/path/to/grok-agent-kit`

`local` 模式会生成指向 `apps/cli/dist/bin.js` 的本地开发片段，`published` 模式则会生成适用于 npm 安装场景的 `npx -y grok-agent-kit mcp` 传输片段，或对应客户端的添加命令。

## 会话连续性

`grok-agent-kit` 现在支持 CLI 的本地会话持久化，以及 MCP 客户端显式传入响应链路状态。

- 用 `chat --session <name>` 在多次调用之间继续同一个本地命名会话。
- 用 `chat --interactive` 或 `chat -i` 启动本地 REPL，并逐轮流式输出回复。
- 用 `chat --interactive --session <name>` 在终端 REPL 中恢复并自动保存同一个命名本地会话。
- 用 `chat --reset-session --session <name>` 重置并重新开始该命名会话。
- 用 `chat --image <path>` 一次或多次附加本地 PNG 或 JPEG 图片。
- 交互式 chat 启动时会先打印一行命令提示，也可随时用 `/help` 重新查看可用的 slash 命令。
- 在交互式 chat 中，可用 `/image <path>` 为下一条用户消息临时排队一张本地 PNG 或 JPEG 图片。
- 在交互式 chat 中，可用 `/reset` 清空当前对话；如果绑定了命名会话，也会删除对应的本地会话记录。
- 在交互式 chat 中，可用 `/exit` 干净退出 REPL。
- 用 `chat --stream` 在 xAI 逐步返回内容时直接输出文本增量。
- 用 `x-search --stream` 和 `web-search --stream` 流式输出搜索文本结果。
- 用 `x-search --interactive` 和 `web-search --interactive` 在终端里进入可连续追问的搜索 REPL。
- 交互式 search 启动时也会先打印一行命令提示，也可随时用 `/help` 重新查看可用的 slash 命令。
- 在交互式 search 中，可用 `/reset` 清空当前搜索上下文，也可用 `/exit` 退出 REPL。
- 用 `x-search --session <name>` 和 `web-search --session <name>` 在同一个命名会话里继续搜索工作流。
- 用 `sessions show <name>` 打印该命名会话的本地转录记录；如果有数据，也会显示模型和 token 汇总。
- 用 `sessions list --search <pattern> --model <model> --limit <n>` 过滤更大的本地会话归档。
- 用 `sessions delete <name>` 管理本地会话元数据。
- 用 `sessions export <name> --format markdown|json` 导出保存好的会话，便于分享、备份或后续处理。
- MCP 客户端可在 `grok_chat`、`grok_x_search`、`grok_web_search` 中传入 `previousResponseId` 和 `store` 来显式续接上下文。
- MCP 客户端可向 `grok_chat` 传入 `images: ["/absolute/path/to/screenshot.png"]` 来做本地多模态分析。
- MCP 客户端也可用 `grok_list_sessions`、`grok_get_session`、`grok_delete_session` 管理本地会话。
- MCP 客户端可给 `grok_chat` 传入 `session`，获得类似 CLI 的命名本地会话续接能力。
- MCP 客户端也可向 `grok_x_search` 与 `grok_web_search` 传入 `session` 和 `resetSession`，获得类似 CLI 的命名搜索续接能力。
- 带图片的命名会话会从本地会话归档重放上下文，并以 `store: false` 运行，而不是依赖服务端历史。
- MCP 客户端可对 `grok_chat`、`grok_x_search`、`grok_web_search` 传入 `stream: true`，并请求 MCP progress 通知，以便从 `notifications/progress.params.message` 接收文本增量。

## 导出会话

- `sessions export <name> --format markdown` 会输出适合阅读的 Markdown 研究记录，包含时间、模型、引用来源和 usage 摘要。
- `sessions export <name> --format json` 会输出规范化后的 JSON，便于备份或程序继续处理。
- 加上 `--output <path>` 可以直接把导出结果写入文件。

## 管道与文件输入

- `chat`、`x-search`、`web-search` 都支持 `--prompt-file <path>`，可直接读取 UTF-8 文本文件作为 prompt。
- `chat` 支持 `--image <path>`，可在文本 prompt 之外附加本地 PNG 或 JPEG 图片。
- `chat --system-file <path>` 可从文件读取较长的 system prompt，便于复用。
- 如果命令接收到管道 stdin，会把管道内容追加到 `--prompt` 或 `--prompt-file` 之后，并用一个空行分隔。
- 也可以只使用管道 stdin，不传 `--prompt`，直接把完整 prompt 内容通过管道送入。
- 交互式 chat 需要 TTY，不能和 `--prompt`、`--prompt-file` 或管道 stdin 混用。
- 交互式 `x-search` / `web-search` 也需要 TTY，且不能和 prompt 参数、管道 stdin、`--json`、`--no-store` 混用。

## 诊断

可先运行 `grok-agent-kit doctor` 检查本地环境，再使用 chat、search 或 MCP。

如果你要提交 issue 或异步排查问题，可以加上 `--bundle ./doctor-bundle.json` 导出一份脱敏诊断快照。

当前会检查：

- 是否使用受支持的 Node.js 版本
- `XAI_API_KEY` 是否存在
- `XAI_BASE_URL` 是否为有效 URL
- `XAI_MANAGEMENT_API_KEY` 是否存在
- `XAI_MANAGEMENT_BASE_URL` 是否为有效 URL
- `GROK_AGENT_KIT_MODEL` 是否为空或将回退默认值
- 在本地前置条件有效时，通过 models endpoint 做一次真实的 xAI API 连通性检查
- 在本地前置条件有效时，通过 management key 校验做一次真实的 xAI management API 连通性检查
- 本地状态目录与 `sessions.json` 是否可读

## 认证管理

- 用 `grok-agent-kit auth status` 查看当前本地已经配置了哪些认证路径。
- 用 `grok-agent-kit auth validate-management` 校验 `XAI_MANAGEMENT_API_KEY` 是否能访问 xAI management API。
- 用 `grok-agent-kit auth list-api-keys --team <teamId>` 查看团队下已有的 API key。
- 用 `grok-agent-kit auth create-api-key --team <teamId> --name <name>` 在本地直接创建团队 API key，不需要额外后端服务。
- `XAI_API_KEY` 仍然是 chat、search、MCP 推理流量的默认认证方式。
- `XAI_MANAGEMENT_API_KEY` 是可选的，只在 management API 操作时使用。
- 当前本地 CLI / MCP 工作流不支持浏览器授权；请直接使用 xAI API key。

## 客户端接入文档

- [客户端文档索引](./docs/clients/README.zh-CN.md)
- [Codex](./docs/clients/codex.zh-CN.md)
- [Claude Code](./docs/clients/claude-code.zh-CN.md)
- [Gemini CLI](./docs/clients/gemini-cli.zh-CN.md)
- [OpenClaw](./docs/clients/openclaw.zh-CN.md)
- [MCP 命令式客户端](./docs/clients/mcp-command-clients.zh-CN.md)
- [MCP JSON 配置客户端](./docs/clients/mcp-json-clients.zh-CN.md)
- [MCP 图形界面与市场型客户端](./docs/clients/mcp-gui-clients.zh-CN.md)
- [`SKILL.md` 技能客户端](./docs/clients/skills-skill-md-clients.zh-CN.md)
- [命令式技能客户端](./docs/clients/skills-command-clients.zh-CN.md)

英文版：

- [Client docs index](./docs/clients/README.md)
- [Codex](./docs/clients/codex.md)
- [Claude Code](./docs/clients/claude-code.md)
- [Gemini CLI](./docs/clients/gemini-cli.md)
- [OpenClaw](./docs/clients/openclaw.md)
- [MCP command-managed clients](./docs/clients/mcp-command-clients.md)
- [MCP JSON-config clients](./docs/clients/mcp-json-clients.md)
- [MCP GUI and marketplace clients](./docs/clients/mcp-gui-clients.md)
- [Skill `SKILL.md` clients](./docs/clients/skills-skill-md-clients.md)
- [Skill command-managed clients](./docs/clients/skills-command-clients.md)

## 社区与发布

- 提交 PR 前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 漏洞反馈请查看 [SECURITY.md](./SECURITY.md)
- 社区协作行为规范见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- 在 npm 中为当前仓库配置 Trusted Publishing 后，可通过 `.github/workflows/publish.yml` 在 GitHub Actions 中发布
- 面向公开 npm 发布前，请先使用[发布清单](./docs/release/launch-checklist.zh-CN.md)
- 准备 npm、MCP、skills 社区文案时，可复用[社区上架模板](./docs/release/community-listings.zh-CN.md)

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
