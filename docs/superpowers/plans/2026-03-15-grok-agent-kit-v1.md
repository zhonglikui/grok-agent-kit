# grok-agent-kit v1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working `grok-agent-kit` monorepo with a publishable CLI, a local stdio MCP server, and skill/client docs for xAI Grok.

**Architecture:** The CLI and MCP server share one domain layer in `packages/core`, which depends on a lightweight REST client in `packages/xai-client`. Skills and client examples stay outside runtime packages so they can evolve independently from code.

**Tech Stack:** TypeScript, Node.js, npm workspaces, Vitest, Commander, Zod, `@modelcontextprotocol/sdk`

---

## Chunk 1: Workspace and Tooling

### Task 1: Create workspace manifests

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `tsconfig.build.json`
- Create: `.gitignore`

- [ ] **Step 1: Create workspace and test scripts**
- [ ] **Step 2: Add workspace references for `apps/*` and `packages/*`**
- [ ] **Step 3: Add TypeScript and Vitest configuration**
- [ ] **Step 4: Verify root scripts parse with `npm run test -- --help`**

### Task 2: Create package shells

**Files:**
- Create: `apps/cli/package.json`
- Create: `apps/cli/tsconfig.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/mcp-server/package.json`
- Create: `packages/mcp-server/tsconfig.json`
- Create: `packages/skill-utils/package.json`
- Create: `packages/skill-utils/tsconfig.json`
- Create: `packages/xai-client/package.json`
- Create: `packages/xai-client/tsconfig.json`

- [ ] **Step 1: Create workspace package manifests**
- [ ] **Step 2: Wire TypeScript project references**
- [ ] **Step 3: Verify `npm install` completes**

## Chunk 2: xAI Client (TDD)

### Task 3: Write failing tests for REST client

**Files:**
- Create: `packages/xai-client/test/xai-client.test.ts`
- Create: `packages/xai-client/src/index.ts`
- Create: `packages/xai-client/src/types.ts`
- Create: `packages/xai-client/src/xai-client.ts`

- [ ] **Step 1: Write tests for `/responses` request construction**
- [ ] **Step 2: Run `npm test -- packages/xai-client/test/xai-client.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal REST client with fetch injection**
- [ ] **Step 4: Re-run the same test until it passes**
- [ ] **Step 5: Add tests for `/models` and HTTP error handling**
- [ ] **Step 6: Run tests again and keep them green**

## Chunk 3: Core Services (TDD)

### Task 4: Write failing tests for chat and search services

**Files:**
- Create: `packages/core/test/grok-service.test.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/config.ts`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/grok-service.ts`

- [ ] **Step 1: Write tests for chat, X Search, Web Search, and models behaviors**
- [ ] **Step 2: Run `npm test -- packages/core/test/grok-service.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal service layer and validation**
- [ ] **Step 4: Re-run targeted tests until they pass**

## Chunk 4: CLI (TDD)

### Task 5: Write failing tests for CLI command dispatch

**Files:**
- Create: `apps/cli/test/cli.test.ts`
- Create: `apps/cli/src/index.ts`
- Create: `apps/cli/src/bin.ts`
- Create: `apps/cli/src/commands/chat.ts`
- Create: `apps/cli/src/commands/x-search.ts`
- Create: `apps/cli/src/commands/web-search.ts`
- Create: `apps/cli/src/commands/models.ts`
- Create: `apps/cli/src/commands/mcp.ts`
- Create: `apps/cli/src/output.ts`

- [ ] **Step 1: Write tests for command parsing and handler invocation**
- [ ] **Step 2: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**
- [ ] **Step 3: Implement minimal CLI around Commander**
- [ ] **Step 4: Re-run targeted tests until they pass**

## Chunk 5: MCP Server (TDD)

### Task 6: Write failing tests for MCP tool handlers

**Files:**
- Create: `packages/mcp-server/test/tool-handlers.test.ts`
- Create: `packages/mcp-server/src/index.ts`
- Create: `packages/mcp-server/src/server.ts`
- Create: `packages/mcp-server/src/tool-handlers.ts`

- [ ] **Step 1: Write tests for `grok_chat`, `grok_x_search`, `grok_web_search`, and `grok_models` handlers**
- [ ] **Step 2: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**
- [ ] **Step 3: Implement handler layer and stdio server bootstrap**
- [ ] **Step 4: Re-run targeted tests until they pass**

## Chunk 6: Skills, Examples, and Docs

### Task 7: Add community-facing docs

**Files:**
- Create: `README.md`
- Create: `docs/clients/codex.md`
- Create: `docs/clients/claude-code.md`
- Create: `docs/clients/openclaw.md`
- Create: `examples/clients/codex-config.toml`
- Create: `examples/clients/claude-code-config.json`
- Create: `examples/clients/openclaw-config.json`
- Create: `skills/shared/grok-search-guidance.md`
- Create: `skills/claude-code/SKILL.md`
- Create: `skills/codex/README.md`
- Create: `skills/openclaw/SKILL.md`

- [ ] **Step 1: Document install and config snippets for each client**
- [ ] **Step 2: Add portable skill guidance files**
- [ ] **Step 3: Verify docs reference the actual CLI and MCP commands**

## Chunk 7: Final Verification

### Task 8: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm install` at repo root**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Run `node apps/cli/dist/bin.js --help` or built equivalent**
- [ ] **Step 5: Report status using the fresh command outputs**
