# Client setup docs

[English](./README.md) | [简体中文](./README.zh-CN.md)

Use these guides to connect `grok-agent-kit` to major agent clients without maintaining one bespoke setup path per product.

## Before you start

- replace `/absolute/path/to/grok-agent-kit` with your own clone path
- build the local CLI first when using local development mode
- set `XAI_API_KEY` in the host environment or client-specific MCP env config
- set `XAI_MANAGEMENT_API_KEY` only if you also plan to use local auth-management commands such as `grok-agent-kit auth status`

## First-class client generators

These clients have built-in `grok-agent-kit clients <client>` output:

- [Codex](./codex.md)
- [Claude Code](./claude-code.md)
- [Gemini CLI](./gemini-cli.md)
- [OpenClaw](./openclaw.md)

Generator examples:

- `grok-agent-kit clients codex --mode local --project-path /absolute/path/to/grok-agent-kit`
- `grok-agent-kit clients codex --mode published`
- `grok-agent-kit clients claude-code --mode published`
- `grok-agent-kit clients gemini-cli --mode published`
- `grok-agent-kit clients openclaw --mode local --project-path /absolute/path/to/grok-agent-kit`

## Grouped MCP guides

- [MCP command-managed clients](./mcp-command-clients.md)
- [MCP JSON-config clients](./mcp-json-clients.md)
- [MCP GUI and marketplace clients](./mcp-gui-clients.md)

## Grouped skill guides

- [Skill `SKILL.md` clients](./skills-skill-md-clients.md)
- [Skill command-managed clients](./skills-command-clients.md)

## Client matrix

| Client | MCP | Skills | Primary pattern | Shipping level |
| --- | --- | --- | --- | --- |
| Codex | Yes | Yes | TOML MCP + project guidance | first-class |
| Claude Code | Yes | Yes | command-managed MCP + `SKILL.md` | first-class |
| Gemini CLI | Yes | Yes | command-managed MCP + command-managed skills | first-class |
| OpenClaw | Yes | Yes | `mcpServers` JSON + repo skill | first-class |
| Qwen Code | Yes | Yes | `settings.json` + `SKILL.md` directories | grouped docs |
| Trae | Yes | Yes | `.trae/mcp.json` + `.trae/skills/` | grouped docs |
| Cursor | Yes | partial / custom | GUI MCP add flow | grouped docs |
| Windsurf | Yes | partial / custom | GUI MCP add flow | grouped docs |
| Cherry Studio | Yes | no standard shared format | GUI MCP add flow | grouped docs |
| LobeHub / LobeChat | marketplace / manual | partial / community | marketplace-first | grouped docs |
| GitHub Copilot | Yes | Yes | closed / product-specific | docs-only manual |
| 通义灵码 | Yes | Yes | product-specific | docs-only manual |
| Kimi Code | Yes | evolving / partial | product-specific | docs-only manual |

## Recommended local companion commands

These are optional local terminal workflows outside MCP, but they pair well with agent clients:

- `grok-agent-kit chat --interactive`
- `grok-agent-kit x-search --interactive`
- `grok-agent-kit web-search --interactive`
- `grok-agent-kit auth status`

## Streaming note

- `grok_chat`, `grok_x_search`, and `grok_web_search` support `stream: true` over MCP.
- Compatible clients can request MCP progress notifications and read delta text from `notifications/progress.params.message`.
- Client support for rendering progress notifications varies by product and version.

## Local session note

- `grok_chat` accepts `session` for CLI-style named local session continuation.
- `grok_chat` accepts `images: ["/absolute/path/to/file.png"]` for local PNG/JPEG analysis.
- `grok_chat`, `grok_x_search`, and `grok_web_search` accept `previousResponseId` and `store` for explicit response chaining.
- `grok_x_search` and `grok_web_search` also accept `session` and `resetSession` for named local search workflows.
- `grok_list_sessions`, `grok_get_session`, and `grok_delete_session` provide local session management over MCP.
- Image-backed named chat sessions replay from the local archive with `store: false` instead of relying on server-side history.

## Auth note

- `XAI_API_KEY` is the required runtime credential for chat, search, and MCP inference.
- `XAI_MANAGEMENT_API_KEY` is optional and only needed for local management API commands such as `grok-agent-kit auth validate-management`.
- Browser auth is not part of the shipped local CLI/MCP path.

## Example configs and artifacts

- `examples/clients/codex-config.toml`
- `examples/clients/claude-code-config.json`
- `examples/clients/openclaw-config.json`
- `examples/clients/gemini-cli-command.txt`
