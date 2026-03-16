# MCP 图形界面与市场型客户端

[English](./mcp-gui-clients.md) | [简体中文](./mcp-gui-clients.zh-CN.md)

这组产品的 MCP 接入主要依赖设置界面、添加服务器弹窗，或者市场 / 社区入口。

## 本组客户端

- `Cursor`
- `Windsurf`
- `Cherry Studio`
- `LobeHub / LobeChat`
- `GitHub Copilot`
- `通义灵码`
- `Kimi Code`

## 统一的手动接入映射

如果界面要求填写 MCP 服务器字段，可按下面的映射填写：

- **名称：** `grok-agent-kit`
- **类型 / 传输：** `STDIO` 或本地命令
- **命令：** `npx`
- **参数：** `-y`, `grok-agent-kit`, `mcp`
- **环境变量 / 密钥：** `XAI_API_KEY=YOUR_XAI_API_KEY`

如果你接的是本地开发仓库，则改为：

- **命令：** `node`
- **参数：** `/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js`, `mcp`

## 各产品说明

### Cherry Studio

- 官方流程以图形界面为主：打开设置，进入 MCP 服务器，手动添加服务
- 它的表单字段可以直接映射到上面的 `STDIO` 传输结构

### Cursor 与 Windsurf

- 这类 IDE 集成变化较快
- 在本仓库中优先提供“手动添加服务器”的通用说明，而不是写死某个配置文件路径

### GitHub Copilot

- MCP 存在，但接入面比命令式客户端更偏产品内部实现
- 当前建议保持为文档手动接入

### 通义灵码

- 官方文档已确认 MCP 与 skills 都支持
- 但具体配置面仍偏产品特定，因此本仓库暂时保持文档手动接入

### Kimi Code

- MCP 能力存在，但更广义的扩展生态仍在演进
- 目前建议按官方最新文档手动确认，不在仓库里写死自动化接入

### LobeHub / LobeChat

- 更适合被看作 MCP 的发现 / 分发入口，而不是 `grok-agent-kit clients` 的一等目标
- 当产品支持自定义 MCP 注册时，可直接复用本项目的 stdio 传输片段

## 实用建议

如果某个产品同时支持“市场安装”和“自定义命令”，优先选择自定义命令，这样可以保留本地优先的 `XAI_API_KEY` 路径，也能避免第三方包装层。
