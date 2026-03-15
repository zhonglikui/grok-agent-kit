# Codex setup

## Local development config

Use the built local CLI during development:

```toml
[mcp_servers.grok-agent-kit]
command = "node"
args = ["D:\\work\\typescript\\grok-agent-kit\\apps\\cli\\dist\\bin.js", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

## Intended published config

After npm publication:

```toml
[mcp_servers.grok-agent-kit]
command = "npx"
args = ["-y", "grok-agent-kit", "mcp"]
env = { XAI_API_KEY = "YOUR_XAI_API_KEY" }
```

## When to use Grok tools

- use `grok_x_search` for questions grounded in X posts
- use `grok_web_search` for documentation and web evidence
- use `grok_chat` for synthesis after search
- use `grok_models` to inspect model availability
