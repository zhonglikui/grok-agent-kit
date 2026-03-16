# 命令式技能客户端

[English](./skills-command-clients.md) | [简体中文](./skills-command-clients.zh-CN.md)

这组客户端主要通过自身 CLI 命令来管理 skills，而不是把“手动放文件”作为主流程。

## 本组客户端

- `Gemini CLI`

## 推荐流程

开发调试阶段，优先使用实时联动的本地 link：

```bash
gemini skills link /absolute/path/to/grok-agent-kit/skills/gemini-cli
gemini skills list
```

如果你希望安装成复制版本，则使用：

```bash
gemini skills install /absolute/path/to/grok-agent-kit/skills/gemini-cli
```

## 为什么要单独分组

- skill 的载体仍然是 `SKILL.md` 目录
- 但主要的安装 / 启用 / 禁用动作由 `gemini skills ...` 负责
- 这样写成独立说明，比要求用户自己手动拷文件更稳定

## 常用辅助命令

- `gemini skills list`
- `gemini skills enable <name>`
- `gemini skills disable <name>`
- `gemini skills uninstall <name>`

## `grok-agent-kit` 对应资产

使用：

- `skills/gemini-cli/SKILL.md`

这个资产和 Codex / Claude Code 版本保持同样的“先搜索、后综合”路由规则。
