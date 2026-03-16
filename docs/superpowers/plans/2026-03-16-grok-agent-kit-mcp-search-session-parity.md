# grok-agent-kit MCP Search Session Parity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add named local session and reset support to MCP X Search and Web Search so agent clients get the same local-first continuity already available in the CLI and `grok_chat`.

**Architecture:** Extend the MCP search input schemas with `session` and `resetSession`, reuse the shared file-backed `SessionStore`, and persist search turns with the existing session-history entry format so chat and search can continue the same named session interchangeably.

**Tech Stack:** TypeScript, MCP SDK, Zod, Vitest, Node.js fs APIs

---

## Chunk 1: MCP search-session tests

### Task 1: Add failing tests for search session resume, persistence, and reset

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\test\tool-handlers.test.ts`

- [ ] **Step 1: Write a failing test for `grok_x_search` using `session`**
- [ ] **Step 2: Write a failing test for `grok_web_search` using `session`**
- [ ] **Step 3: Write a failing test for `resetSession` behavior**
- [ ] **Step 4: Run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` and verify failure**

## Chunk 2: MCP handler and schema support

### Task 2: Implement search-session parity in the MCP server

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\tool-handlers.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\mcp-server\src\server.ts`

- [ ] **Step 1: Add `session` and `resetSession` to MCP X Search and Web Search input types**
- [ ] **Step 2: Reuse the shared session store for named search sessions**
- [ ] **Step 3: Persist search turns with `createSessionHistoryEntry()`**
- [ ] **Step 4: Re-run `npm test -- packages/mcp-server/test/tool-handlers.test.ts` until it passes**

## Chunk 3: Docs and verification

### Task 3: Document MCP search-session parity

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.zh-CN.md`

- [ ] **Step 1: Add English MCP search-session examples**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Note that chat and search share the same local named sessions**

### Task 4: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
