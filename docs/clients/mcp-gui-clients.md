# MCP GUI and marketplace clients

[English](./mcp-gui-clients.md) | [简体中文](./mcp-gui-clients.zh-CN.md)

This group covers products where MCP setup is mainly driven through a settings screen, add-server dialog, or marketplace flow.

## Clients in this group

- `Cursor`
- `Windsurf`
- `Cherry Studio`
- `LobeHub / LobeChat`
- `GitHub Copilot`
- `通义灵码`
- `Kimi Code`

## Shared manual setup pattern

When the UI asks for MCP server fields, map them like this:

- **Name:** `grok-agent-kit`
- **Type / Transport:** `STDIO` or local command
- **Command:** `npx`
- **Args:** `-y`, `grok-agent-kit`, `mcp`
- **Env / secret:** `XAI_API_KEY=YOUR_XAI_API_KEY`

For a local development clone, replace the command and args with:

- **Command:** `node`
- **Args:** `/absolute/path/to/grok-agent-kit/apps/cli/dist/bin.js`, `mcp`

## Product notes

### Cherry Studio

- The official flow is GUI-first: open settings, go to MCP servers, and add a server manually.
- Its form-based setup maps cleanly to the shared `STDIO` transport fields above.

### Cursor and Windsurf

- Treat these as fast-moving GUI integrations.
- Prefer a manual add-server flow with the same published transport snippet instead of repo-automated file edits.

### GitHub Copilot

- MCP exists, but the integration surface is more product-specific than the command-first clients above.
- Treat it as docs-only manual setup for now.

### 通义灵码

- Official docs confirm both MCP and skills support.
- Keep the integration manual in this repository until the config surface stabilizes.

### Kimi Code

- MCP support exists, but the broader extensibility surface is still evolving publicly.
- Treat it as manual / verify-upstream before scripting.

### LobeHub / LobeChat

- Best treated as an MCP discovery and distribution surface instead of a first-class `grok-agent-kit clients` target.
- Use this project’s transport snippet when the product exposes custom MCP registration.

## Practical recommendation

If a product offers both marketplace and custom command entry, prefer custom command entry first so you keep the local-first `XAI_API_KEY` path and avoid third-party wrappers.
