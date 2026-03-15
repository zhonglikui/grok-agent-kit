# Claude Code 接入说明

[English](./claude-code.md) | [简体中文](./claude-code.zh-CN.md)

## 本地开发命令

```bash
claude mcp add grok-agent-kit --scope user node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

启动 Claude Code 前请先设置 `XAI_API_KEY`，或者使用客户端自身的 MCP 环境变量配置能力。

## 发布后的 npm 命令

```bash
claude mcp add grok-agent-kit --scope user npx -y grok-agent-kit mcp
```

## Skill 文件

`skills/claude-code/SKILL.md` 可作为 Claude Code 风格工作流中的安装型 skill 内容。

## 示例配置

如果你更习惯用 JSON 方式管理 MCP 配置，可以从 `examples/clients/claude-code-config.json` 开始。
