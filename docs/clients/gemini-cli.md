# Gemini CLI setup

[English](./gemini-cli.md) | [简体中文](./gemini-cli.zh-CN.md)

## Published package command

Set `XAI_API_KEY` in the same shell, then add the MCP server:

```bash
grok-agent-kit clients gemini-cli --mode published
gemini mcp add grok-agent-kit npx -y grok-agent-kit mcp
```

The checked-in example is:

- `examples/clients/gemini-cli-command.txt`

## Local development command

Build the CLI first, then point Gemini CLI at your local clone:

```bash
grok-agent-kit clients gemini-cli --mode local --project-path /absolute/path/to/grok-agent-kit
gemini mcp add grok-agent-kit node /absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js mcp
```

## Environment

Gemini CLI manages MCP servers through commands, so the most reliable setup is to export credentials in the host shell before launching Gemini CLI:

```bash
export XAI_API_KEY=your_key_here
export XAI_MANAGEMENT_API_KEY=your_management_key_here
gemini
```

`XAI_MANAGEMENT_API_KEY` is optional and only needed for local management commands outside MCP.

## Skill asset

Use the Gemini-specific skill directory from this repository:

```bash
gemini skills link /absolute/path/to/grok-agent-kit/skills/gemini-cli
gemini skills list
```

If you want a copied install instead of a live link, use `gemini skills install <source>` with a local path or git source.

## Stateful MCP usage

Gemini CLI can use the same continuity controls as other MCP clients:

- `previousResponseId` to continue an earlier xAI response chain
- `store: true` to keep a response chain resumable
- `session` on `grok_chat` to resume a named local session
- `images` on `grok_chat` to attach local screenshots or photos
- `session` and `resetSession` on `grok_x_search` / `grok_web_search` to run named multi-turn search flows
- `grok_list_sessions`, `grok_get_session`, and `grok_delete_session` for local session management

## Useful local CLI companions

Outside MCP, these local commands pair well with Gemini CLI:

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`
