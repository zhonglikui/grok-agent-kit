# grok-agent-kit Client Patterns Design

**Date:** 2026-03-17  
**Project:** `grok-agent-kit`  
**Feature:** Group client MCP and skill integrations by configuration pattern

## Goal

Extend `grok-agent-kit` from three hand-written client guides into a broader, pattern-based client integration surface that is easier to maintain and easier to publish.

## Why this slice next

The project already ships:

- a published npm package
- a working local CLI
- a working stdio MCP server
- reusable skill content for Codex, Claude Code, and OpenClaw

The next leverage point is distribution. More clients can use the same product if the repo clearly documents:

- which clients support MCP
- which clients support skills
- whether setup happens through CLI commands, JSON config, or GUI / marketplace flows
- how to reuse the same `npx -y grok-agent-kit mcp` transport across those environments

## Product behavior

This slice adds one new first-class generator target and broadens the docs surface:

- keep `Codex`, `Claude Code`, and `OpenClaw` as first-class generator targets
- add `Gemini CLI` as a first-class generator target because it supports command-based MCP and command-based skill management
- document the remaining major clients in grouped guides instead of bespoke per-client code paths

## Grouping model

### MCP groups

1. **Command-managed CLI clients**
   - `Claude Code`
   - `Gemini CLI`
   - use one-shot install commands instead of editing raw files by hand

2. **JSON-config MCP clients**
   - `OpenClaw`
   - `Qwen Code`
   - `Trae` project MCP
   - share the `mcpServers` JSON shape with `command` / `args` / `env`

3. **GUI or marketplace MCP clients**
   - `Cursor`
   - `Windsurf`
   - `Cherry Studio`
   - `LobeHub / LobeChat`
   - `GitHub Copilot`
   - `通义灵码`
   - guide users with manual steps and ready-to-paste transport snippets

### Skill groups

1. **`SKILL.md` directory clients**
   - `Codex`
   - `Claude Code`
   - `Trae`
   - `Qwen Code`
   - document folder layout, metadata header, and optional extra resources

2. **Command-managed skills**
   - `Gemini CLI`
   - use `gemini skills link` / `install` rather than raw file placement as the main path

3. **UI or partial-skill ecosystems**
   - `通义灵码`
   - `Kimi Code`
   - `LobeHub / LobeChat`
   - `Cherry Studio`
   - document the current supported path without pretending all products share the same skill standard

## Documentation scope

Update and add:

- `README.md`
- `README.zh-CN.md`
- `apps/cli/README.md`
- `docs/clients/README.md`
- `docs/clients/README.zh-CN.md`
- `docs/clients/gemini-cli.md`
- `docs/clients/gemini-cli.zh-CN.md`
- `docs/clients/mcp-command-clients.md`
- `docs/clients/mcp-command-clients.zh-CN.md`
- `docs/clients/mcp-json-clients.md`
- `docs/clients/mcp-json-clients.zh-CN.md`
- `docs/clients/mcp-gui-clients.md`
- `docs/clients/mcp-gui-clients.zh-CN.md`
- `docs/clients/skills-skill-md-clients.md`
- `docs/clients/skills-skill-md-clients.zh-CN.md`
- `docs/clients/skills-command-clients.md`
- `docs/clients/skills-command-clients.zh-CN.md`
- `skills/gemini-cli/SKILL.md`
- `examples/clients/gemini-cli-command.txt`

## Non-goals

- adding hosted services
- implementing browser auth
- claiming feature parity for clients that only partially expose MCP or skills
- adding unstable GUI automation for third-party desktop tools

## Testing strategy

- extend CLI tests for the new `gemini-cli` generator target
- extend doc alignment tests so the new grouped guides are required
- extend example alignment tests for the new generated example artifact
- keep skill alignment tests aware of the new Gemini-specific skill asset
