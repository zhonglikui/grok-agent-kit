# `SKILL.md` 技能客户端

[English](./skills-skill-md-clients.md) | [简体中文](./skills-skill-md-clients.zh-CN.md)

这组客户端以“包含 `SKILL.md` 的目录”作为主要 skill 单元。

## 本组客户端

- `Codex`
- `Claude Code`
- `Qwen Code`
- `Trae`

## 共享的 Skill 目录结构

```text
skill-name/
├── SKILL.md
├── examples/
├── templates/
└── resources/
```

`SKILL.md` 通常包含 YAML frontmatter 和 Markdown 指令；其余支持文件可选。

## 本仓库已提供的 Skill 资产

- Codex：仓库根目录 `SKILL.md` + `skills/codex/README.md`
- Claude Code：`skills/claude-code/SKILL.md`
- Gemini CLI：`skills/gemini-cli/SKILL.md`（安装方式是命令式，见单独文档）
- OpenClaw：`skills/openclaw/SKILL.md`

## 各客户端补充说明

### Codex

- 使用仓库根目录 `SKILL.md` 作为可安装的指导资产
- 同时配合 `docs/clients/codex.zh-CN.md` 里的 MCP 接入说明

### Claude Code

- 使用 `skills/claude-code/SKILL.md`
- 建议先把 MCP 服务装好，再启用 skill，这样 skill 才有可调用的工具

### Qwen Code

- 个人 skills 放在 `~/.qwen/skills/<skill-name>/SKILL.md`
- 项目 skills 放在 `.qwen/skills/<skill-name>/SKILL.md`
- 支持在 `SKILL.md` 同目录下放额外脚本、模板和参考文件

### Trae

- 项目 skills 放在 `.trae/skills/<skill-name>/SKILL.md`
- 中文桌面版的全局 skills 放在 `~/.trae-cn/skills/<skill-name>/SKILL.md`
- 也支持通过 UI 导入包含 `SKILL.md` 的目录或 ZIP

## 推荐的 `grok-agent-kit` skill 设计

Skill 内容应聚焦在路由规则：

- `grok_x_search`：处理 X / Twitter 上的新鲜内容
- `grok_web_search`：处理文档和更广泛的网页证据
- `grok_chat`：在搜索之后负责综合、整理和起草
- `session` / `resetSession`：处理连续性

不要把复杂的客户端安装步骤塞进 skill 本体；安装步骤留在客户端文档中更稳定。
